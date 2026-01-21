# PickMyLab - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Database Setup (2 minutes)

```bash
# Create database
createdb pickmylab_db

# Run schema
psql -U postgres -d pickmylab_db -f database_schema.sql

# Run migrations
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_payments_table.sql
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_notification_tables.sql
psql -U postgres -d pickmylab_db -f backend/src/migrations/create_phlebotomist_tables.sql
```

### Step 2: Backend Setup (1 minute)

```bash
cd backend
npm install
cp env.example.txt .env
# Edit .env with your database password
mkdir -p uploads/reports
npm run dev
```

**Minimal .env for testing:**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pickmylab_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key_min_32_characters_long
FRONTEND_URL=http://localhost:3001
```

### Step 3: Frontend Setup (1 minute)

```bash
cd frontend
npm install
npm run dev
```

### Step 4: Verify (1 minute)

1. Backend: http://localhost:3000/api
2. Frontend: http://localhost:3001

---

## ✅ Quick Test

```bash
# Test API
curl http://localhost:3000/api

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","phone":"+971501234567","password":"Test123!","first_name":"Test","last_name":"User"}'
```

---

**For detailed testing, see TESTING_GUIDE.md**
