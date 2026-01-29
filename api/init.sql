-- Database initialization script for Biskaken Auto Admin
-- This script will be executed when PostgreSQL container starts for the first time

-- Set timezone
SET timezone = 'UTC';

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS biskaken_auto;

-- Connect to the database
-- \c biskaken_auto;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'SUB_ADMIN', 'STAFF');
CREATE TYPE job_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE job_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE invoice_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE blog_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Users table with proper constraints
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'STAFF',
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table with comprehensive vehicle info
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    -- Vehicle information
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year VARCHAR(4),
    vehicle_plate VARCHAR(20),
    vehicle_vin VARCHAR(50),
    vehicle_color VARCHAR(50),
    vehicle_mileage INTEGER,
    -- Customer metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    preferred_contact VARCHAR(20) DEFAULT 'phone', -- phone, email, sms
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs/Service Orders table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    job_number VARCHAR(50) UNIQUE, -- Human readable job number like "J2024-001"
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255), -- Denormalized for performance
    vehicle_info TEXT, -- Formatted vehicle description
    issue_description TEXT NOT NULL,
    diagnosis TEXT,
    work_performed TEXT,
    status job_status DEFAULT 'PENDING',
    priority job_priority DEFAULT 'MEDIUM',
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    labor_hours DECIMAL(5,2) DEFAULT 0,
    labor_rate DECIMAL(8,2) DEFAULT 50,
    parts_cost DECIMAL(10,2) DEFAULT 0,
    assigned_to INTEGER REFERENCES users(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job parts/items used
CREATE TABLE IF NOT EXISTS job_items (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory management
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    description TEXT,
    stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 5,
    max_stock INTEGER,
    unit_price DECIMAL(10,2) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    supplier_contact TEXT,
    location VARCHAR(100), -- Shelf/bin location
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock movements/transactions
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL, -- IN, OUT, ADJUSTMENT, TRANSFER
    quantity INTEGER NOT NULL,
    reference_id INTEGER, -- Job ID or supplier invoice ID
    reference_type VARCHAR(20), -- JOB, PURCHASE, ADJUSTMENT
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices and billing
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    invoice_number VARCHAR(50) UNIQUE,
    job_id INTEGER REFERENCES jobs(id),
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.0000, -- e.g., 0.1250 for 12.5%
    tax_amount DECIMAL(10,2) GENERATED ALWAYS AS (subtotal * tax_rate) STORED,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate) - discount_amount) STORED,
    status invoice_status DEFAULT 'PENDING',
    due_date DATE,
    paid_date DATE,
    payment_method VARCHAR(50), -- CASH, CARD, MOBILE_MONEY, BANK_TRANSFER
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(8,3) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog/Content Management
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE, -- URL-friendly version
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url TEXT,
    meta_description TEXT,
    tags TEXT[], -- PostgreSQL array of tags
    status blog_status DEFAULT 'DRAFT',
    author_id INTEGER REFERENCES users(id),
    author_name VARCHAR(255), -- Denormalized
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System notifications/alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- INFO, WARNING, ERROR, SUCCESS
    category VARCHAR(50), -- INVENTORY, PAYMENT, SYSTEM, JOB
    user_id INTEGER REFERENCES users(id), -- NULL for system-wide notifications
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT, -- Optional link for user to take action
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit trail for important actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
    entity_type VARCHAR(50) NOT NULL, -- USER, JOB, INVOICE, etc.
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings/configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_vehicle_plate ON customers(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, is_read);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password should be changed immediately)
INSERT INTO users (name, email, role, password_hash) VALUES 
('Admin User', 'admin@biskaken.com', 'ADMIN', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewDaTmQJ7bH4JX.G') -- password: admin123
ON CONFLICT (email) DO NOTHING;

-- Insert some default system settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
('company_name', 'Biskaken Auto', 'Company name displayed in the application', true),
('company_address', 'Accra, Ghana', 'Company physical address', true),
('company_phone', '+233-XXX-XXXX', 'Company contact phone number', true),
('company_email', 'info@biskaken.com', 'Company contact email', true),
('tax_rate', '0.0000', 'Default tax rate for invoices (as decimal, e.g., 0.1250 for 12.5%)', false),
('default_labor_rate', '50.00', 'Default hourly labor rate in local currency', false),
('low_stock_threshold', '5', 'Global low stock alert threshold', false),
('invoice_prefix', 'INV', 'Prefix for invoice numbers', false),
('job_prefix', 'J', 'Prefix for job numbers', false)
ON CONFLICT (key) DO NOTHING;