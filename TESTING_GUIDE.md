# PickMyLab - Complete Testing Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the APIs](#testing-the-apis)
7. [Testing the Frontend](#testing-the-frontend)
8. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   npm --version
   ```

2. **PostgreSQL** (v14 or higher)
   ```bash
   psql --version  # Should be v14+
   ```

3. **Git** (for cloning)
   ```bash
   git --version
   ```

### Optional but Recommended

- **Postman** or **Insomnia** (for API testing)
- **pgAdmin** or **DBeaver** (for database management)

---

## Database Setup

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install and start PostgreSQL service

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pickmylab_db;

# Create user (optional, or use postgres)
CREATE USER pickmylab_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pickmylab_db TO pickmylab_user;

# Exit psql
\q
```

### Step 3: Run Database Schema

```bash
# Navigate to project directory
cd /Users/salahudheenpa/Documents/tasheel

# Run schema
psql -U postgres -d pickmylab_db -f database_schema.sql
```

**Expected Output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
...
```

### Step 4: Run Migrations

```bash
# Run additional migrations
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_payments_table.sql
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_notification_tables.sql
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_phlebotomist_tables.sql
```

### Step 5: Verify Database

```bash
# Connect to database
psql -U postgres -d pickmylab_db

# List tables
\dt

# Should show 30+ tables including:
# - users
# - bookings
# - tests
# - lab_partners
# - payments
# - lab_reports
# etc.

# Exit
\q
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd /Users/salahudheenpa/Documents/tasheel/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added 150 packages, and audited 151 packages in 30s
```

### Step 3: Create Environment File

```bash
# Copy example file
cp env.example.txt .env

# Or create manually
touch .env
```

### Step 4: Configure Environment Variables

Edit `.env` file with your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pickmylab_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d

# Email Configuration (Optional for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@pickmylab.com

# Frontend URL
FRONTEND_URL=http://localhost:3001

# File Upload Directory
UPLOAD_DIR=./uploads/reports
```

**Important:** 
- Replace `your_postgres_password` with your actual PostgreSQL password
- Generate a strong `JWT_SECRET` (at least 32 characters)
- Email settings are optional for basic testing

### Step 5: Create Upload Directory

```bash
mkdir -p uploads/reports
```

### Step 6: Test Database Connection

```bash
# Start backend (will test connection)
npm run dev
```

**Expected Output:**
```
Database connected successfully
PickMyLab API is running on port 3000
```

If you see connection errors, check:
- PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Database credentials in `.env` are correct
- Database `pickmylab_db` exists

### Step 7: Verify Backend is Running

Open browser or use curl:
```bash
curl http://localhost:3000/api
```

**Expected Response:**
```json
{
  "success": true,
  "message": "PickMyLab Healthcare Platform API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd /Users/salahudheenpa/Documents/tasheel/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added 200 packages, and audited 201 packages in 45s
```

### Step 3: Create Environment File (Optional)

```bash
# Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

Or create `.env` manually:
```env
VITE_API_URL=http://localhost:3000/api
```

### Step 4: Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
```

### Step 5: Verify Frontend is Running

Open browser: http://localhost:3001

You should see the PickMyLab homepage.

---

## Running the Application

### Start Both Services

**Terminal 1 - Backend:**
```bash
cd /Users/salahudheenpa/Documents/tasheel/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/salahudheenpa/Documents/tasheel/frontend
npm run dev
```

### Using the Setup Script

```bash
# Make script executable
chmod +x setup.sh

# Run setup (installs dependencies for both)
./setup.sh
```

---

## Testing the APIs

### 1. Test API Health

```bash
curl http://localhost:3000/api
```

### 2. Test User Registration

```bash
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

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Test User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Save the token** from response for authenticated requests:
```bash
export TOKEN="your_jwt_token_here"
```

### 4. Test Authenticated Endpoint

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Test Test Catalog

```bash
# Get all tests
curl http://localhost:3000/api/tests

# Get test categories
curl http://localhost:3000/api/tests/categories

# Search tests
curl "http://localhost:3000/api/tests?search=blood&category_id=CATEGORY_UUID"
```

### 6. Test Lab Partners

```bash
curl http://localhost:3000/api/labs
```

### 7. Test Booking Creation

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tests": [{"test_id": "TEST_UUID"}],
    "lab_partner_id": "LAB_UUID",
    "collection_type": "home",
    "collection_address_id": "ADDRESS_UUID",
    "preferred_date": "2026-01-25",
    "preferred_time_slot": "10:00-12:00"
  }'
```

### 8. Test Payment

```bash
# Initiate payment
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_UUID",
    "payment_method": "card"
  }'
```

---

## Testing the Frontend

### 1. User Registration Flow

1. Open http://localhost:3001
2. Click "Register"
3. Fill in registration form
4. Submit and verify success

### 2. User Login Flow

1. Click "Login"
2. Enter email and password
3. Verify redirect to home/dashboard

### 3. Browse Tests

1. Navigate to "Tests" or click from homepage
2. Test search functionality
3. Test filters (category, price range)
4. Click on a test to see details

### 4. Create Booking

1. Select a test
2. Click "Book This Test"
3. Select lab partner
4. Choose collection type
5. Select address (if home collection)
6. Pick date and time
7. Review and confirm

### 5. Make Payment

1. Go to "My Bookings"
2. Click "Pay Now" on a pending booking
3. Select payment method
4. Enter payment details (mock)
5. Complete payment

### 6. View Reports

1. Go to "Reports"
2. View report list
3. Click on a report to see details
4. Test download functionality
5. View smart report

### 7. Admin Dashboard

1. Login as admin user
2. Navigate to `/admin`
3. View dashboard statistics
4. Test booking management
5. Test user management

---

## Complete Test Checklist

### Backend API Tests

- [ ] Health check endpoint
- [ ] User registration
- [ ] User login
- [ ] Get user profile
- [ ] Update profile
- [ ] Add address
- [ ] Get addresses
- [ ] Get test categories
- [ ] Get tests (with filters)
- [ ] Get test details
- [ ] Get lab partners
- [ ] Create booking
- [ ] Get bookings
- [ ] Get booking details
- [ ] Cancel booking
- [ ] Initiate payment
- [ ] Confirm payment
- [ ] Get payment history
- [ ] Get reports
- [ ] Get report details
- [ ] Download report
- [ ] Get smart report
- [ ] Get notifications
- [ ] Update notification preferences

### Frontend Tests

- [ ] Homepage loads
- [ ] Registration page
- [ ] Login page
- [ ] Profile page
- [ ] Tests listing page
- [ ] Test detail page
- [ ] Booking flow
- [ ] Payment page
- [ ] Bookings list
- [ ] Booking detail
- [ ] Reports list
- [ ] Report detail
- [ ] Smart report
- [ ] Notification preferences
- [ ] Admin dashboard (if admin user)

### Database Tests

- [ ] All tables created
- [ ] Foreign keys working
- [ ] Indexes created
- [ ] Triggers working
- [ ] Can insert test data
- [ ] Can query data
- [ ] Relationships working

---

## Common Issues & Troubleshooting

### Issue 1: Database Connection Error

**Error:** `Connection refused` or `password authentication failed`

**Solutions:**
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Start PostgreSQL
brew services start postgresql@14  # macOS
sudo systemctl start postgresql  # Linux

# Verify credentials in .env
# Test connection manually
psql -U postgres -d pickmylab_db
```

### Issue 2: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find process using port
lsof -i :3000  # macOS/Linux

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Issue 3: Module Not Found

**Error:** `Cannot find module 'express'`

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: CORS Error

**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS is configured in `backend/src/app.js`
- Ensure frontend URL matches exactly

### Issue 5: JWT Token Invalid

**Error:** `Invalid token` or `Token expired`

**Solutions:**
- Check `JWT_SECRET` in `.env` matches
- Verify token is being sent in Authorization header
- Check token hasn't expired
- Login again to get new token

### Issue 6: Database Migration Errors

**Error:** `relation already exists` or `column does not exist`

**Solutions:**
```bash
# Drop and recreate database (CAUTION: deletes all data)
dropdb pickmylab_db
createdb pickmylab_db
psql -U postgres -d pickmylab_db -f database_schema.sql
```

### Issue 7: Frontend Can't Connect to API

**Error:** `Network Error` or `Failed to fetch`

**Solutions:**
- Verify backend is running on port 3000
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for detailed error
- Verify CORS is configured

---

## Sample Test Data

### Create Test User via API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "phone": "+971501234567",
    "password": "Password123!",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-15",
    "gender": "male"
  }'
```

### Insert Test Data via SQL (Optional)

```sql
-- Connect to database
psql -U postgres -d pickmylab_db

-- Insert test category
INSERT INTO test_categories (name, description, display_order) 
VALUES ('Blood Tests', 'Complete blood count and related tests', 1);

-- Insert lab partner
INSERT INTO lab_partners (name, code, email, phone, address, city, is_active)
VALUES ('City Lab', 'CITYLAB', 'info@citylab.com', '+97141234567', '123 Main St', 'Dubai', true);

-- Insert test
INSERT INTO tests (name, code, description, category_id, sample_type, preparation_instructions)
VALUES ('Complete Blood Count', 'CBC', 'Full blood count test', 
  (SELECT id FROM test_categories WHERE name = 'Blood Tests' LIMIT 1),
  'blood', 'Fasting not required');

-- Exit
\q
```

---

## Performance Testing

### Test API Response Times

```bash
# Time API calls
time curl http://localhost:3000/api/tests

# Test with multiple requests
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s http://localhost:3000/api/tests
done
```

### Database Query Performance

```sql
-- Check slow queries
EXPLAIN ANALYZE SELECT * FROM bookings WHERE user_id = 'USER_UUID';

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```

---

## Security Testing

### Test Authentication

```bash
# Try accessing protected endpoint without token
curl http://localhost:3000/api/auth/profile
# Should return 401 Unauthorized

# Try with invalid token
curl -H "Authorization: Bearer invalid_token" http://localhost:3000/api/auth/profile
# Should return 401 Unauthorized
```

### Test Input Validation

```bash
# Try SQL injection
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"; DROP TABLE users;--", "password": "test"}'
# Should be sanitized and rejected
```

---

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Optimize** slow queries or endpoints
3. **Add unit tests** for critical functions
4. **Add integration tests** for API endpoints
5. **Set up CI/CD** for automated testing
6. **Prepare for deployment**

---

## Quick Reference Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Check database
psql -U postgres -d pickmylab_db

# View logs
tail -f backend/logs/app.log  # If logging to file

# Test API
curl http://localhost:3000/api

# Check processes
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
```

---

**Happy Testing! 🧪**
