#!/usr/bin/env python3
"""
Biskaken Auto FastAPI Backend
Professional automotive services management system
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://biskakenauto.rpnmore.com",
        "https://bisadmin.rpnmore.com", 
        "http://localhost:3000",
        "http://localhost:5173",
        "*.rpnmore.com",
        "*.traefik.me"
    ],
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

# API Routes
@app.get("/")
async def root():
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)