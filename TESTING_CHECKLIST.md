# PickMyLab - Testing Checklist

Use this checklist to systematically test all features.

## ✅ Pre-Testing Setup

- [ ] Database created (`pickmylab_db`)
- [ ] Database schema applied
- [ ] Migrations run
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Dependencies installed (backend & frontend)
- [ ] Backend server running (port 3000)
- [ ] Frontend server running (port 3001)

---

## 🔐 Authentication & User Management

### Registration
- [ ] Register new user with valid data
- [ ] Register with existing email (should fail)
- [ ] Register with invalid email format (should fail)
- [ ] Register with weak password (should fail)
- [ ] Verify user receives confirmation

### Login
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Verify JWT token is returned
- [ ] Verify token works for authenticated requests

### Profile Management
- [ ] View own profile
- [ ] Update profile information
- [ ] Update profile with invalid data (should fail)
- [ ] Verify changes are saved

### Address Management
- [ ] Add new address
- [ ] Set default address
- [ ] Update address
- [ ] Delete address
- [ ] Verify address appears in booking form

---

## 🧪 Test Catalog

### Browse Tests
- [ ] View all tests
- [ ] View test categories
- [ ] Filter tests by category
- [ ] Search tests by name
- [ ] Filter by price range
- [ ] View popular tests

### Test Details
- [ ] View test detail page
- [ ] See test description
- [ ] See sample type and preparation
- [ ] See pricing from different labs
- [ ] Compare prices
- [ ] View related tests

### Lab Partners
- [ ] View all lab partners
- [ ] View lab partner details
- [ ] See lab partner ratings
- [ ] Filter labs by location

---

## 📅 Booking System

### Create Booking
- [ ] Select test from catalog
- [ ] Click "Book This Test"
- [ ] Select lab partner
- [ ] Choose collection type (home/walk-in)
- [ ] Select collection address (if home)
- [ ] Pick date (next 30 days)
- [ ] Select time slot
- [ ] Add special requirements
- [ ] Review booking summary
- [ ] Confirm booking
- [ ] Verify booking number generated

### View Bookings
- [ ] View all bookings
- [ ] Filter bookings by status
- [ ] View booking details
- [ ] See booking timeline
- [ ] View test details in booking

### Cancel Booking
- [ ] Cancel pending booking
- [ ] Cancel confirmed booking
- [ ] Try to cancel completed booking (should fail)
- [ ] Add cancellation reason
- [ ] Verify booking status updated

---

## 💳 Payment System

### Payment Flow
- [ ] View booking with pending payment
- [ ] Click "Pay Now"
- [ ] Select payment method (card/cash/bank transfer)
- [ ] Enter payment details (for card)
- [ ] Review payment summary
- [ ] Complete payment
- [ ] Verify payment success page
- [ ] Verify booking status updated to "confirmed"

### Payment History
- [ ] View payment history
- [ ] Filter payments by status
- [ ] View payment details
- [ ] Download receipt (if implemented)
- [ ] Link to related booking

---

## 📊 Reports

### View Reports
- [ ] View all reports
- [ ] Filter reports by test
- [ ] Filter reports by date range
- [ ] View report details
- [ ] See test results
- [ ] View abnormal results highlighted

### Report Actions
- [ ] Download report PDF
- [ ] Share report
- [ ] Generate share link
- [ ] View shared report (via link)

### Smart Reports
- [ ] View smart report
- [ ] See body system overview
- [ ] Click on body system for details
- [ ] View health insights
- [ ] See recommendations
- [ ] View trend analysis (if previous reports exist)

---

## 🔔 Notifications

### Preferences
- [ ] View notification preferences
- [ ] Toggle email notifications
- [ ] Toggle SMS notifications
- [ ] Toggle push notifications
- [ ] Toggle booking reminders
- [ ] Toggle report alerts
- [ ] Save preferences
- [ ] Verify preferences saved

### Notification History
- [ ] View notification history
- [ ] Filter by type
- [ ] Filter by status
- [ ] See notification details

