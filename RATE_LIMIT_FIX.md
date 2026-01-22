# Rate Limit Fix & Data Persistence Guide

## 🚨 Issue 1: Rate Limiting Blocking Login

### Problem
"Too many requests from this IP, please try again later"

### Solution Applied
I've updated the rate limiters to be more lenient in development:
- **Auth limiter**: Increased from 50 to 200 requests per 15 minutes
- **API limiter**: Increased from 100 to 1000 requests per 15 minutes
- **Localhost skip**: Added skip for localhost IPs in development

### Quick Fix (If Still Blocked)

**Option 1: Restart Backend Server**
```bash
# Stop the backend (Ctrl+C)
# Start again
cd backend
npm run dev
```

**Option 2: Wait 15 Minutes**
The rate limit resets after 15 minutes.

**Option 3: Clear Rate Limit (Development Only)**
The rate limiter uses in-memory storage, so restarting the server clears it.

---

## 📊 Issue 2: Data Disappearing

### Good News: Your Data is Safe!

I checked the database - your data is still there:
- ✅ **8 tests** found in database
- ✅ **3 lab partners** found
- ✅ Categories exist

### Why It Might Seem Like Data Disappeared

1. **Frontend Cache Issue**
   - The frontend might be showing cached empty data
   - Solution: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

2. **Filter/Search Active**
   - Check if you have a search term or filter active
   - Clear filters to see all data

3. **Not Logged In as Admin**
   - Make sure you're logged in as admin
   - Check: http://localhost:3001/admin

4. **API Error**
   - Check browser console (F12) for errors
   - Check network tab for failed requests

### Verify Your Data

```sql
-- Check categories
SELECT id, name, slug, is_active FROM test_categories ORDER BY created_at DESC;

-- Check tests
SELECT id, name, code, is_active FROM tests ORDER BY created_at DESC;

-- Check lab partners
SELECT id, name, code, is_active FROM lab_partners ORDER BY created_at DESC;
```

---

## ✅ Quick Verification Steps

1. **Check Database**
   ```bash
   psql -U salahudheenpa -d pickmylab_db -c "SELECT COUNT(*) FROM tests; SELECT COUNT(*) FROM test_categories;"
   ```

2. **Check Backend Logs**
   - Look for any errors when accessing admin pages
   - Check if API calls are successful

3. **Check Frontend Console**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

4. **Hard Refresh**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Press Cmd+Shift+R (Mac)

---

## 🔧 If Data Still Not Showing

### Check Admin Service Calls

Open browser console and run:
```javascript
// Check if you can fetch categories
fetch('http://localhost:3000/api/admin/categories', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Categories:', data));

// Check if you can fetch tests
fetch('http://localhost:3000/api/admin/tests', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Tests:', data));
```

### Check Authentication

```javascript
// Check current user
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('token'));
```

---

## 🎯 Next Steps

1. **Restart Backend** (to clear rate limits)
2. **Hard Refresh Frontend** (Ctrl+Shift+R)
3. **Login Again** (if needed)
4. **Check Admin Panel** - Data should be there!

---

## 📝 Rate Limit Configuration

Current settings (after fix):
- **Development**: 200 auth requests / 15 min, 1000 API requests / 15 min
- **Production**: 5 auth requests / 15 min, 100 API requests / 15 min
- **Localhost**: Skipped in development

---

**Your data is safe in the database!** The issue is likely frontend caching or rate limiting. Follow the steps above to resolve.
