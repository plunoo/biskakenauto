#!/usr/bin/env python3
"""
Biskaken Auto FastAPI Backend
Professional automotive services management system
"""

from fastapi import FastAPI, Depends, HTTPException, status, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, DECIMAL, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import logging
from typing import Optional, List

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto")
SECRET_KEY = os.getenv("JWT_SECRET", "biskaken-super-secure-jwt-secret-2026-v5")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Production/Development mode detection
PRODUCTION_MODE = os.getenv("NODE_ENV", "development") == "production"

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# FastAPI app
app = FastAPI(
    title="Biskaken Auto API",
    description="Professional Automotive Services Management System",
    version="5.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Templates setup
templates = Jinja2Templates(directory="templates")

# CORS middleware - Development and Production origins
allowed_origins = [
    "http://localhost:3000",  # React admin dashboard (development)
    "http://localhost:5173",  # Vite dev server (development)
    "https://bisadmin.rpnmore.com",      # React admin dashboard (production)
    "https://biskakenauto.rpnmore.com",  # Alternative domain for admin dashboard
]

# Add custom CORS origins if specified
cors_origins = os.getenv("CORS_ORIGINS", "").split(",")
if cors_origins and cors_origins[0]:
    allowed_origins.extend([origin.strip() for origin in cors_origins])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="STAFF")
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    plate_number = Column(String(20))
    vehicle_make = Column(String(50))
    vehicle_model = Column(String(50))
    vehicle_year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer)
    customer_name = Column(String(100))
    vehicle_info = Column(Text)
    issue_description = Column(Text)
    status = Column(String(20), default="PENDING")
    priority = Column(String(20), default="MEDIUM")
    estimated_cost = Column(DECIMAL(10, 2), default=0)
    labor_hours = Column(DECIMAL(5, 2), default=0)
    labor_rate = Column(DECIMAL(8, 2), default=50)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    plate_number: Optional[str] = None
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[int] = None

class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    vehicle_make: Optional[str]
    vehicle_model: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email, User.status == "ACTIVE").first()
    if user is None:
        raise credentials_exception
    return user

# Demo data and authentication
DEMO_USERS = [
    {"email": "admin@biskaken.com", "password": "admin123", "name": "Admin User", "role": "ADMIN"},
    {"email": "staff@biskaken.com", "password": "staff123", "name": "Staff User", "role": "STAFF"},
    {"email": "manager@biskaken.com", "password": "manager123", "name": "Manager User", "role": "SUB_ADMIN"}
]

def authenticate_user(db: Session, email: str, password: str):
    # Check demo users first
    for demo_user in DEMO_USERS:
        if demo_user["email"] == email and demo_user["password"] == password:
            return {
                "id": demo_user["email"],
                "name": demo_user["name"],
                "email": demo_user["email"],
                "role": demo_user["role"]
            }
    
    # Check database users
    user = db.query(User).filter(User.email == email, User.status == "ACTIVE").first()
    if user and verify_password(password, user.password_hash):
        return user
    return None

# Initialize database
@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        
        # Create default admin user if not exists
        db = SessionLocal()
        try:
            admin_user = db.query(User).filter(User.email == "admin@biskaken.com").first()
            if not admin_user:
                hashed_password = get_password_hash("admin123")
                admin_user = User(
                    name="Admin User",
                    email="admin@biskaken.com",
                    password_hash=hashed_password,
                    role="ADMIN"
                )
                db.add(admin_user)
                db.commit()
                logger.info("✅ Default admin user created")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")

# HTML Routes
@app.get("/", response_class=HTMLResponse)
async def root_redirect():
    return RedirectResponse(url="/login", status_code=302)

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request, error: str = None, email: str = None):
    return templates.TemplateResponse("login.html", {
        "request": request, 
        "error": error,
        "email": email
    })

