# Create Admin User - Quick Guide

## 🔐 Problem

You're logged in but can't access `/admin` because your user account doesn't have admin privileges.

## ✅ Solution: Make Your User an Admin

### Option 1: Update Existing User (Recommended)

```sql
-- Connect to database
psql -U salahudheenpa -d pickmylab_db

-- Update your user to admin
UPDATE users 
SET user_type = 'admin', is_active = true, is_verified = true
WHERE email = 'your_email@example.com';

-- Verify the change
SELECT email, user_type, is_active FROM users WHERE email = 'your_email@example.com';
```

**Then:**
1. Logout from the frontend
2. Login again
3. Go to http://localhost:3001/admin

---

### Option 2: Create New Admin User

```sql
-- Connect to database
psql -U salahudheenpa -d pickmylab_db

-- Create admin user (you'll need to hash the password)
-- First, generate password hash using Node.js:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 10).then(hash => console.log(hash));"

-- Then insert:
INSERT INTO users (
  email, 
  phone, 
  password_hash, 
  first_name, 
  last_name, 
  user_type, 
  is_active, 
  is_verified
) VALUES (
  'admin@pickmylab.com',
  '+971501234567',
  'YOUR_BCRYPT_HASH_HERE',  -- Generate this first!
  'Admin',
  'User',
  'admin',
  true,
  true
);
```

---

### Option 3: Quick Script to Create Admin

Run this in your terminal:

```bash
cd backend
node -e "
const bcrypt = require('bcryptjs');
const email = 'admin@pickmylab.com';
const password = 'Admin123!';
bcrypt.hash(password, 10).then(hash => {
  console.log('Use this SQL:');
  console.log(\`INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_active, is_verified) VALUES ('\${email}', '+971501234567', '\${hash}', 'Admin', 'User', 'admin', true, true);\`);
});
"
```

Then copy the output and run it in psql.

---

## 🔍 Check Current User Type

```sql
-- See all users and their types
SELECT email, user_type, is_active, is_verified 
FROM users 
ORDER BY created_at DESC;
```

---

## 🚨 After Updating

1. **Logout** from the frontend (clear session)
2. **Login again** with your credentials
3. **Go to** http://localhost:3001/admin
4. You should now have access!

---

## 💡 Quick Fix Command

If you know your email, run this:

```bash
# Replace 'your_email@example.com' with your actual email
psql -U salahudheenpa -d pickmylab_db -c "UPDATE users SET user_type = 'admin', is_active = true, is_verified = true WHERE email = 'your_email@example.com';"
```

Then logout and login again!
