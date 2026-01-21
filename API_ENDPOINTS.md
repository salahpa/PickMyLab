# PickMyLab API Endpoints Reference

## 🔍 Correct API URLs

The backend is running, but you need to use the correct endpoints:

### ✅ Correct Endpoints:

1. **Health Check:**
   ```
   http://localhost:3000/health
   ```

2. **API Root (List all endpoints):**
   ```
   http://localhost:3000/api
   ```

3. **Authentication:**
   ```
   http://localhost:3000/api/auth/register
   http://localhost:3000/api/auth/login
   http://localhost:3000/api/auth/profile
   ```

### ❌ Wrong URLs (will give NOT_FOUND):

- `http://localhost:3000/` ❌
- `http://localhost:3000/auth` ❌
- `http://localhost:3000/tests` ❌

### ✅ Correct URLs:

- `http://localhost:3000/api` ✅
- `http://localhost:3000/api/auth` ✅
- `http://localhost:3000/api/tests` ✅

---

## 📋 All Available Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api` - API information and endpoint list

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Addresses (`/api/addresses`)
- `GET /api/addresses` - Get user addresses (protected)
- `POST /api/addresses` - Add address (protected)
- `PUT /api/addresses/:id` - Update address (protected)
- `DELETE /api/addresses/:id` - Delete address (protected)

### Tests (`/api/tests`)
- `GET /api/tests` - Get all tests (with filters)
- `GET /api/tests/categories` - Get test categories
- `GET /api/tests/:id` - Get test details
- `GET /api/tests/:id/pricing` - Get test pricing from labs

### Labs (`/api/labs`)
- `GET /api/labs` - Get all lab partners
- `GET /api/labs/:id` - Get lab partner details

### Bookings (`/api/bookings`)
- `GET /api/bookings` - Get user bookings (protected)
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings/:id` - Get booking details (protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)

### Payments (`/api/payments`)
- `POST /api/payments/initiate` - Initiate payment (protected)
- `POST /api/payments/confirm` - Confirm payment (protected)
- `GET /api/payments/history` - Get payment history (protected)

### Reports (`/api/reports`)
- `GET /api/reports` - Get user reports (protected)
- `GET /api/reports/:id` - Get report details (protected)
- `GET /api/reports/:id/download` - Download report (protected)

### Smart Reports (`/api/smart-reports`)
- `GET /api/smart-reports/:reportId` - Get smart report (protected)

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get notifications (protected)
- `PUT /api/notifications/preferences` - Update preferences (protected)

### Admin (`/api/admin`)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats (admin only)
- `GET /api/admin/bookings` - Manage bookings (admin only)

---

## 🧪 Quick Test Commands

### Test Health Check
```bash
curl http://localhost:3000/health
```

### Test API Root
```bash
curl http://localhost:3000/api
```

### Test Registration
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

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## 🌐 Frontend API Configuration

Make sure your frontend `.env` has:
```env
VITE_API_URL=http://localhost:3000/api
```

And in your frontend code, use:
```javascript
const API_URL = import.meta.env.VITE_API_URL; // http://localhost:3000/api
```

---

## ⚠️ Common Mistakes

1. **Missing `/api` prefix:**
   - Wrong: `http://localhost:3000/auth/login`
   - Correct: `http://localhost:3000/api/auth/login`

2. **Missing trailing slash:**
   - Both work: `/api/auth/login` and `/api/auth/login/`

3. **Wrong HTTP method:**
   - Login requires `POST`, not `GET`

---

**Remember: All API routes start with `/api`!** 🚀
