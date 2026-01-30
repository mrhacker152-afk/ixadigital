import requests
import sys
import json
from datetime import datetime

class IXADigitalAPITester:
    def __init__(self, base_url="https://growth-engine-49.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                    result["error"] = error_data
                except:
                    result["error"] = response.text

            self.test_results.append(result)
            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )
        return success

    def test_contact_form_submission(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+919876543210",
            "service": "web-development",
            "message": "This is a test message for contact form submission."
        }
        
        success, response = self.run_test(
            "Contact Form Submission",
            "POST",
            "api/contact",
            200,
            data=contact_data
        )
        
        if success and response.get('success'):
            print(f"   Contact ID: {response.get('id')}")
            return response.get('id')
        return None

    def test_admin_login(self):
        """Test admin login"""
        credentials = {
            "username": "admin",
            "password": "IXADigital@2026"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/admin/login",
            200,
            data=credentials
        )
        
        if success and response.get('success') and response.get('token'):
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "api/admin/stats",
            200
        )
        
        if success and response.get('success'):
            stats = response.get('stats', {})
            print(f"   Stats: Total={stats.get('total')}, New={stats.get('new')}, Read={stats.get('read')}, Contacted={stats.get('contacted')}")
        
        return success

    def test_admin_submissions(self):
        """Test admin submissions endpoint"""
        success, response = self.run_test(
            "Admin Submissions",
            "GET",
            "api/admin/submissions",
            200
        )
        
        if success and response.get('success'):
            submissions = response.get('submissions', [])
            print(f"   Found {len(submissions)} submissions")
            return submissions
        return []

    def test_update_submission_status(self, submission_id):
        """Test updating submission status"""
        success, response = self.run_test(
            "Update Submission Status",
            "PATCH",
            f"api/admin/submissions/{submission_id}/status?status=read",
            200
        )
        return success

    def test_delete_submission(self, submission_id):
        """Test deleting a submission"""
        success, response = self.run_test(
            "Delete Submission",
            "DELETE",
            f"api/admin/submissions/{submission_id}",
            200
        )
        return success

    def test_support_ticket_creation(self):
        """Test support ticket creation (public endpoint)"""
        ticket_data = {
            "customer_name": "Test Customer",
            "customer_email": "customer@example.com",
            "customer_phone": "+919876543210",
            "category": "Technical Support",
            "subject": "Test Support Ticket",
            "description": "This is a test support ticket for API testing."
        }
        
        success, response = self.run_test(
            "Support Ticket Creation",
            "POST",
            "api/support-ticket",
            200,
            data=ticket_data
        )
        
        if success and response.get('success'):
            print(f"   Ticket Number: {response.get('ticket_number')}")
            print(f"   Ticket ID: {response.get('ticket_id')}")
            return response.get('ticket_id')
        return None

    def test_admin_tickets(self):
        """Test admin tickets endpoint"""
        success, response = self.run_test(
            "Admin Tickets",
            "GET",
            "api/admin/tickets",
            200
        )
        
        if success and response.get('success'):
            tickets = response.get('tickets', [])
            print(f"   Found {len(tickets)} tickets")
            return tickets
        return []

    def test_admin_settings_get(self):
        """Test getting admin settings"""
        success, response = self.run_test(
            "Get Admin Settings",
            "GET",
            "api/admin/settings",
            200
        )
        
        if success and response.get('success'):
            settings = response.get('settings', {})
            print(f"   Settings loaded: email_settings={bool(settings.get('email_settings'))}, seo_settings={bool(settings.get('seo_settings'))}")
        
        return success

    def test_admin_settings_update(self):
        """Test updating admin settings"""
        settings_data = {
            "email_settings": {
                "smtp_host": "smtp.gmail.com",
                "smtp_port": 587,
                "smtp_user": "test@example.com",
                "smtp_password": "testpassword",
                "from_email": "test@example.com",
                "from_name": "IXA Digital Test",
                "notification_recipients": ["admin@ixadigital.com"],
                "enabled": False  # Keep disabled for testing
            },
            "seo_settings": {
                "site_title": "IXA Digital - Test Title",
                "site_description": "Test description for SEO",
                "keywords": "test, seo, digital marketing",
                "google_analytics_id": "G-TEST123456",
                "google_site_verification": "test-verification-code",
                "og_image": "https://example.com/test-image.jpg",
                "twitter_handle": "@ixadigital_test"
            }
        }
        
        success, response = self.run_test(
            "Update Admin Settings",
            "PUT",
            "api/admin/settings",
            200,
            data=settings_data
        )
        return success

    def test_ticket_reply(self, ticket_id):
        """Test replying to a ticket"""
        if not ticket_id:
            print("   Skipping ticket reply test - no ticket ID")
            return False
            
        reply_data = {
            "message": "This is a test reply from admin."
        }
        
        success, response = self.run_test(
            "Ticket Reply",
            "POST",
            f"api/admin/tickets/{ticket_id}/reply",
            200,
            data=reply_data
        )
        return success

    def test_ticket_status_update(self, ticket_id):
        """Test updating ticket status"""
        if not ticket_id:
            print("   Skipping ticket status update test - no ticket ID")
            return False
            
        success, response = self.run_test(
            "Update Ticket Status",
            "PATCH",
            f"api/admin/tickets/{ticket_id}/status?status=in_progress&priority=high",
            200
        )
        return success

    def test_seo_config_endpoint(self):
        """Test SEO config endpoint (public)"""
        success, response = self.run_test(
            "SEO Config Endpoint",
            "GET",
            "api/seo-config",
            200
        )
        
        if success:
            print(f"   SEO Config: {response}")
        
        return success

    def test_sitemap_endpoint(self):
        """Test sitemap endpoint"""
        success, response = self.run_test(
            "Sitemap XML",
            "GET",
            "api/sitemap.xml",
            200
        )
        return success

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "api/admin/submissions",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

