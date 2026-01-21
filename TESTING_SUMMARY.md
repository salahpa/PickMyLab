# PickMyLab - Testing Phase Summary

## 📚 Documentation Created

1. **TESTING_GUIDE.md** - Complete step-by-step testing guide
2. **QUICK_START.md** - 5-minute quick start guide
3. **TESTING_CHECKLIST.md** - Comprehensive testing checklist
4. **test_setup.sh** - Automated setup script
5. **START_SERVERS.sh** - Script to start both servers

## 🚀 Quick Start (5 Minutes)

### Option 1: Automated Setup

```bash
# Run automated setup
./test_setup.sh

# Edit backend/.env with your database password
nano backend/.env

# Start servers
./START_SERVERS.sh
```

### Option 2: Manual Setup

```bash
# 1. Database
createdb pickmylab_db
psql -U postgres -d pickmylab_db -f database_schema.sql
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_payments_table.sql
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_notification_tables.sql
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_phlebotomist_tables.sql

# 2. Backend
cd backend
npm install
cp env.example.txt .env
# Edit .env with DB_PASSWORD and JWT_SECRET
mkdir -p uploads/reports
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env
npm run dev
```

## ✅ Testing Steps

### 1. Verify Setup
- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:3001
- [ ] Database connected
- [ ] API health check works

### 2. Test Core Features
- [ ] User registration
- [ ] User login
- [ ] Browse tests
- [ ] Create booking
- [ ] Make payment
- [ ] View reports

### 3. Test Admin Features
- [ ] Admin dashboard
- [ ] Booking management
- [ ] User management
- [ ] Phlebotomist assignment

### 4. Test Edge Cases
- [ ] Invalid inputs
- [ ] Error handling
- [ ] Security (unauthorized access)
- [ ] Performance

## 📋 Required Environment Variables

### Backend (.env)
```env
DB_NAME=pickmylab_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_min_32_chars
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🔍 Verification Commands

```bash
# Test API
curl http://localhost:3000/api

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","phone":"+971501234567","password":"Test123!","first_name":"Test","last_name":"User"}'

# Check database
psql -U postgres -d pickmylab_db -c "\dt"
```

## 📖 Full Documentation

- **TESTING_GUIDE.md** - Complete testing guide with all details
- **TESTING_CHECKLIST.md** - Feature-by-feature testing checklist
- **QUICK_START.md** - Quick reference

---

**Ready to start testing!** 🧪
