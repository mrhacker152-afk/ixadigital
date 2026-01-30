import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Save, Mail, Send, Globe, TrendingUp, Upload, Image } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [branding, setBranding] = useState({
    logo_url: '',
    favicon_url: '',
    company_name: 'IXA Digital'
  });
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
  const [recaptchaSettings, setRecaptchaSettings] = useState({
    enabled: false,
    site_key: '',
    secret_key: ''
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
      if (response.data.settings.branding) {
        setBranding(response.data.settings.branding);
      }
      if (response.data.settings.recaptcha_settings) {
        setRecaptchaSettings(response.data.settings.recaptcha_settings);
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
        { 
          email_settings: emailSettings, 
          seo_settings: seoSettings,
          branding: branding,
          recaptcha_settings: recaptchaSettings
        },
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BACKEND_URL}/api/admin/upload-logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setBranding({ ...branding, logo_url: response.data.url });
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File size must be less than 1MB');
      return;
    }

    setIsUploadingFavicon(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BACKEND_URL}/api/admin/upload-favicon`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setBranding({ ...branding, favicon_url: response.data.url });
      toast.success('Favicon uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload favicon');
    } finally {
      setIsUploadingFavicon(false);
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

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">
            <Image className="mr-2" size={16} />
            Branding
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2" size={16} />
            Email
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="mr-2" size={16} />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security">
            <Save className="mr-2" size={16} />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Favicon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={branding.company_name}
                  onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
                  placeholder="IXA Digital"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <Label>Website Logo</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Recommended: PNG or SVG format, max 5MB
                </p>
                {branding.logo_url && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-xs text-gray-600 mb-2">Current Logo:</p>
                    <img
                      src={branding.logo_url.startsWith('http') ? branding.logo_url : `${BACKEND_URL}${branding.logo_url}`}
                      alt="Current Logo"
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="flex-1"
                  />
                  <Button disabled={isUploadingLogo} variant="outline">
                    <Upload size={16} className="mr-2" />
                    {isUploadingLogo ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <Label>Favicon</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Recommended: ICO or PNG format (16x16 or 32x32), max 1MB
                </p>
                {branding.favicon_url && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-xs text-gray-600 mb-2">Current Favicon:</p>
                    <img
                      src={branding.favicon_url.startsWith('http') ? branding.favicon_url : `${BACKEND_URL}${branding.favicon_url}`}
                      alt="Current Favicon"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg"
                    onChange={handleFaviconUpload}
                    disabled={isUploadingFavicon}
                    className="flex-1"
                  />
                  <Button disabled={isUploadingFavicon} variant="outline">
                    <Upload size={16} className="mr-2" />
                    {isUploadingFavicon ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>

              <Button onClick={saveSettings} disabled={isSaving} className="w-full bg-red-600 hover:bg-red-700">
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Branding Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
