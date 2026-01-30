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
    branding: dict = {
        "logo_url": "https://customer-assets.emergentagent.com/job_a08c0b50-0e68-4792-b6a6-4a15ac002d5c/artifacts/3mcpq5px_Logo.jpeg",
        "favicon_url": "",
        "company_name": "IXA Digital"
    }
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str = ""

class SettingsUpdate(BaseModel):
    email_settings: Optional[EmailSettings] = None
    seo_settings: Optional[SEOSettings] = None
    branding: Optional[dict] = None

# Content Management Models
class HeroContent(BaseModel):
    headline: str = "Results-Driven SEO, Marketing & Development Solutions"
    subheadline: str = "Helping brands grow through SEO, digital marketing, web & app development"
    cta_primary: str = "Get a Free Consultation"
    cta_secondary: str = "View Our Services"
    stats: List[dict] = [
        {"value": "500+", "label": "Projects Delivered"},
        {"value": "98%", "label": "Client Satisfaction"},
        {"value": "5+", "label": "Years Experience"}
    ]

class AboutContent(BaseModel):
    title: str = "About IXA Digital"
    subtitle: str = "Your long-term digital growth partner"
    headline: str = "Driving Measurable Growth Through Digital Excellence"
    paragraphs: List[str] = [
        "At IXA Digital, we don't just deliver projects—we deliver results.",
        "From startups to enterprises, we partner with businesses to create impactful digital solutions.",
        "Whether you need to dominate search rankings or develop cutting-edge applications—we're your growth partner."
    ]
    value_props: List[dict] = [
        {"title": "Results-Focused Execution", "description": "Every strategy tied to measurable outcomes"},
        {"title": "Scalable Solutions", "description": "Built with growth in mind from day one"},
        {"title": "True Partnership", "description": "Transparent communication and genuine commitment"}
    ]

class ServiceItem(BaseModel):
    id: int
    title: str
    description: str
    features: List[str]
    image: str

class MenuItem(BaseModel):
    label: str
    link: str
    order: int

class ProcessStep(BaseModel):
    id: int
    name: str
    description: str

class IndustryItem(BaseModel):
    id: int
    name: str
    icon: str

class FooterContent(BaseModel):
    company_description: str = "Results-driven digital growth partner delivering SEO, marketing, web & app development solutions."
    social_links: dict = {
        "facebook": "#",
        "twitter": "#",
        "linkedin": "#",
        "instagram": "#"
    }

class PageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str  # "homepage", "services", etc.
    hero: Optional[HeroContent] = None
    about: Optional[AboutContent] = None
    services: Optional[List[ServiceItem]] = None
    menu_items: Optional[List[MenuItem]] = None
    process_steps: Optional[List[ProcessStep]] = None
    industries: Optional[List[IndustryItem]] = None
    footer: Optional[FooterContent] = None
    cta_section: Optional[dict] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str = ""

class ContentUpdate(BaseModel):
    page: str
    hero: Optional[HeroContent] = None
    about: Optional[AboutContent] = None
    services: Optional[List[ServiceItem]] = None
    menu_items: Optional[List[MenuItem]] = None
    process_steps: Optional[List[ProcessStep]] = None
    industries: Optional[List[IndustryItem]] = None
    footer: Optional[FooterContent] = None
    cta_section: Optional[dict] = None
