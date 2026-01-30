from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import PlainTextResponse
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
    AdminLoginResponse,
    SupportTicket,
    SupportTicketCreate,
    TicketReplyCreate,
    TicketReply,
    SystemSettings,
    SettingsUpdate,
    EmailSettings,
    SEOSettings
)
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token
)
from email_service import EmailService

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

# Helper function to get email service
async def get_email_service():
    settings = await db.settings.find_one()
    if settings and settings.get('email_settings'):
        return EmailService(settings['email_settings'])
    return EmailService({'enabled': False})

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

# Initialize default admin and settings
async def init_defaults():
    """Create default admin user and settings if not exists"""
    # Create admin
    existing_admin = await db.admins.find_one({"username": "admin"})
    if not existing_admin:
        admin_data = {
            "username": "admin",
            "password_hash": get_password_hash("IXADigital@2026"),
            "created_at": datetime.utcnow()
        }
        await db.admins.insert_one(admin_data)
        logger.info("Default admin user created")
    
    # Create default settings
    existing_settings = await db.settings.find_one()
    if not existing_settings:
        default_settings = SystemSettings()
        await db.settings.insert_one(default_settings.dict())
        logger.info("Default settings created")

# Generate ticket number
async def generate_ticket_number():
    count = await db.support_tickets.count_documents({})
    return f"TKT-{str(count + 1).zfill(6)}"

# Public Routes
@api_router.get("/")
async def root():
    return {"message": "IXA Digital API"}

@api_router.get("/seo-config")
async def get_seo_config():
    """Get SEO configuration for frontend"""
    settings = await db.settings.find_one()
    if settings and settings.get('seo_settings'):
        return settings['seo_settings']
    return SEOSettings().dict()

