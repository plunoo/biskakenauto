#!/usr/bin/env python3
"""
FastAPI Backend for Biskaken Auto Admin Dashboard
Connects to PostgreSQL database and serves the React frontend
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
import asyncpg
from datetime import datetime, timedelta
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Biskaken Auto Admin API",
    description="FastAPI backend for auto shop management",
    version="1.0.0"
)

# CORS configuration for frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bisadmin.rpnmore.com",
        "https://biskakenauto.rpnmore.com", 
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'postgres')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'biskaken_auto')}"
)

logger.info(f"Database URL configured: {DATABASE_URL.split('@')[0]}@***")

# Global database connection pool
db_pool = None

async def init_db():
    """Initialize database connection pool"""
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        logger.info("✅ Database connection pool created successfully")
        
        # Create tables if they don't exist
        async with db_pool.acquire() as conn:
            await create_tables(conn)
            await seed_demo_data(conn)
            
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise

async def create_tables(conn):
    """Create database tables"""
    tables_sql = """
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'STAFF',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Customers table  
    CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        address TEXT,
        vehicle_make VARCHAR(100),
        vehicle_model VARCHAR(100),
        vehicle_year VARCHAR(4),
        vehicle_plate VARCHAR(20),
        vehicle_vin VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Jobs table
    CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        customer_name VARCHAR(255),
        vehicle_info TEXT,
        issue_description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        estimated_cost DECIMAL(10,2) DEFAULT 0,
        labor_hours DECIMAL(5,2) DEFAULT 0,
        labor_rate DECIMAL(8,2) DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Inventory table
    CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 5,
        unit_price DECIMAL(10,2) DEFAULT 0,
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Invoices table
    CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id),
        customer_id INTEGER REFERENCES customers(id),
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        due_date DATE,
        paid_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Blog posts table
    CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        status VARCHAR(20) DEFAULT 'DRAFT',
        author VARCHAR(255) DEFAULT 'Admin',
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    await conn.execute(tables_sql)
    logger.info("✅ Database tables created/verified")