---

## 👨‍💼 Admin Dashboard

### Dashboard
- [ ] Access admin dashboard (as admin user)
- [ ] View statistics
- [ ] See total bookings
- [ ] See total revenue
- [ ] See user counts
- [ ] View recent bookings
- [ ] Filter by date range

### Booking Management
- [ ] View all bookings
- [ ] Filter bookings
- [ ] Update booking status
- [ ] View booking details
- [ ] Assign phlebotomist
- [ ] Auto-assign phlebotomist

### User Management
- [ ] View all users
- [ ] Filter users by type
- [ ] Search users
- [ ] Activate/deactivate users
- [ ] View user details

### Phlebotomist Management
- [ ] View all phlebotomists
- [ ] View phlebotomist details
- [ ] Assign phlebotomist to booking
- [ ] Auto-assign phlebotomist
- [ ] Update phlebotomist status
- [ ] View phlebotomist bookings
- [ ] Manage phlebotomist stock

### Content Management
- [ ] View FAQs
- [ ] Create FAQ
- [ ] Update FAQ
- [ ] Delete FAQ
- [ ] View Terms & Conditions
- [ ] Update Terms & Conditions

---

## ⭐ Ratings & Reviews

### Submit Rating
- [ ] Submit rating for lab partner
- [ ] Submit rating for phlebotomist
- [ ] Add review text
- [ ] Verify rating appears
- [ ] Try to rate twice (should fail)

### View Ratings
- [ ] View ratings for entity
- [ ] See rating summary
- [ ] See star distribution
- [ ] View individual reviews

---

## 🔒 Security Tests

### Authentication
- [ ] Access protected endpoint without token (should fail)
- [ ] Access with invalid token (should fail)
- [ ] Access with expired token (should fail)
- [ ] Access with valid token (should succeed)

### Authorization
- [ ] Access admin endpoint as regular user (should fail)
- [ ] Access phlebotomist endpoint as patient (should fail)
- [ ] Access own data (should succeed)
- [ ] Try to access other user's data (should fail)

### Input Validation
- [ ] Try SQL injection in search
- [ ] Try XSS in text fields
- [ ] Submit invalid email format
- [ ] Submit invalid phone format
- [ ] Submit negative prices
- [ ] Submit future dates where not allowed

---

## 🐛 Error Handling

### API Errors
- [ ] Test 400 Bad Request
- [ ] Test 401 Unauthorized
- [ ] Test 403 Forbidden
- [ ] Test 404 Not Found
- [ ] Test 500 Internal Server Error
- [ ] Verify error messages are user-friendly

### Frontend Errors
- [ ] Handle network errors gracefully
- [ ] Show loading states
- [ ] Show error messages
- [ ] Handle form validation errors

---

## 📱 Responsive Design

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify navigation works on all sizes
- [ ] Verify forms are usable on mobile
- [ ] Verify tables are scrollable on mobile

---

## ⚡ Performance

- [ ] API response time < 500ms for simple queries
- [ ] API response time < 2s for complex queries
- [ ] Page load time < 3s
- [ ] Images load properly
- [ ] No console errors
- [ ] No memory leaks (check over time)

---

## 📝 Test Data Creation

### Via API
```bash
# Create test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+971501234567",
    "password": "Test123!@#",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Via SQL (Optional)
```sql
-- Insert test category
INSERT INTO test_categories (name, description) 
VALUES ('Blood Tests', 'Complete blood count');

-- Insert lab partner
INSERT INTO lab_partners (name, code, email, phone, is_active)
VALUES ('Test Lab', 'TESTLAB', 'test@lab.com', '+971501234567', true);
```

---

## ✅ Completion Criteria

All tests pass when:
- [ ] All API endpoints respond correctly
- [ ] All frontend pages load and function
- [ ] No critical errors in console
- [ ] No security vulnerabilities found
- [ ] Performance is acceptable
- [ ] User flows work end-to-end

---

**Testing Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete
