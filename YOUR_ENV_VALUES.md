# Your Environment Values

## 🔐 Quick Answer

### 1. DB_PASSWORD

**For macOS with Homebrew PostgreSQL:**

Your PostgreSQL user is likely your **macOS username** (not "postgres").

Try this:
```bash
# Test connection (uses your macOS username)
psql postgres

# If that works, you don't need a password!
# Use in .env:
DB_USER=your_mac_username
DB_PASSWORD=
```

**If you need to set a password:**
```sql
-- Connect first
psql postgres

-- Set password for your user
ALTER USER your_mac_username WITH PASSWORD 'your_password';
```

### 2. JWT_SECRET

**I generated one for you:**
```
CxmNTUNtp2QYN3ZZbuMK1l6nlW8lRGT8lo0jOqxyB0Q=
```

**Or generate a new one:**
```bash
openssl rand -base64 32
```

---

## 📝 Your .env File Should Look Like:

```env
# Database - Use your macOS username, password might be empty
DB_USER=salahudheenpa
DB_PASSWORD=

# Or if you set a password:
DB_USER=salahudheenpa
DB_PASSWORD=your_password_here

# JWT Secret - Use the generated one above
JWT_SECRET=CxmNTUNtp2QYN3ZZbuMK1l6nlW8lRGT8lo0jOqxyB0Q=
```

---

## 🚀 Easy Setup

Run this helper script:
```bash
cd backend
./create_env.sh
```

It will:
1. Generate JWT_SECRET automatically
2. Ask for your database password
3. Create .env file with all values

---

**See ENV_SETUP_GUIDE.md for detailed instructions.**
