from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Existing models
class ContactSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    service: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "new"  # new, read, contacted, closed

class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: Optional[str] = None
    message: str

class ContactSubmissionResponse(BaseModel):
    success: bool
    message: str
    id: Optional[str] = None

class Admin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    admin: Optional[dict] = None

# New Support Ticket Models
class SupportTicket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticket_number: str  # e.g., TKT-001234
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    category: str  # Technical, Billing, General, Service Inquiry
    subject: str
    description: str
    status: str = "open"  # open, in_progress, resolved, closed
    priority: str = "medium"  # low, medium, high, urgent
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    replies: List[dict] = []

class SupportTicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    category: str
    subject: str
    description: str

class TicketReply(BaseModel):
    author: str  # admin username or "customer"
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_admin: bool = False

class TicketReplyCreate(BaseModel):
    message: str

# Settings Models
class EmailSettings(BaseModel):
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = ""
    from_name: str = "IXA Digital"
    notification_recipients: List[str] = []
    enabled: bool = False

class SEOSettings(BaseModel):
    site_title: str = "IXA Digital - Results-Driven SEO, Marketing & Development"
    site_description: str = "Leading digital agency offering SEO, digital marketing, web development, and app development services. Data-driven strategies that deliver measurable results."
    keywords: str = "SEO services, digital marketing, web development, app development, digital agency"
    google_analytics_id: str = ""
    google_site_verification: str = ""
    og_image: str = ""
    twitter_handle: str = ""

class SystemSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email_settings: EmailSettings = EmailSettings()
    seo_settings: SEOSettings = SEOSettings()
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str = ""

class SettingsUpdate(BaseModel):
    email_settings: Optional[EmailSettings] = None
    seo_settings: Optional[SEOSettings] = None