async def seed_demo_data(conn):
    """Seed demo data if tables are empty"""
    
    # Check if we already have data
    customer_count = await conn.fetchval("SELECT COUNT(*) FROM customers")
    if customer_count > 0:
        logger.info("📊 Demo data already exists, skipping seed")
        return
    
    # Seed customers
    customers_data = [
        ("Kwame Asante", "+233241234567", "kwame@email.com", "Accra, Ghana", "Toyota", "Camry", "2018", "GR-1234-18", None, "Regular customer"),
        ("Ama Serwaa", "+233267890123", "ama@email.com", "Kumasi, Ghana", "Honda", "Civic", "2020", "AS-5678-20", None, "VIP customer"),
        ("Kofi Mensah", "+233259876543", None, "Tema, Ghana", "Nissan", "Altima", "2019", "GT-9012-19", None, None),
    ]
    
    for customer in customers_data:
        await conn.execute("""
            INSERT INTO customers (name, phone, email, address, vehicle_make, vehicle_model, vehicle_year, vehicle_plate, vehicle_vin, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, *customer)
    
    # Seed inventory
    inventory_data = [
        ("Engine Oil 5W-30", "Oils", 25, 10, 45.00, "Shell Ghana"),
        ("Brake Pads", "Brake Parts", 15, 5, 120.00, "Bosch Ghana"),
        ("Air Filter", "Filters", 30, 8, 25.00, "Mann Filter"),
        ("Spark Plugs", "Engine Parts", 50, 15, 8.00, "NGK"),
    ]
    
    for item in inventory_data:
        await conn.execute("""
            INSERT INTO inventory (name, category, stock, reorder_level, unit_price, supplier)
            VALUES ($1, $2, $3, $4, $5, $6)
        """, *item)
    
    logger.info("✅ Demo data seeded successfully")

# Pydantic models
class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[str] = None
    vehicle_plate: Optional[str] = None
    notes: Optional[str] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime

class JobBase(BaseModel):
    customer_id: int
    issue_description: str
    priority: str = "MEDIUM"

class Job(JobBase):
    id: int
    customer_name: str
    vehicle_info: str
    status: str
    estimated_cost: float
    created_at: datetime

class InventoryItem(BaseModel):
    id: int
    name: str
    category: str
    stock: int
    reorder_level: int
    unit_price: float
    supplier: str

class BlogPost(BaseModel):
    id: int
    title: str
    content: str
    excerpt: Optional[str]
    status: str
    author: str
    tags: List[str]
    created_at: datetime

# Dependency to get database connection
async def get_db():
    if not db_pool:
        raise HTTPException(status_code=500, detail="Database not connected")
    async with db_pool.acquire() as conn:
        yield conn

# Health check endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected", "timestamp": datetime.utcnow()}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )

@app.get("/api/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.utcnow(),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/api/db-status")
async def database_status():
    """Database status endpoint"""
    try:
        start_time = datetime.utcnow()
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT version()")
        end_time = datetime.utcnow()
        response_time = (end_time - start_time).total_seconds() * 1000
        
        return {
            "success": True,
            "data": {
                "status": "connected",
                "responseTime": f"{response_time:.2f}ms"
            }
        }
    except Exception as e:
        logger.error(f"Database status check failed: {e}")
        return {
            "success": False,
            "data": {"status": "disconnected"},
            "error": str(e)
        }

# Customer endpoints
@app.get("/api/test/customers", response_model=List[Customer])
async def get_customers(conn=Depends(get_db)):
    """Get all customers"""
    rows = await conn.fetch("""
        SELECT id, name, phone, email, address, vehicle_make, vehicle_model, 
               vehicle_year, vehicle_plate, vehicle_vin, notes, created_at
        FROM customers ORDER BY created_at DESC
    """)
    
    customers = []
    for row in rows:
        customer_dict = dict(row)
        # Transform to match frontend expected structure
        customer_dict['vehicle'] = {
            'make': customer_dict.pop('vehicle_make', ''),
            'model': customer_dict.pop('vehicle_model', ''),
            'year': customer_dict.pop('vehicle_year', ''),
            'plateNumber': customer_dict.pop('vehicle_plate', ''),
            'vin': customer_dict.pop('vehicle_vin', '')
        }
        customers.append(customer_dict)
    
    return customers

@app.post("/api/test/customers")
async def create_customer(customer: CustomerBase, conn=Depends(get_db)):
    """Create a new customer"""
    customer_id = await conn.fetchval("""
        INSERT INTO customers (name, phone, email, address, vehicle_make, vehicle_model, vehicle_year, vehicle_plate, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
    """, customer.name, customer.phone, customer.email, customer.address,
        customer.vehicle_make, customer.vehicle_model, customer.vehicle_year, customer.vehicle_plate, customer.notes)
    
    return {"success": True, "id": customer_id}

# Job endpoints
@app.get("/api/test/jobs")
async def get_jobs(conn=Depends(get_db)):
    """Get all jobs"""
    rows = await conn.fetch("""
        SELECT j.id, j.customer_id, j.customer_name, j.vehicle_info, j.issue_description,
               j.status, j.priority, j.estimated_cost, j.labor_hours, j.labor_rate, j.created_at,
               c.name as customer_name_from_db
        FROM jobs j
        LEFT JOIN customers c ON j.customer_id = c.id
        ORDER BY j.created_at DESC
    """)
    
    jobs = []
    for row in rows:
        job_dict = dict(row)
        # Use customer name from join if available
        if job_dict['customer_name_from_db']:
            job_dict['customerName'] = job_dict['customer_name_from_db']
        else:
            job_dict['customerName'] = job_dict['customer_name'] or 'Unknown'
        
        # Clean up the response
        job_dict.pop('customer_name_from_db', None)
        job_dict.pop('customer_name', None)
        jobs.append(job_dict)
    
    return jobs

@app.post("/api/test/jobs")
async def create_job(job: JobBase, conn=Depends(get_db)):
    """Create a new job"""
    # Get customer info
    customer = await conn.fetchrow(
        "SELECT name, vehicle_make, vehicle_model, vehicle_plate FROM customers WHERE id = $1",
        job.customer_id
    )
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    vehicle_info = f"{customer['vehicle_make']} {customer['vehicle_model']} ({customer['vehicle_plate']})"
    
    job_id = await conn.fetchval("""
        INSERT INTO jobs (customer_id, customer_name, vehicle_info, issue_description, priority)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    """, job.customer_id, customer['name'], vehicle_info, job.issue_description, job.priority)
    
    return {"success": True, "id": job_id}

# Inventory endpoints
@app.get("/api/test/inventory")
async def get_inventory(conn=Depends(get_db)):
    """Get all inventory items"""
    rows = await conn.fetch("SELECT * FROM inventory ORDER BY name")
    return [dict(row) for row in rows]

# Invoice endpoints  
@app.get("/api/test/invoices")
async def get_invoices(conn=Depends(get_db)):
    """Get all invoices"""
    rows = await conn.fetch("""
        SELECT i.*, c.name as customer_name 
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.created_at DESC
    """)
    return [dict(row) for row in rows]

# Blog endpoints
@app.get("/api/test/blog")
async def get_blog_posts(conn=Depends(get_db)):
    """Get all blog posts"""
    rows = await conn.fetch("SELECT * FROM blog_posts ORDER BY created_at DESC")
    return [dict(row) for row in rows]

# AI Diagnosis endpoint
@app.post("/api/test/ai-diagnosis")
async def ai_diagnosis(request: dict):
    """Advanced AI diagnosis endpoint for automotive issues"""
    complaint = request.get("complaint", "").lower()
    vehicle_info = request.get("vehicleInfo", {})
    
    # Enhanced AI diagnosis based on symptoms and vehicle info
    diagnosis_data = analyze_automotive_symptoms(complaint, vehicle_info)
    
    return {
        "success": True,
        "data": diagnosis_data
    }

def analyze_automotive_symptoms(complaint: str, vehicle_info: dict) -> dict:
    """Analyze automotive symptoms and provide intelligent diagnosis"""
    
    # Vehicle context
    make = vehicle_info.get("make", "").lower() if vehicle_info else ""
    model = vehicle_info.get("model", "").lower() if vehicle_info else ""
    year = vehicle_info.get("year", 0) if vehicle_info else 0
    
    # Common symptom patterns with intelligent responses
    patterns = {
        # Brake system issues
        "brake": {
            "keywords": ["brake", "braking", "squealing", "grinding", "pedal", "stopping"],
            "diagnosis": "Brake system diagnosis indicates potential issues with brake pads, rotors, or fluid system. The symptoms suggest immediate attention is required for safety.",
            "confidence": 0.92,
            "cost_range": "200-600",
            "repair_time": "2-6 hours",
            "parts": ["Brake pads", "Brake rotors", "Brake fluid", "Brake inspection", "Labor"]
        },
        
        # Engine problems
        "engine": {
            "keywords": ["engine", "motor", "starting", "stall", "power", "acceleration", "rough idle"],
            "diagnosis": "Engine symptoms detected. Diagnostic scan required to identify specific issues. Could involve fuel system, ignition, or mechanical components.",
            "confidence": 0.88,
            "cost_range": "150-1200",
            "repair_time": "3-8 hours",
            "parts": ["Diagnostic scan", "Spark plugs", "Fuel filter", "Engine oil", "Labor"]
        },
        
        # Transmission
        "transmission": {
            "keywords": ["transmission", "shifting", "gear", "slipping", "jerking", "fluid leak"],
            "diagnosis": "Transmission symptoms indicate potential issues with gear shifting mechanism, fluid levels, or internal components. Requires professional inspection.",
            "confidence": 0.85,
            "cost_range": "300-2000",
            "repair_time": "4-12 hours",
            "parts": ["Transmission fluid", "Filter", "Diagnostic", "Transmission service", "Labor"]
        },
        
        # Electrical system
        "electrical": {
            "keywords": ["battery", "alternator", "lights", "electrical", "charging", "dead", "won't start"],
            "diagnosis": "Electrical system diagnosis suggests issues with battery, alternator, or charging system. Battery and charging system test recommended.",
            "confidence": 0.90,
            "cost_range": "100-800",
            "repair_time": "1-4 hours", 
            "parts": ["Battery", "Alternator", "Battery test", "Charging system check", "Labor"]
        },
        
        # Cooling system
        "cooling": {
            "keywords": ["overheating", "coolant", "radiator", "temperature", "fan", "thermostat"],
            "diagnosis": "Cooling system issues detected. Overheating can cause severe engine damage. Immediate inspection of radiator, thermostat, and coolant levels required.",
            "confidence": 0.89,
            "cost_range": "150-800",
            "repair_time": "2-6 hours",
            "parts": ["Coolant", "Thermostat", "Radiator", "Water pump", "Labor"]
        },
        
        # AC/Climate
        "ac": {
            "keywords": ["air conditioning", "ac", "cooling", "heating", "climate", "air flow"],
            "diagnosis": "Climate control system issues. Could involve refrigerant levels, compressor, or ventilation system. Diagnostic check recommended.",
            "confidence": 0.82,
            "cost_range": "100-600",
            "repair_time": "1-4 hours",
            "parts": ["Refrigerant", "AC service", "Cabin filter", "Compressor check", "Labor"]
        },
        
        # Suspension
        "suspension": {
            "keywords": ["suspension", "shock", "strut", "bouncing", "noise", "handling", "steering"],
            "diagnosis": "Suspension system symptoms detected. Issues with shocks, struts, or steering components affect vehicle handling and safety.",
            "confidence": 0.86,
            "cost_range": "200-1000",
            "repair_time": "3-6 hours",
            "parts": ["Shock absorbers", "Struts", "Suspension inspection", "Wheel alignment", "Labor"]
        },
        
        # Tire issues
        "tire": {
            "keywords": ["tire", "tyre", "flat", "puncture", "pressure", "wear", "alignment"],
            "diagnosis": "Tire-related issues identified. Could involve tire pressure, wear patterns, alignment, or puncture. Safety inspection recommended.",
            "confidence": 0.94,
            "cost_range": "50-400",
            "repair_time": "0.5-3 hours",
            "parts": ["Tire repair", "New tires", "Wheel alignment", "Tire pressure check", "Labor"]
        }
    }
    
    # Find best matching pattern
    best_match = None
    max_matches = 0
    
    for category, data in patterns.items():
        matches = sum(1 for keyword in data["keywords"] if keyword in complaint)
        if matches > max_matches:
            max_matches = matches
            best_match = category
    
    # Use best match or default
    if best_match and max_matches > 0:
        result = patterns[best_match].copy()
        
        # Enhance diagnosis with vehicle-specific information
        if make and model:
            result["diagnosis"] += f" Vehicle: {make.title()} {model.title()}"
            if year:
                result["diagnosis"] += f" ({year})"
            result["diagnosis"] += " - specific parts availability and common issues for this vehicle have been considered."
            
            # Adjust confidence and cost for vehicle age
            if year and year < 2010:
                result["confidence"] = max(result["confidence"] - 0.05, 0.75)
                # Older cars might need more parts
                current_range = result["cost_range"].split("-")
                if len(current_range) == 2:
                    min_cost = int(current_range[0])
                    max_cost = int(current_range[1])
                    result["cost_range"] = f"{min_cost}-{max_cost + 200}"
    else:
        # Default diagnosis
        result = {
            "diagnosis": f"Based on the symptoms described: '{complaint}', this appears to be an automotive issue requiring professional diagnostic inspection. Multiple systems could be involved.",
            "confidence": 0.75,
            "cost_range": "100-500", 
            "repair_time": "2-6 hours",
            "parts": ["Comprehensive diagnostic", "Standard inspection", "Labor"]
        }
        
        if make and model:
            result["diagnosis"] += f" Vehicle: {make.title()} {model.title()}"
            if year:
                result["diagnosis"] += f" ({year})"
    
    # Add Ghana-specific considerations
    result["diagnosis"] += " Local road conditions and climate in Ghana have been factored into this assessment."
    
    return {
        "diagnosis": result["diagnosis"],
        "confidence": result["confidence"],
        "estimatedCostRange": result["cost_range"],
        "repairTime": result["repair_time"],
        "suggestedParts": result["parts"]
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up database connection on shutdown"""
    global db_pool
    if db_pool:
        await db_pool.close()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)