@api_router.post("/track-ticket")
async def track_ticket(ticket_number: str, customer_email: str):
    """Track a support ticket (public with verification)"""
    try:
        ticket = await db.support_tickets.find_one({
            "ticket_number": ticket_number,
            "customer_email": customer_email
        })
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found or email doesn't match")
        
        ticket["_id"] = str(ticket["_id"])
        return {
            "success": True,
            "ticket": ticket
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error tracking ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track ticket")

@api_router.post("/ticket/{ticket_id}/customer-reply")
async def customer_reply_to_ticket(
    ticket_id: str,
    reply_message: str,
    customer_email: str
):
    """Customer reply to their own ticket (public with verification)"""
    try:
        ticket = await db.support_tickets.find_one({
            "id": ticket_id,
            "customer_email": customer_email
        })
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found or email doesn't match")
        
        reply = TicketReply(
            author=ticket["customer_name"],
            message=reply_message,
            is_admin=False
        )
        
        result = await db.support_tickets.update_one(
            {"id": ticket_id},
            {
                "$push": {"replies": reply.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to add reply")
        
        # Send email notification to admin
        email_service = await get_email_service()
        settings = await db.settings.find_one()
        if settings and settings.get('email_settings', {}).get('enabled'):
            recipients = settings['email_settings'].get('notification_recipients', [])
            if recipients:
                # Notify admin about customer reply
                subject = f"Customer Reply: Ticket #{ticket['ticket_number']}"
                html_body = f"""
                <h2>Customer Reply on Ticket #{ticket['ticket_number']}</h2>
                <p><strong>From:</strong> {ticket['customer_name']} ({customer_email})</p>
                <p><strong>Subject:</strong> {ticket['subject']}</p>
                <p><strong>Reply:</strong></p>
                <p>{reply_message}</p>
                <p><a href="/admin/tickets">View in Admin Panel</a></p>
                """
                email_service.send_email(recipients, subject, html_body)
        
        return {"success": True, "message": "Reply added successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding customer reply: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add reply")

@api_router.post("/contact", response_model=ContactSubmissionResponse)
async def submit_contact_form(submission: ContactSubmissionCreate):
    """Submit a contact form"""
    try:
        contact_data = ContactSubmission(**submission.dict())
        await db.contact_submissions.insert_one(contact_data.dict())
        
        logger.info(f"New contact submission from {submission.email}")
        
        # Send email notification
        email_service = await get_email_service()
        settings = await db.settings.find_one()
        if settings and settings.get('email_settings', {}).get('enabled'):
            recipients = settings['email_settings'].get('notification_recipients', [])
            if recipients:
                email_service.send_new_inquiry_notification(contact_data.dict(), recipients)
        
        return ContactSubmissionResponse(
            success=True,
            message="Thank you for your inquiry! We'll get back to you within 24 hours.",
            id=contact_data.id
        )
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit form")

@api_router.post("/support-ticket")
async def create_support_ticket(ticket_data: SupportTicketCreate):
    """Create a new support ticket (public)"""
    try:
        ticket_number = await generate_ticket_number()
        ticket = SupportTicket(
            **ticket_data.dict(),
            ticket_number=ticket_number
        )
        await db.support_tickets.insert_one(ticket.dict())
        
        logger.info(f"New support ticket created: {ticket_number}")
        
        # Send email notification
        email_service = await get_email_service()
        settings = await db.settings.find_one()
        if settings and settings.get('email_settings', {}).get('enabled'):
            recipients = settings['email_settings'].get('notification_recipients', [])
            if recipients:
                email_service.send_ticket_notification(ticket.dict(), recipients)
        
        return {
            "success": True,
            "message": "Support ticket created successfully",
            "ticket_number": ticket_number,
            "ticket_id": ticket.id
        }
    except Exception as e:
        logger.error(f"Error creating support ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")

# Sitemap endpoint
@api_router.get("/sitemap.xml", response_class=PlainTextResponse)
async def get_sitemap():
    """Generate sitemap.xml"""
    base_url = os.getenv("FRONTEND_URL", "https://your-domain.com")
    
    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{base_url}/</loc>
        <lastmod>{datetime.utcnow().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{base_url}/admin/login</loc>
        <lastmod>{datetime.utcnow().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
</urlset>"""
    
    return sitemap

# Admin Authentication Routes
@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLogin):
    """Admin login endpoint"""
    admin = await db.admins.find_one({"username": credentials.username})
    
    if not admin or not verify_password(credentials.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
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

# Admin Protected Routes - Contact Submissions
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
        # Contact submissions stats
        total_submissions = await db.contact_submissions.count_documents({})
        new_submissions = await db.contact_submissions.count_documents({"status": "new"})
        read_submissions = await db.contact_submissions.count_documents({"status": "read"})
        contacted_submissions = await db.contact_submissions.count_documents({"status": "contacted"})
        
        # Support tickets stats
        total_tickets = await db.support_tickets.count_documents({})
        open_tickets = await db.support_tickets.count_documents({"status": "open"})
        in_progress_tickets = await db.support_tickets.count_documents({"status": "in_progress"})
        resolved_tickets = await db.support_tickets.count_documents({"status": "resolved"})
        
        return {
            "success": True,
            "stats": {
                "submissions": {
                    "total": total_submissions,
                    "new": new_submissions,
                    "read": read_submissions,
                    "contacted": contacted_submissions
                },
                "tickets": {
                    "total": total_tickets,
                    "open": open_tickets,
                    "in_progress": in_progress_tickets,
                    "resolved": resolved_tickets
                }
            }
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")

# Admin Protected Routes - Support Tickets
@api_router.get("/admin/tickets")
async def get_all_tickets(
    status: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all support tickets (Admin only)"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        tickets = await db.support_tickets.find(query).sort("created_at", -1).to_list(1000)
        
        for ticket in tickets:
            ticket["_id"] = str(ticket["_id"])
        
        return {
            "success": True,
            "count": len(tickets),
            "tickets": tickets
        }
    except Exception as e:
        logger.error(f"Error fetching tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch tickets")

@api_router.get("/admin/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Get single ticket details (Admin only)"""
    try:
        ticket = await db.support_tickets.find_one({"id": ticket_id})
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        ticket["_id"] = str(ticket["_id"])
        return {"success": True, "ticket": ticket}
    except Exception as e:
        logger.error(f"Error fetching ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch ticket")

@api_router.post("/admin/tickets/{ticket_id}/reply")
async def reply_to_ticket(
    ticket_id: str,
    reply_data: TicketReplyCreate,
    current_admin: dict = Depends(get_current_admin)
):
    """Reply to a support ticket (Admin only)"""
    try:
        ticket = await db.support_tickets.find_one({"id": ticket_id})
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        reply = TicketReply(
            author=current_admin["username"],
            message=reply_data.message,
            is_admin=True
        )
        
        result = await db.support_tickets.update_one(
            {"id": ticket_id},
            {
                "$push": {"replies": reply.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to add reply")
        
        # Send email notification to customer
        email_service = await get_email_service()
        settings = await db.settings.find_one()
        if settings and settings.get('email_settings', {}).get('enabled'):
            email_service.send_ticket_reply_notification(ticket, reply.dict(), to_customer=True)
        
        return {"success": True, "message": "Reply added successfully"}
    except Exception as e:
        logger.error(f"Error replying to ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add reply")

@api_router.patch("/admin/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    status: str,
    priority: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Update ticket status and priority (Admin only)"""
    try:
        update_data = {"status": status, "updated_at": datetime.utcnow()}
        if priority:
            update_data["priority"] = priority
        
        result = await db.support_tickets.update_one(
            {"id": ticket_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"success": True, "message": "Ticket updated successfully"}
    except Exception as e:
        logger.error(f"Error updating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update ticket")

@api_router.delete("/admin/tickets/{ticket_id}")
async def delete_ticket(
    ticket_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete a ticket (Admin only)"""
    try:
        result = await db.support_tickets.delete_one({"id": ticket_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"success": True, "message": "Ticket deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete ticket")

# Admin Protected Routes - Settings
@api_router.get("/admin/settings")
async def get_settings(current_admin: dict = Depends(get_current_admin)):
    """Get system settings (Admin only)"""
    try:
        settings = await db.settings.find_one()
        if not settings:
            settings = SystemSettings().dict()
        else:
            settings["_id"] = str(settings["_id"])
        
        return {"success": True, "settings": settings}
    except Exception as e:
        logger.error(f"Error fetching settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch settings")

@api_router.put("/admin/settings")
async def update_settings(
    settings_update: SettingsUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update system settings (Admin only)"""
    try:
        existing_settings = await db.settings.find_one()
        
        if not existing_settings:
            new_settings = SystemSettings()
            if settings_update.email_settings:
                new_settings.email_settings = settings_update.email_settings
            if settings_update.seo_settings:
                new_settings.seo_settings = settings_update.seo_settings
            new_settings.updated_by = current_admin["username"]
            
            await db.settings.insert_one(new_settings.dict())
        else:
            update_data = {"updated_at": datetime.utcnow(), "updated_by": current_admin["username"]}
            if settings_update.email_settings:
                update_data["email_settings"] = settings_update.email_settings.dict()
            if settings_update.seo_settings:
                update_data["seo_settings"] = settings_update.seo_settings.dict()
            
            await db.settings.update_one({}, {"$set": update_data})
        
        return {"success": True, "message": "Settings updated successfully"}
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update settings")

@api_router.post("/admin/settings/test-email")
async def test_email_settings(current_admin: dict = Depends(get_current_admin)):
    """Test email settings (Admin only)"""
    try:
        settings = await db.settings.find_one()
        if not settings or not settings.get('email_settings'):
            raise HTTPException(status_code=400, detail="Email settings not configured")
        
        email_service = EmailService(settings['email_settings'])
        test_recipient = settings['email_settings'].get('from_email')
        
        if not test_recipient:
            raise HTTPException(status_code=400, detail="No recipient email configured")
        
        success = email_service.send_email(
            [test_recipient],
            "IXA Digital - Email Test",
            "<h2>Test Email</h2><p>Your email settings are working correctly!</p>",
            "Test Email\n\nYour email settings are working correctly!"
        )
        
        if success:
            return {"success": True, "message": "Test email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send test email")
    except Exception as e:
        logger.error(f"Error testing email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
    await init_defaults()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Application shutdown")
