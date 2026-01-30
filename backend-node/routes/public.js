const express = require('express');
const router = express.Router();
const { databases } = require('../database');

// Get branding configuration (public)
router.get('/branding', async (req, res) => {
  try {
    await databases.settings.read();
    res.set('Cache-Control', 'public, max-age=300'); // 5 min cache
    res.json({
      success: true,
      branding: databases.settings.data.branding
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get SEO config (public)
router.get('/seo-config', async (req, res) => {
  try {
    await databases.settings.read();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(databases.settings.data.seo);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reCAPTCHA config (public)
router.get('/recaptcha-config', async (req, res) => {
  try {
    await databases.settings.read();
    const recaptcha = databases.settings.data.recaptcha;
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      success: true,
      enabled: recaptcha.enabled,
      site_key: recaptcha.site_key
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get page content (public)
router.get('/page-content/:page', async (req, res) => {
  try {
    await databases.content.read();
    const pageContent = databases.content.data[req.params.page];
    
    if (!pageContent) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ success: true, content: pageContent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit contact form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, service, message, recaptcha_token } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, detail: 'Missing required fields' });
    }
    
    // Verify reCAPTCHA if enabled
    if (recaptcha_token) {
      const verified = await verifyRecaptcha(recaptcha_token);
      if (!verified) {
        return res.status(400).json({ 
          success: false, 
          detail: 'reCAPTCHA verification failed' 
        });
      }
    }
    
    await databases.submissions.read();
    
    const submission = {
      id: require('../database').generateId(),
      name,
      email,
      phone: phone || '',
      service: service || '',
      message,
      status: 'new',
      created_at: new Date().toISOString()
    };
    
    databases.submissions.data.submissions.push(submission);
    await databases.submissions.write();
    
    // Send email notification (if configured)
    await sendEmailNotification('contact', submission);
    
    res.json({
      success: true,
      message: "Thank you for your inquiry! We'll get back to you within 24 hours.",
      id: submission.id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, detail: 'Failed to submit form' });
  }
});

// Create support ticket
router.post('/support-ticket', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, category, subject, description, recaptcha_token } = req.body;
    
    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !category || !subject || !description) {
      return res.status(400).json({ success: false, detail: 'Missing required fields' });
    }
    
    // Verify reCAPTCHA if enabled
    if (recaptcha_token) {
      const verified = await verifyRecaptcha(recaptcha_token);
      if (!verified) {
        return res.status(400).json({ 
          success: false, 
          detail: 'reCAPTCHA verification failed' 
        });
      }
    }
    
    await databases.tickets.read();
    
    const ticketNumber = require('../database').generateTicketNumber(databases.tickets.data.counter);
    databases.tickets.data.counter += 1;
    
    const ticket = {
      id: require('../database').generateId(),
      ticket_number: ticketNumber,
      customer_name,
      customer_email,
      customer_phone,
      category,
      subject,
      description,
      status: 'open',
      priority: 'medium',
      replies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    databases.tickets.data.tickets.push(ticket);
    await databases.tickets.write();
    
    // Send email notification (if configured)
    await sendEmailNotification('ticket', ticket);
    
    res.json({
      success: true,
      message: 'Support ticket created successfully',
      ticket_number: ticketNumber,
      ticket_id: ticket.id
    });
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ success: false, detail: 'Failed to create ticket' });
  }
});

// Track ticket (public with email verification)
router.post('/track-ticket', async (req, res) => {
  try {
    const { ticket_number, customer_email } = req.query;
    
    if (!ticket_number || !customer_email) {
      return res.status(400).json({ success: false, detail: 'Ticket number and email required' });
    }
    
    await databases.tickets.read();
    const ticket = databases.tickets.data.tickets.find(
      t => t.ticket_number === ticket_number && t.customer_email === customer_email
    );
    
    if (!ticket) {
      return res.status(404).json({ success: false, detail: 'Ticket not found or email doesn\'t match' });
    }
    
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, detail: 'Failed to track ticket' });
  }
});

// Customer reply to ticket
router.post('/ticket/:ticketId/customer-reply', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reply_message, customer_email } = req.query;
    
    await databases.tickets.read();
    const ticket = databases.tickets.data.tickets.find(
      t => t.id === ticketId && t.customer_email === customer_email
    );
    
    if (!ticket) {
      return res.status(404).json({ success: false, detail: 'Ticket not found or email doesn\'t match' });
    }
    
    if (ticket.status === 'closed') {
      return res.status(400).json({ success: false, detail: 'Cannot reply to closed ticket' });
    }
    
    ticket.replies.push({
      author: ticket.customer_name,
      message: reply_message,
      is_admin: false,
      created_at: new Date().toISOString()
    });
    
    ticket.updated_at = new Date().toISOString();
    await databases.tickets.write();
    
    res.json({ success: true, message: 'Reply added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, detail: 'Failed to add reply' });
  }
});

// Generate sitemap
router.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://ixadigital.com';
  const today = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/track-ticket</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
  
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Helper: Verify reCAPTCHA
async function verifyRecaptcha(token) {
  try {
    await databases.settings.read();
    const recaptcha = databases.settings.data.recaptcha;
    
    if (!recaptcha.enabled || !recaptcha.secret_key) {
      return true; // If not configured, allow
    }
    
    const axios = require('axios');
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: recaptcha.secret_key,
        response: token
      }
    });
    
    return response.data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return true; // Fail open
  }
}

// Helper: Send email notifications
async function sendEmailNotification(type, data) {
  try {
    await databases.settings.read();
    const emailSettings = databases.settings.data.email;
    
    if (!emailSettings.enabled || !emailSettings.smtp_user) {
      return;
    }
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port,
      secure: false,
      auth: {
        user: emailSettings.smtp_user,
        pass: emailSettings.smtp_password
      }
    });
    
    let subject, html;
    
    if (type === 'contact') {
      subject = `New Inquiry from ${data.name}`;
      html = `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Service:</strong> ${data.service || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `;
    } else if (type === 'ticket') {
      subject = `New Support Ticket #${data.ticket_number}`;
      html = `
        <h2>New Support Ticket</h2>
        <p><strong>Ticket:</strong> ${data.ticket_number}</p>
        <p><strong>Customer:</strong> ${data.customer_name}</p>
        <p><strong>Email:</strong> ${data.customer_email}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Description:</strong></p>
        <p>${data.description}</p>
      `;
    }
    
    await transporter.sendMail({
      from: `"${emailSettings.from_name}" <${emailSettings.from_email}>`,
      to: emailSettings.notification_recipients.join(', '),
      subject,
      html
    });
  } catch (error) {
    console.error('Email notification error:', error);
  }
}

module.exports = router;