@app.post("/login")
async def login_form(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, email, password)
    if not user:
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "Invalid email or password. Please try again.",
            "email": email
        })
    
    # Create session token (simplified - in production use secure sessions)
    access_token = create_access_token(data={"sub": user["email"] if isinstance(user, dict) else user.email})
    
    # Redirect to dashboard with token (simplified - use secure cookies in production)
    response = RedirectResponse(url="/dashboard", status_code=302)
    response.set_cookie("access_token", access_token, max_age=7*24*60*60)  # 7 days
    return response

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    # Get token from cookie
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login?error=Please login first", status_code=302)
    
    try:
        # Verify token
        from jose import jwt
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise Exception("Invalid token")
        
        # Get user info
        user = None
        for demo_user in DEMO_USERS:
            if demo_user["email"] == email:
                user = demo_user
                break
        
        if not user:
            db_user = db.query(User).filter(User.email == email, User.status == "ACTIVE").first()
            if db_user:
                user = {
                    "email": db_user.email,
                    "name": db_user.name,
                    "role": db_user.role
                }
        
        if not user:
            return RedirectResponse(url="/login?error=Invalid session", status_code=302)
        
        # Get dashboard data
        try:
            total_customers = db.query(Customer).count()
            total_jobs = db.query(Job).count()
            pending_jobs = db.query(Job).filter(Job.status == "PENDING").count()
            recent_jobs = [
                {"id": 1, "customer": "Kwame Asante", "issue": "Engine oil change", "status": "COMPLETED"},
                {"id": 2, "customer": "Akosua Mensah", "issue": "Brake inspection", "status": "IN_PROGRESS"}
            ]
        except:
            # Demo data if DB fails
            total_customers = 25
            total_jobs = 15
            pending_jobs = 5
            recent_jobs = [
                {"id": 1, "customer": "Kwame Asante", "issue": "Engine oil change", "status": "COMPLETED"},
                {"id": 2, "customer": "Akosua Mensah", "issue": "Brake inspection", "status": "IN_PROGRESS"}
            ]
        
        stats = {
            "total_customers": total_customers,
            "total_jobs": total_jobs,
            "pending_jobs": pending_jobs,
            "revenue": 15750.00
        }
        
        return templates.TemplateResponse("admin-dashboard.html", {
            "request": request,
            "user": user,
            "stats": stats,
            "recent_jobs": recent_jobs
        })
        
    except Exception as e:
        return RedirectResponse(url="/login?error=Session expired", status_code=302)

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("access_token")
    return response

# =============================================================================
# SYSTEM FUNCTIONALITY ROUTES - All the missing system pages
# =============================================================================

def get_demo_user(email: str):
    """Helper to get demo user data"""
    for user in DEMO_USERS:
        if user["email"] == email:
            return user
    return None