def main():
    print("🚀 Starting IXA Digital API Tests")
    print("=" * 50)
    
    tester = IXADigitalAPITester()
    
    # Test sequence
    print("\n📋 Testing Basic Endpoints...")
    tester.test_root_endpoint()
    tester.test_seo_config_endpoint()
    tester.test_sitemap_endpoint()
    
    print("\n📝 Testing Contact Form...")
    contact_id = tester.test_contact_form_submission()
    
    print("\n🎫 Testing Support Ticket Creation...")
    ticket_id = tester.test_support_ticket_creation()
    
    print("\n🔐 Testing Admin Authentication...")
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping protected route tests")
        print_results(tester)
        return 1
    
    print("\n📊 Testing Admin Protected Routes...")
    tester.test_admin_stats()
    submissions = tester.test_admin_submissions()
    tickets = tester.test_admin_tickets()
    
    print("\n⚙️ Testing Admin Settings...")
    tester.test_admin_settings_get()
    tester.test_admin_settings_update()
    
    # Test ticket operations if we have a ticket
    if ticket_id:
        print(f"\n💬 Testing Ticket Operations for ticket: {ticket_id}")
        tester.test_ticket_reply(ticket_id)
        tester.test_ticket_status_update(ticket_id)
    
    # Test status update and deletion if we have submissions
    if submissions and len(submissions) > 0:
        test_submission_id = submissions[0].get('id')
        if test_submission_id:
            print(f"\n🔄 Testing Status Update for submission: {test_submission_id}")
            tester.test_update_submission_status(test_submission_id)
            
            print(f"\n🗑️ Testing Deletion for submission: {test_submission_id}")
            tester.test_delete_submission(test_submission_id)
    
    print("\n🚫 Testing Unauthorized Access...")
    tester.test_unauthorized_access()
    
    print_results(tester)
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            "test_results": tester.test_results
        }, f, indent=2)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def print_results(tester):
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed != tester.tests_run:
        print("\n❌ FAILED TESTS:")
        for result in tester.test_results:
            if not result["success"]:
                print(f"  - {result['test_name']}: {result.get('error', 'Status mismatch')}")

if __name__ == "__main__":
    sys.exit(main())