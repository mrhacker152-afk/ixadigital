import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Save, Mail, Send, Globe, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'IXA Digital',
    notification_recipients: [],
    enabled: false
  });
  const [seoSettings, setSeoSettings] = useState({
    site_title: 'IXA Digital - Results-Driven SEO, Marketing & Development',
    site_description: '',
    keywords: '',
    google_analytics_id: '',
    google_site_verification: '',
    og_image: '',
    twitter_handle: ''
  });
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${BACKEND_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.settings.email_settings) {
        setEmailSettings(response.data.settings.email_settings);
      }
      if (response.data.settings.seo_settings) {
        setSeoSettings(response.data.settings.seo_settings);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        toast.error('Failed to fetch settings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (field, value) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSEOChange = (field, value) => {
    setSeoSettings(prev => ({ ...prev, [field]: value }));
  };

  const addRecipient = () => {
    if (recipientEmail && !emailSettings.notification_recipients.includes(recipientEmail)) {
      setEmailSettings(prev => ({
        ...prev,
        notification_recipients: [...prev.notification_recipients, recipientEmail]
      }));
      setRecipientEmail('');
    }
  };

  const removeRecipient = (email) => {
    setEmailSettings(prev => ({
      ...prev,
      notification_recipients: prev.notification_recipients.filter(e => e !== email)
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${BACKEND_URL}/api/admin/settings`,
        { email_settings: emailSettings, seo_settings: seoSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${BACKEND_URL}/api/admin/settings/test-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Test email sent! Check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send test email');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure email notifications and SEO settings</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">
            <Mail className="mr-2" size={16} />
            Email Settings
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="mr-2" size={16} />
            SEO & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={emailSettings.enabled}
                  onChange={(e) => handleEmailChange('enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label>Enable Email Notifications</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    value={emailSettings.smtp_host}
                    onChange={(e) => handleEmailChange('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={(e) => handleEmailChange('smtp_port', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div>
                <Label>SMTP Username (Email)</Label>
                <Input
                  value={emailSettings.smtp_user}
                  onChange={(e) => handleEmailChange('smtp_user', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <Label>SMTP Password (App Password for Gmail)</Label>
                <Input
                  type="password"
                  value={emailSettings.smtp_password}
                  onChange={(e) => handleEmailChange('smtp_password', e.target.value)}
                  placeholder="16-character app password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For Gmail: Go to Google Account → Security → App passwords
                </p>
              </div>

              <div>
                <Label>From Email</Label>
                <Input
                  value={emailSettings.from_email}
                  onChange={(e) => handleEmailChange('from_email', e.target.value)}
                  placeholder="notifications@ixadigital.com"
                />
              </div>

              <div>
                <Label>From Name</Label>
                <Input
                  value={emailSettings.from_name}
                  onChange={(e) => handleEmailChange('from_name', e.target.value)}
                  placeholder="IXA Digital"
                />
              </div>

              <div>
                <Label>Notification Recipients</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="admin@ixadigital.com"
                    onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  />
                  <Button onClick={addRecipient} type="button">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {emailSettings.notification_recipients.map((email, idx) => (
                    <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {email}
                      <button onClick={() => removeRecipient(email)} className="ml-2 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={testEmailSettings} variant="outline" className="flex-1">
                  <Send size={16} className="mr-2" />
                  Test Email
                </Button>
                <Button onClick={saveSettings} disabled={isSaving} className="flex-1 bg-red-600 hover:bg-red-700">
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Analytics Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site Title</Label>
                <Input
                  value={seoSettings.site_title}
                  onChange={(e) => handleSEOChange('site_title', e.target.value)}
                  placeholder="IXA Digital - Your Tagline"
                />
              </div>

              <div>
                <Label>Site Description</Label>
                <Textarea
                  value={seoSettings.site_description}
                  onChange={(e) => handleSEOChange('site_description', e.target.value)}
                  placeholder="Brief description of your agency..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Keywords (comma separated)</Label>
                <Input
                  value={seoSettings.keywords}
                  onChange={(e) => handleSEOChange('keywords', e.target.value)}
                  placeholder="SEO, digital marketing, web development"
                />
              </div>

              <div>
                <Label>Google Analytics ID</Label>
                <Input
                  value={seoSettings.google_analytics_id}
                  onChange={(e) => handleSEOChange('google_analytics_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this from Google Analytics dashboard
                </p>
              </div>

              <div>
                <Label>Google Site Verification</Label>
                <Input
                  value={seoSettings.google_site_verification}
                  onChange={(e) => handleSEOChange('google_site_verification', e.target.value)}
                  placeholder="verification code"
                />
              </div>

              <div>
                <Label>Open Graph Image URL</Label>
                <Input
                  value={seoSettings.og_image}
                  onChange={(e) => handleSEOChange('og_image', e.target.value)}
                  placeholder="https://your-domain.com/og-image.jpg"
                />
              </div>

              <div>
                <Label>Twitter Handle</Label>
                <Input
                  value={seoSettings.twitter_handle}
                  onChange={(e) => handleSEOChange('twitter_handle', e.target.value)}
                  placeholder="@ixadigital"
                />
              </div>

              <Button onClick={saveSettings} disabled={isSaving} className="w-full bg-red-600 hover:bg-red-700">
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save SEO Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-center">
        <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
