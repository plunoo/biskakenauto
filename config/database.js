const { Pool } = require('pg');

// Database configuration based on environment
const getDatabaseConfig = () => {
  // Check if we're in demo mode (for development/testing)
  if (process.env.DEMO_MODE === 'true') {
    console.log('🔧 Database: Running in DEMO MODE - no real database connection');
    return null;
  }

  // Use DATABASE_URL if available (standard for PostgreSQL)
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  // Use individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'biskaken_auto',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 2000, // How long to wait when connecting to database
  };
};

let pool = null;

// Initialize database connection
const initDatabase = async () => {
  const config = getDatabaseConfig();
  
  if (!config) {
    console.log('🔧 Database: Running in demo mode - no database initialization needed');
    return { success: true, mode: 'demo' };
  }

  try {
    pool = new Pool(config);
    
    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connected successfully:', {
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version.split(' ')[0]
    });
    client.release();
    
    // Create tables if they don't exist
    await createTables();
    
    return { success: true, mode: 'production', pool };
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Fall back to demo mode if database connection fails
    console.log('🔄 Falling back to demo mode...');
    pool = null;
    return { success: false, mode: 'demo', error: error.message };
  }
};

// Create database tables
const createTables = async () => {
  if (!pool) return;

  try {
    const client = await pool.connect();
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'STAFF',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        plate_number VARCHAR(20),
        vehicle_make VARCHAR(50),
        vehicle_model VARCHAR(50),
        vehicle_year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        customer_name VARCHAR(100),
        vehicle_info TEXT,
        issue_description TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        estimated_cost DECIMAL(10,2) DEFAULT 0,
        labor_hours DECIMAL(5,2) DEFAULT 0,
        labor_rate DECIMAL(8,2) DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        sku VARCHAR(50) UNIQUE,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 5,
        unit_price DECIMAL(10,2) DEFAULT 0,
        category VARCHAR(50),
        supplier VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        job_id INTEGER REFERENCES jobs(id),
        invoice_number VARCHAR(50) UNIQUE,
        subtotal DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        grand_total DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'PENDING',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blog posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE,
        excerpt TEXT,
        content TEXT,
        featured_image_url TEXT,
        author_id INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'DRAFT',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user if not exists
    await client.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ('Admin User', 'admin@biskaken.com', '$2b$10$dummy.hash.for.demo', 'ADMIN')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✅ Database tables created/verified successfully');
    client.release();
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
};

// Get database connection (returns null if in demo mode)
const getDB = () => pool;

// Execute query with demo fallback
const query = async (text, params = []) => {
  if (!pool) {
    console.log('🔄 Database query skipped - running in demo mode');
    return { rows: [], rowCount: 0 };
  }

  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

// Check database health
const checkHealth = async () => {
  if (!pool) {
    return {
      status: 'demo',
      message: 'Running in demo mode',
      connected: false
    };
  }

  try {
    const result = await pool.query('SELECT NOW() as current_time');
    return {
      status: 'connected',
      message: 'Database connection healthy',
      connected: true,
      time: result.rows[0].current_time
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      connected: false
    };
  }
};

module.exports = {
  initDatabase,
  getDB,
  query,
  checkHealth
};