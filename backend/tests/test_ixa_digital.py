"""
IXA Digital Website - Comprehensive Backend API Tests
Tests: Admin login, dashboard stats, settings, tickets, contact form, ticket tracking
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminAuthentication:
    """Admin login and authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin@ixadigital.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "admin" in data
        assert data["admin"]["username"] == "admin@ixadigital.com"
    
    def test_admin_login_invalid_password(self):
        """Test admin login with invalid password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin@ixadigital.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    
    def test_admin_login_invalid_username(self):
        """Test admin login with invalid username"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "invalid@example.com",
            "password": "admin123"
        })
        assert response.status_code == 401


class TestAdminDashboard:
    """Admin dashboard statistics tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin@ixadigital.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_dashboard_stats(self, auth_token):
        """Test dashboard statistics endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "stats" in data
        assert "submissions" in data["stats"]
        assert "tickets" in data["stats"]
        # Verify structure
        assert "total" in data["stats"]["submissions"]
        assert "new" in data["stats"]["submissions"]
        assert "total" in data["stats"]["tickets"]
        assert "open" in data["stats"]["tickets"]
    
    def test_stats_unauthorized(self):
        """Test stats endpoint without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401


class TestAdminSettings:
    """Admin settings page tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin@ixadigital.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_settings(self, auth_token):
        """Test get settings endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "settings" in data
        # Check branding settings exist
        settings = data["settings"]
        assert "branding" in settings or "logo_url" in str(settings)
    
    def test_update_branding_settings(self, auth_token):
        """Test updating branding settings"""
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "branding": {
                    "company_name": "IXA Digital",
                    "logo_url": "https://customer-assets.emergentagent.com/job_a08c0b50-0e68-4792-b6a6-4a15ac002d5c/artifacts/3mcpq5px_Logo.jpeg",
                    "favicon_url": ""
                }
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestAdminTickets:
    """Admin tickets management tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin@ixadigital.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_all_tickets(self, auth_token):
        """Test get all tickets endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/tickets",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "tickets" in data
        assert isinstance(data["tickets"], list)
    
    def test_tickets_unauthorized(self):
        """Test tickets endpoint without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/tickets")
        assert response.status_code == 401


class TestContactForm:
    """Contact form submission tests"""
    
    def test_contact_form_submission(self):
        """Test contact form submission"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Contact User",
            "email": "test_contact@example.com",
            "phone": "+1234567890",
            "service": "Web Development",
            "message": "This is a test contact form submission."
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "message" in data
        assert "id" in data
    
    def test_contact_form_missing_fields(self):
        """Test contact form with missing required fields"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "Test User"
            # Missing email and message
        })
        assert response.status_code == 400


class TestSupportTickets:
    """Support ticket creation and tracking tests"""
    
    def test_create_support_ticket(self):
        """Test support ticket creation"""
        response = requests.post(f"{BASE_URL}/api/support-ticket", json={
            "customer_name": "TEST_Ticket User",
            "customer_email": "test_ticket@example.com",
            "customer_phone": "+1234567890",
            "category": "Technical Support",
            "subject": "Test Support Ticket",
            "description": "This is a test support ticket for verification."
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "ticket_number" in data
        assert data["ticket_number"].startswith("TKT-")
    
    def test_create_ticket_missing_fields(self):
        """Test ticket creation with missing fields"""
        response = requests.post(f"{BASE_URL}/api/support-ticket", json={
            "customer_name": "Test User"
            # Missing required fields
        })
        assert response.status_code == 400
    
    def test_track_ticket_valid(self):
        """Test ticket tracking with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/track-ticket",
            params={
                "ticket_number": "TKT-000001",
                "customer_email": "john@example.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "ticket" in data
        assert data["ticket"]["ticket_number"] == "TKT-000001"
    
    def test_track_ticket_invalid(self):
        """Test ticket tracking with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/track-ticket",
            params={
                "ticket_number": "TKT-999999",
                "customer_email": "invalid@example.com"
            }
        )
        assert response.status_code == 404


class TestPublicEndpoints:
    """Public API endpoints tests"""
    
    def test_branding_endpoint(self):
        """Test public branding endpoint"""
        response = requests.get(f"{BASE_URL}/api/branding")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "branding" in data
        assert "logo_url" in data["branding"]
        assert "company_name" in data["branding"]
    
    def test_seo_config_endpoint(self):
        """Test SEO config endpoint"""
        response = requests.get(f"{BASE_URL}/api/seo-config")
        assert response.status_code == 200
        data = response.json()
        assert "site_title" in data
        assert "site_description" in data
    
    def test_recaptcha_config_endpoint(self):
        """Test reCAPTCHA config endpoint"""
        response = requests.get(f"{BASE_URL}/api/recaptcha-config")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "enabled" in data


class TestFooterCredit:
    """Test footer credit verification via API"""
    
    def test_page_content_endpoint(self):
        """Test page content endpoint for homepage"""
        response = requests.get(f"{BASE_URL}/api/page-content/homepage")
        # May return 404 if not configured, or 200 with content
        assert response.status_code in [200, 404]


class TestAdminSubmissions:
    """Admin submissions management tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin@ixadigital.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_all_submissions(self, auth_token):
        """Test get all submissions endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/submissions",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "submissions" in data
        assert isinstance(data["submissions"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
