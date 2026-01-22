# Rate Limit Fix - Quick Guide

## 🚨 Problem

You're seeing "Too many requests from this IP, please try again later" when trying to login.

## ✅ Solutions

### Option 1: Wait 15 Minutes
The rate limit resets after 15 minutes. Just wait and try again.

### Option 2: Restart Backend Server
The rate limit is stored in memory, so restarting the server clears it:

```bash
# Stop the backend (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### Option 3: Clear Rate Limit (Development Only)

For development, I've increased the rate limit from 5 to 50 requests per 15 minutes. Restart your backend server to apply the change.

### Option 4: Disable Rate Limiting (Development Only)

If you want to disable rate limiting completely for development, edit `backend/src/middleware/rateLimiter.js`:

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Very high limit
  // ... rest of config
});
```

Or comment out the rate limiter in `backend/src/routes/authRoutes.js`:

```javascript
// router.post('/login', authLimiter, authController.login);
router.post('/login', authController.login);
```

**⚠️ Remember to re-enable it for production!**

---

## 🔍 Check Rate Limit Status

The rate limit is stored in memory by the `express-rate-limit` package. There's no database table for it.

---

## 💡 Prevention

- Don't spam the login button
- Wait for responses before clicking again
- Use proper error handling in your frontend
- In development, the limit is now 50 requests per 15 minutes

---

**After restarting the backend, you should be able to login again!**
