import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self, settings: dict):
        self.smtp_host = settings.get('smtp_host', 'smtp.gmail.com')
        self.smtp_port = settings.get('smtp_port', 587)
        self.smtp_user = settings.get('smtp_user', '')
        self.smtp_password = settings.get('smtp_password', '')
        self.from_email = settings.get('from_email', '')
        self.from_name = settings.get('from_name', 'IXA Digital')
        self.enabled = settings.get('enabled', False)

    def send_email(self, to_emails: List[str], subject: str, html_body: str, plain_body: str = None) -> bool:
        """Send email via SMTP"""
        if not self.enabled:
            logger.warning("Email service is disabled")
            return False

        if not self.smtp_user or not self.smtp_password:
            logger.warning("Email credentials not configured")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = ", ".join(to_emails)
            msg['Subject'] = subject

            # Add plain text and HTML parts
            if plain_body:
                msg.attach(MIMEText(plain_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            # Connect and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {to_emails}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

    def send_new_inquiry_notification(self, submission: dict, recipients: List[str]) -> bool:
        """Send notification for new contact form submission"""
        subject = f"New Inquiry from {submission['name']}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #DC2626; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #DC2626; }}
                .footer {{ margin-top: 20px; padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Contact Inquiry</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">Name:</span> {submission['name']}
                    </div>
                    <div class="field">
                        <span class="label">Email:</span> <a href="mailto:{submission['email']}">{submission['email']}</a>
                    </div>
                    <div class="field">
                        <span class="label">Phone:</span> <a href="tel:{submission['phone']}">{submission['phone']}</a>
                    </div>
                    {f'<div class="field"><span class="label">Service:</span> {submission.get("service", "Not specified")}</div>' if submission.get('service') else ''}
                    <div class="field">
                        <span class="label">Message:</span>
                        <p>{submission['message']}</p>
                    </div>
                    <div class="field">
                        <span class="label">Submitted:</span> {submission.get('created_at', 'Just now')}
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated notification from IXA Digital website.</p>
                    <p>Login to admin panel to respond: <a href="/admin/login">Admin Portal</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        plain_body = f"""
        New Contact Inquiry
        
        Name: {submission['name']}
        Email: {submission['email']}
        Phone: {submission['phone']}
        Service: {submission.get('service', 'Not specified')}
        
        Message:
        {submission['message']}
        
        Submitted: {submission.get('created_at', 'Just now')}
        """
        
        return self.send_email(recipients, subject, html_body, plain_body)

    def send_ticket_notification(self, ticket: dict, recipients: List[str]) -> bool:
        """Send notification for new support ticket"""
        subject = f"New Support Ticket #{ticket['ticket_number']} - {ticket['subject']}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #DC2626; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #DC2626; }}
                .badge {{ display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }}
                .priority-high {{ background: #FEE2E2; color: #991B1B; }}
                .priority-medium {{ background: #FEF3C7; color: #92400E; }}
                .footer {{ margin-top: 20px; padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Support Ticket</h2>
                    <p>#{ticket['ticket_number']}</p>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">Customer:</span> {ticket['customer_name']}
                    </div>
                    <div class="field">
                        <span class="label">Email:</span> <a href="mailto:{ticket['customer_email']}">{ticket['customer_email']}</a>
                    </div>
                    <div class="field">
                        <span class="label">Phone:</span> {ticket['customer_phone']}
                    </div>
                    <div class="field">
                        <span class="label">Category:</span> {ticket['category']}
                    </div>
                    <div class="field">
                        <span class="label">Priority:</span> 
                        <span class="badge priority-{ticket['priority']}">{ticket['priority'].upper()}</span>
                    </div>
                    <div class="field">
                        <span class="label">Subject:</span> {ticket['subject']}
                    </div>
                    <div class="field">
                        <span class="label">Description:</span>
                        <p>{ticket['description']}</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Login to admin panel to respond to this ticket.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(recipients, subject, html_body)

    def send_ticket_reply_notification(self, ticket: dict, reply: dict, to_customer: bool = True) -> bool:
        """Send notification when ticket receives a reply"""
        recipient = [ticket['customer_email']] if to_customer else []
        
        if not recipient:
            return False
            
        subject = f"Re: Support Ticket #{ticket['ticket_number']} - {ticket['subject']}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #DC2626; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
                .reply {{ background: white; padding: 15px; border-left: 4px solid #DC2626; margin: 10px 0; }}
                .footer {{ margin-top: 20px; padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Ticket Update</h2>
                    <p>#{ticket['ticket_number']}</p>
                </div>
                <div class="content">
                    <p>Hello {ticket['customer_name']},</p>
                    <p>Your support ticket has been updated:</p>
                    <div class="reply">
                        <p><strong>Response from IXA Digital Team:</strong></p>
                        <p>{reply['message']}</p>
                    </div>
                    <p><strong>Original Subject:</strong> {ticket['subject']}</p>
                    <p><strong>Status:</strong> {ticket['status'].title()}</p>
                </div>
                <div class="footer">
                    <p>If you have any questions, please reply to this email or contact us.</p>
                    <p>Email: ixadigitalcom@gmail.com | Phone: +919436481775</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(recipient, subject, html_body)
