from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from models import (
    ContactSubmission,
    ContactSubmissionCreate,
    ContactSubmissionResponse,
    AdminLogin,
    AdminLoginResponse
)
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Dependency to verify admin token
async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin = await db.admins.find_one({"username": payload.get("sub")})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return admin

# Initialize default admin user
async def init_admin():
    """Create default admin user if not exists"""
    existing_admin = await db.admins.find_one({"username": "admin"})
    if not existing_admin:
        admin_data = {
            "username": "admin",
            "password_hash": get_password_hash("IXADigital@2026"),
            "created_at": datetime.utcnow()
        }
        await db.admins.insert_one(admin_data)
        logger.info("Default admin user created")

# Public Routes
@api_router.get("/")
async def root():
    return {"message": "IXA Digital API"}

@api_router.post("/contact", response_model=ContactSubmissionResponse)
async def submit_contact_form(submission: ContactSubmissionCreate):
    """Submit a contact form"""
    try:
        contact_data = ContactSubmission(**submission.dict())
        await db.contact_submissions.insert_one(contact_data.dict())
        
        logger.info(f"New contact submission from {submission.email}")
        
        return ContactSubmissionResponse(
            success=True,
            message="Thank you for your inquiry! We'll get back to you within 24 hours.",
            id=contact_data.id
        )
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit form")

# Admin Authentication Routes
@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLogin):
    """Admin login endpoint"""
    admin = await db.admins.find_one({"username": credentials.username})
    
    if not admin or not verify_password(credentials.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": admin["username"]})
    
    return AdminLoginResponse(
        success=True,
        message="Login successful",
        token=access_token,
        admin={
            "username": admin["username"],
            "id": admin.get("id", str(admin["_id"]))
        }
    )

# Admin Protected Routes
@api_router.get("/admin/submissions")
async def get_all_submissions(
    status: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all contact submissions (Admin only)"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        submissions = await db.contact_submissions.find(query).sort("created_at", -1).to_list(1000)
        
        # Convert ObjectId to string for JSON serialization
        for submission in submissions:
            submission["_id"] = str(submission["_id"])
        
        return {
            "success": True,
            "count": len(submissions),
            "submissions": submissions
        }
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch submissions")

@api_router.patch("/admin/submissions/{submission_id}/status")
async def update_submission_status(
    submission_id: str,
    status: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Update submission status (Admin only)"""
    try:
        result = await db.contact_submissions.update_one(
            {"id": submission_id},
            {"$set": {"status": status}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {"success": True, "message": "Status updated successfully"}
    except Exception as e:
        logger.error(f"Error updating submission status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update status")

@api_router.delete("/admin/submissions/{submission_id}")
async def delete_submission(
    submission_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete a submission (Admin only)"""
    try:
        result = await db.contact_submissions.delete_one({"id": submission_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {"success": True, "message": "Submission deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting submission: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete submission")

@api_router.get("/admin/stats")
async def get_admin_stats(current_admin: dict = Depends(get_current_admin)):
    """Get admin dashboard statistics"""
    try:
        total = await db.contact_submissions.count_documents({})
        new = await db.contact_submissions.count_documents({"status": "new"})
        read = await db.contact_submissions.count_documents({"status": "read"})
        contacted = await db.contact_submissions.count_documents({"status": "contacted"})
        
        return {
            "success": True,
            "stats": {
                "total": total,
                "new": new,
                "read": read,
                "contacted": contacted
            }
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_admin()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Application shutdown")