def get_demo_user_from_token(token: str):
    """Helper to extract user from token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return get_demo_user(payload.get("sub"))
    except:
        return None

@app.get("/jobs", response_class=HTMLResponse)
async def jobs_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data:
        return RedirectResponse(url="/login")
    
    return templates.TemplateResponse("jobs.html", {
        "request": request,
        "user": user_data
    })

@app.get("/customers", response_class=HTMLResponse)
async def customers_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data:
        return RedirectResponse(url="/login")
    
    return HTMLResponse("""
    <html><head><title>Customers - Biskaken Auto</title></head>
    <body><h1>Customer Management</h1>
    <p>Welcome, """ + user_data["name"] + """!</p>
    <p><a href="/dashboard">Back to Dashboard</a></p>
    <p>Customer functionality will be implemented here.</p>
    </body></html>
    """)

@app.get("/inventory", response_class=HTMLResponse)
async def inventory_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data:
        return RedirectResponse(url="/login")
    
    return HTMLResponse("""
    <html><head><title>Inventory - Biskaken Auto</title></head>
    <body><h1>Inventory Management</h1>
    <p>Welcome, """ + user_data["name"] + """!</p>
    <p><a href="/dashboard">Back to Dashboard</a></p>
    <p>Inventory functionality will be implemented here.</p>
    </body></html>
    """)

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data or user_data["role"] != "ADMIN":
        return RedirectResponse(url="/dashboard")
    
    return HTMLResponse("""
    <html><head><title>Admin - Biskaken Auto</title></head>
    <body><h1>Admin Panel</h1>
    <p>Welcome, """ + user_data["name"] + """!</p>
    <p><a href="/dashboard">Back to Dashboard</a></p>
    <p>Admin functionality will be implemented here.</p>
    </body></html>
    """)

@app.get("/reports", response_class=HTMLResponse)
async def reports_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data:
        return RedirectResponse(url="/login")
    
    return HTMLResponse("""
    <html><head><title>Reports - Biskaken Auto</title></head>
    <body><h1>Reports & Analytics</h1>
    <p>Welcome, """ + user_data["name"] + """!</p>
    <p><a href="/dashboard">Back to Dashboard</a></p>
    <p>Reports functionality will be implemented here.</p>
    </body></html>
    """)

@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data:
        return RedirectResponse(url="/login")
    
    return HTMLResponse("""
    <html><head><title>Settings - Biskaken Auto</title></head>
    <body><h1>System Settings</h1>
    <p>Welcome, """ + user_data["name"] + """!</p>
    <p><a href="/dashboard">Back to Dashboard</a></p>
    <p>Settings functionality will be implemented here.</p>
    </body></html>
    """)

@app.get("/blog", response_class=HTMLResponse)
async def blog_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data:
        return RedirectResponse(url="/login")
    
    return HTMLResponse("""
    <html><head><title>Blog Management - Biskaken Auto</title></head>
    <body><h1>Blog Management</h1>
    <p>Welcome, """ + user_data["name"] + """!</p>
    <p><a href="/dashboard">Back to Dashboard</a></p>
    <p>Blog functionality will be implemented here.</p>
    </body></html>
    """)

@app.get("/invoices", response_class=HTMLResponse)
async def invoices_page(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    user_data = get_demo_user_from_token(token)
    if not user_data:
        return RedirectResponse(url="/login")
    
    return HTMLResponse("""
    <html><head><title>Invoices - Biskaken Auto</title></head>
    <body><h1>Invoice Management</h1>
    <p>Welcome, """ + user_data["name"] + """!</p>
    <p><a href="/dashboard">Back to Dashboard</a></p>
    <p>Invoice functionality will be implemented here.</p>
    </body></html>
    """)

# API Routes
@app.get("/api/status")
async def api_status():
    return {
        "success": True,
        "message": "Biskaken Auto FastAPI v5.0 is running!",
        "service": "Biskaken Auto API",
        "version": "5.0.0",
        "framework": "FastAPI",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "health": "/health",
            "docs": "/api/docs",
            "login": "/api/auth/login",
            "customers": "/api/customers",
            "jobs": "/api/jobs",
            "db_status": "/api/db-status"
        }
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "OK",
        "service": "Biskaken Auto FastAPI v5.0",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status
    }

@app.get("/api/db-status")
async def database_status(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        import os
        if "sqlite" in DATABASE_URL.lower():
            result = db.execute(text("SELECT datetime('now') as current_time, 'SQLite' as version"))
        else:
            result = db.execute(text("SELECT NOW() as current_time, version() as pg_version"))
        row = result.fetchone()
        return {
            "success": True,
            "data": {
                "status": "connected",
                "connected": True,
                "mode": "production",
                "host": "localhost",
                "database": "biskaken_auto",
                "time": str(row[0]) if row[0] else None,
                "version": str(row[1]).split(' ')[0] if row[1] else None
            }
        }
    except Exception as e:
        return {
            "success": False,
            "data": {
                "status": "error",
                "connected": False,
                "mode": "demo",
                "error": str(e)
            }
        }

@app.post("/api/auth/login", response_model=Token)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user["email"] if isinstance(user, dict) else user.email})
    
    if isinstance(user, dict):
        user_data = {
            "id": hash(user["email"]) % 100000,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    else:
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@app.get("/api/customers", response_model=List[CustomerResponse])
async def get_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customers = db.query(Customer).limit(100).all()
    
    # If no customers in DB, return demo data
    if not customers:
        demo_customers = [
            {
                "id": 1,
                "name": "Kwame Asante",
                "phone": "+233 24 123 4567",
                "email": "kwame@example.com",
                "vehicle_make": "Toyota",
                "vehicle_model": "Camry",
                "created_at": datetime.utcnow()
            },
            {
                "id": 2,
                "name": "Akosua Mensah",
                "phone": "+233 20 987 6543",
                "email": "akosua@example.com",
                "vehicle_make": "Honda",
                "vehicle_model": "Civic",
                "created_at": datetime.utcnow()
            }
        ]
        return demo_customers
    
    return customers

@app.post("/api/customers", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.get("/api/reports/dashboard")
async def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        total_customers = db.query(Customer).count()
        total_jobs = db.query(Job).count()
        pending_jobs = db.query(Job).filter(Job.status == "PENDING").count()
    except:
        # Demo data if DB fails
        total_customers = 25
        total_jobs = 15
        pending_jobs = 5
    
    return {
        "success": True,
        "data": {
            "total_customers": total_customers,
            "total_jobs": total_jobs,
            "pending_jobs": pending_jobs,
            "revenue": 15750.00,
            "recent_jobs": [
                {"id": 1, "customer": "Kwame Asante", "issue": "Engine oil change", "status": "COMPLETED"},
                {"id": 2, "customer": "Akosua Mensah", "issue": "Brake inspection", "status": "IN_PROGRESS"}
            ]
        }
    }

# Test API Endpoints for React App
@app.get("/api/test/customers")
async def get_test_customers():
    return {
        "success": True,
        "data": [
            {"id": "1", "name": "John Doe", "phone": "0244123456", "email": "john@example.com", "address": "Accra, Ghana"},
            {"id": "2", "name": "Jane Smith", "phone": "0200987654", "email": "jane@example.com", "address": "Kumasi, Ghana"},
            {"id": "3", "name": "Kwame Asante", "phone": "0246789012", "email": "kwame@example.com", "address": "Tema, Ghana"},
            {"id": "4", "name": "Akosua Mensah", "phone": "0543210987", "email": "akosua@example.com", "address": "Takoradi, Ghana"}
        ]
    }

@app.get("/api/test/inventory")
async def get_test_inventory():
    return {
        "success": True,
        "data": [
            {"id": "1", "name": "Engine Oil", "sku": "EO001", "stock": 25, "minStock": 10, "price": 45, "category": "Oils"},
            {"id": "2", "name": "Brake Pads", "sku": "BP001", "stock": 8, "minStock": 5, "price": 120, "category": "Brake Parts"},
            {"id": "3", "name": "Air Filter", "sku": "AF001", "stock": 15, "minStock": 8, "price": 35, "category": "Filters"},
            {"id": "4", "name": "Spark Plugs", "sku": "SP001", "stock": 20, "minStock": 12, "price": 25, "category": "Engine Parts"}
        ]
    }

@app.get("/api/test/jobs")
async def get_test_jobs():
    return {
        "success": True,
        "data": [
            {"id": "1", "customerId": "1", "title": "Oil Change", "description": "Regular maintenance", "status": "IN_PROGRESS", "priority": "MEDIUM"},
            {"id": "2", "customerId": "2", "title": "Brake Repair", "description": "Replace brake pads", "status": "PENDING", "priority": "HIGH"},
            {"id": "3", "customerId": "3", "title": "Engine Diagnostic", "description": "Check engine light", "status": "COMPLETED", "priority": "HIGH"},
            {"id": "4", "customerId": "4", "title": "AC Service", "description": "AC not cooling", "status": "PENDING", "priority": "MEDIUM"}
        ]
    }

@app.get("/api/test/invoices")
async def get_test_invoices():
    return {
        "success": True,
        "data": [
            {"id": "1", "customerId": "1", "jobId": "1", "items": [], "subtotal": 200, "tax": 30, "grandTotal": 230, "status": "PENDING", "payments": []},
            {"id": "2", "customerId": "2", "jobId": "2", "items": [], "subtotal": 350, "tax": 52.5, "grandTotal": 402.5, "status": "PAID", "payments": []},
            {"id": "3", "customerId": "3", "jobId": "3", "items": [], "subtotal": 125, "tax": 18.75, "grandTotal": 143.75, "status": "PAID", "payments": []},
            {"id": "4", "customerId": "4", "jobId": "4", "items": [], "subtotal": 275, "tax": 41.25, "grandTotal": 316.25, "status": "PENDING", "payments": []}
        ]
    }

@app.post("/api/test/ai-diagnosis")
async def test_ai_diagnosis(request: Request):
    data = await request.json()
    complaint = data.get("complaint", "")
    
    # Mock AI diagnosis based on complaint keywords
    if "engine" in complaint.lower():
        diagnosis = "Possible engine oil leak or spark plug issues. Recommend engine inspection."
    elif "brake" in complaint.lower():
        diagnosis = "Brake system may need inspection. Check brake pads and brake fluid levels."
    elif "noise" in complaint.lower():
        diagnosis = "Unusual sounds may indicate worn bearings or loose components. Inspection recommended."
    else:
        diagnosis = "General diagnostic recommended. Multiple systems should be checked for optimal performance."
    
    return {
        "success": True,
        "data": {
            "diagnosis": diagnosis,
            "confidence": 85,
            "recommendations": [
                "Schedule a detailed inspection",
                "Check vehicle maintenance history",
                "Consider preventive maintenance"
            ],
            "estimated_cost": "GHS 150 - GHS 500"
        }
    }

@app.get("/api/test/blog")
async def get_test_blog():
    return {
        "success": True,
        "data": [
            {
                "id": "1",
                "title": "Essential Car Maintenance Tips for Ghana's Roads",
                "excerpt": "Learn how to keep your car running smoothly in Ghana's unique conditions",
                "content": "Full blog content here...",
                "status": "published",
                "created_at": "2026-01-20T10:00:00Z"
            },
            {
                "id": "2", 
                "title": "Understanding Your Car's Warning Lights",
                "excerpt": "What those dashboard lights really mean",
                "content": "Full blog content here...",
                "status": "published",
                "created_at": "2026-01-15T14:30:00Z"
            }
        ]
    }

@app.get("/api/test/endpoints")
async def get_test_endpoints():
    return {
        "success": True,
        "endpoints": {
            "customers": "/api/test/customers",
            "inventory": "/api/test/inventory", 
            "jobs": "/api/test/jobs",
            "invoices": "/api/test/invoices",
            "ai_diagnosis": "/api/test/ai-diagnosis",
            "blog": "/api/test/blog"
        }
    }

# Additional Login Endpoints for React App Integration
@app.post("/api/auth/admin-login")
async def admin_login(user_login: UserLogin):
    # Demo credentials for admin login
    demo_users = [
        {"email": "admin@biskaken.com", "password": "admin123", "role": "ADMIN", "name": "Admin User"},
        {"email": "staff@biskaken.com", "password": "staff123", "role": "STAFF", "name": "Staff User"},
        {"email": "manager@biskaken.com", "password": "manager123", "role": "SUB_ADMIN", "name": "Manager User"}
    ]
    
    user = None
    for demo_user in demo_users:
        if demo_user["email"] == user_login.email and demo_user["password"] == user_login.password:
            user = demo_user
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": hash(user["email"]) % 100000,
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            },
            "token": access_token
        }
    }

@app.post("/api/test/auth/login")
async def test_auth_login(user_login: UserLogin):
    # Same as admin login for test endpoints
    demo_users = [
        {"email": "admin@biskaken.com", "password": "admin123", "role": "ADMIN", "name": "Admin User"},
        {"email": "staff@biskaken.com", "password": "staff123", "role": "STAFF", "name": "Staff User"},
        {"email": "manager@biskaken.com", "password": "manager123", "role": "SUB_ADMIN", "name": "Manager User"}
    ]
    
    user = None
    for demo_user in demo_users:
        if demo_user["email"] == user_login.email and demo_user["password"] == user_login.password:
            user = demo_user
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": hash(user["email"]) % 100000,
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            },
            "token": access_token
        }
    }

@app.get("/api/test/auth/me")
async def get_current_user_test(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": current_user
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5002))
    uvicorn.run(app, host="0.0.0.0", port=port)