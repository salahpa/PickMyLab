# PickMyLab - Admin Management Guide

## 🎯 Overview

The admin panel allows you to manage tests, categories, lab partners, and pricing from the web interface. This guide explains how to add and manage data.

---

## 🔐 Accessing Admin Panel

1. **Login as Admin User**
   - You need a user account with `user_type = 'admin'` or `'ops'`
   - If you don't have one, create it via SQL:
   ```sql
   -- Create admin user
   INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_active, is_verified)
   VALUES (
     'admin@pickmylab.com',
     '+971501234567',
     '$2b$10$...', -- Use bcrypt to hash your password
     'Admin',
     'User',
     'admin',
     true,
     true
   );
   ```

2. **Navigate to Admin Dashboard**
   - Login at: http://localhost:3001/login
   - Go to: http://localhost:3001/admin

---

## 📋 Step-by-Step: Adding Test Data

### Step 1: Create Test Categories

1. Go to **Admin Dashboard** → Click **"Manage Categories"**
2. Click **"Add New Category"**
3. Fill in:
   - **Category Name**: e.g., "Blood Tests"
   - **Slug**: Auto-generated (or enter manually)
   - **Description**: Optional description
   - **Display Order**: Order in which it appears (0 = first)
   - **Active**: Check to make it visible
4. Click **"Create Category"**

**Example Categories:**
- Blood Tests
- Heart Health
- Diabetes
- General Health
- Women's Health

---

### Step 2: Add Lab Partners

1. Go to **Admin Dashboard** → Click **"Manage Lab Partners"**
2. Click **"Add New Lab Partner"**
3. Fill in:
   - **Lab Name**: e.g., "City Lab"
   - **Lab Code**: Unique code, e.g., "CITYLAB"
   - **Contact Email**: lab@example.com
   - **Contact Phone**: +971501234567
   - **Address**: Full address
   - **City**: e.g., "Dubai"
   - **Service Zones**: Comma-separated, e.g., "Dubai, Abu Dhabi"
   - **Commission Percentage**: e.g., 15.5
   - **Active**: Check to make it available
4. Click **"Create Lab Partner"**

**Example Lab Partners:**
- City Lab (CITYLAB)
- Advanced Diagnostics (AD001)
- MedLab (ML001)

---

### Step 3: Add Tests

1. Go to **Admin Dashboard** → Click **"Manage Tests"**
2. Click **"Add New Test"**
3. Fill in:
   - **Test Name**: e.g., "Complete Blood Count"
   - **Test Code**: Unique code, e.g., "CBC"
   - **Category**: Select from dropdown
   - **Description**: What the test is for
   - **Sample Type**: Blood, Urine, Stool, Saliva, Other
   - **Fasting Required**: Check if needed
   - **Special Instructions**: Any preparation needed
   - **Active**: Check to make it visible
4. Click **"Create Test"**

**Example Tests:**
- Complete Blood Count (CBC) - Blood
- Lipid Profile (LIPID) - Blood
- HbA1c (HBA1C) - Blood
- Urine Analysis (UA) - Urine

---

### Step 4: Add Test Pricing (Via API)

Currently, pricing is managed via API. You can add it using curl or Postman:

```bash
# Add pricing for a test from a lab partner
curl -X POST http://localhost:3000/api/admin/pricing \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lab_partner_id": "LAB_PARTNER_UUID",
    "test_id": "TEST_UUID",
    "price": 150.00,
    "turnaround_time_hours": 24,
    "is_available": true
  }'
```

**To get IDs:**
- Lab Partner ID: Check in "Manage Lab Partners" (view source or use browser dev tools)
- Test ID: Check in "Manage Tests"

---

## 🔄 Quick Setup Example

### 1. Create Category
```
Name: Blood Tests
Slug: blood-tests
Description: Complete blood count and related tests
Display Order: 1
Active: ✓
```

### 2. Create Lab Partner
```
Name: City Lab
Code: CITYLAB
Email: info@citylab.com
Phone: +97141234567
City: Dubai
Service Zones: Dubai, Abu Dhabi
Active: ✓
```

### 3. Create Test
```
Name: Complete Blood Count
Code: CBC
Category: Blood Tests
Description: Full blood count test
Sample Type: Blood
Fasting Required: ✗
Active: ✓
```

### 4. Add Pricing (API)
```bash
# Get your admin token first by logging in
TOKEN="your_jwt_token_here"

# Add pricing
curl -X POST http://localhost:3000/api/admin/pricing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lab_partner_id": "LAB_UUID",
    "test_id": "TEST_UUID",
    "price": 150.00,
    "turnaround_time_hours": 24,
    "is_available": true
  }'
```

---

## 📝 Admin Routes

### Frontend Routes:
- `/admin` - Dashboard
- `/admin/tests` - Manage Tests
- `/admin/categories` - Manage Categories
- `/admin/lab-partners` - Manage Lab Partners

### Backend API Routes:
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

- `GET /api/admin/tests` - Get all tests
- `POST /api/admin/tests` - Create test
- `PUT /api/admin/tests/:id` - Update test
- `DELETE /api/admin/tests/:id` - Delete test

- `GET /api/admin/lab-partners` - Get all lab partners
- `POST /api/admin/lab-partners` - Create lab partner
- `PUT /api/admin/lab-partners/:id` - Update lab partner
- `DELETE /api/admin/lab-partners/:id` - Delete lab partner

- `GET /api/admin/lab-partners/:id/pricing` - Get pricing
- `POST /api/admin/pricing` - Create/Update pricing
- `DELETE /api/admin/pricing/:id` - Delete pricing

---

## ✅ Verification

After adding data:

1. **Check Tests Page**
   - Go to: http://localhost:3001/tests
   - You should see your tests listed
   - Search should work

2. **Check Test Details**
   - Click on a test
   - Should show pricing from lab partners

3. **Check Home Page**
   - Categories should appear
   - Popular tests should show (if there are bookings)

---

## 🚨 Common Issues

### Issue: "No tests found" when searching

**Solution:**
1. Make sure you've created:
   - At least one test category
   - At least one test
   - At least one lab partner
   - Pricing for the test

2. Check that tests are marked as "Active"

3. Verify database has data:
   ```sql
   SELECT COUNT(*) FROM tests;
   SELECT COUNT(*) FROM test_categories;
   SELECT COUNT(*) FROM lab_partners;
   SELECT COUNT(*) FROM lab_test_pricing;
   ```

### Issue: Can't access admin panel

**Solution:**
1. Make sure you're logged in
2. Check user type is 'admin' or 'ops':
   ```sql
   SELECT email, user_type FROM users WHERE email = 'your_email@example.com';
   ```

### Issue: Tests don't show pricing

**Solution:**
1. Make sure you've added pricing via API
2. Check pricing is marked as available:
   ```sql
   SELECT * FROM lab_test_pricing WHERE test_id = 'TEST_UUID';
   ```

---

## 📊 Sample Data Script

You can also insert sample data directly via SQL:

```sql
-- Insert category
INSERT INTO test_categories (name, slug, description, display_order, is_active)
VALUES ('Blood Tests', 'blood-tests', 'Complete blood count and related tests', 1, true)
RETURNING id;

-- Insert lab partner
INSERT INTO lab_partners (name, code, contact_email, contact_phone, city, service_zones, is_active)
VALUES ('City Lab', 'CITYLAB', 'info@citylab.com', '+97141234567', 'Dubai', ARRAY['Dubai', 'Abu Dhabi'], true)
RETURNING id;

-- Insert test
INSERT INTO tests (name, code, category_id, description, sample_type, is_active)
VALUES (
  'Complete Blood Count',
  'CBC',
  (SELECT id FROM test_categories WHERE slug = 'blood-tests' LIMIT 1),
  'Full blood count test',
  'blood',
  true
)
RETURNING id;

-- Insert pricing
INSERT INTO lab_test_pricing (lab_partner_id, test_id, price, turnaround_time_hours, is_available)
VALUES (
  (SELECT id FROM lab_partners WHERE code = 'CITYLAB' LIMIT 1),
  (SELECT id FROM tests WHERE code = 'CBC' LIMIT 1),
  150.00,
  24,
  true
);
```

---

## 🎉 You're Ready!

Once you've added:
- ✅ Categories
- ✅ Lab Partners
- ✅ Tests
- ✅ Pricing

Your test catalog will be fully functional and searchable!

---

**Need Help?** Check the API documentation in `API_STRUCTURE.md` or the testing guide in `TESTING_GUIDE.md`.
