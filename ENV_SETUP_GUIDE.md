# Environment Variables Setup Guide

## 🔐 Where to Get DB_PASSWORD and JWT_SECRET

### 1. DB_PASSWORD (PostgreSQL Password)

**This is the password for your PostgreSQL database user.**

#### Option A: Use Default PostgreSQL User (postgres)

If you installed PostgreSQL with default settings, try:

1. **Check if you set a password during installation**
   - Remember the password you entered when installing PostgreSQL
   - If you don't remember, you may need to reset it

2. **Try empty password** (if you didn't set one):
   ```env
   DB_PASSWORD=
   ```

3. **Reset PostgreSQL password** (if you forgot):
   ```bash
   # macOS (if installed via Homebrew)
   # Edit pg_hba.conf to allow local connections without password temporarily
   # Then reset password in psql
   
   # Connect to PostgreSQL
   psql -U postgres
   
   # If that doesn't work, try:
   psql postgres
   ```

4. **Set a new password**:
   ```sql
   -- In psql
   ALTER USER postgres WITH PASSWORD 'your_new_password';
   ```

#### Option B: Create a New Database User

```sql
-- Connect as postgres user
psql -U postgres

-- Create new user
CREATE USER pickmylab_user WITH PASSWORD 'MySecurePassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pickmylab_db TO pickmylab_user;

-- Exit
\q
```

Then use in `.env`:
```env
DB_USER=pickmylab_user
DB_PASSWORD=MySecurePassword123!
```

---

### 2. JWT_SECRET (JSON Web Token Secret)

**This is a random secret key you generate yourself. It's used to sign JWT tokens.**

#### Generate JWT_SECRET

**Option 1: Using OpenSSL (Recommended)**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Using Online Generator**
- Go to: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Keys" (256-bit)
- Or use any random 32+ character string

**Option 4: Manual (Simple)**
Just use any long random string (at least 32 characters):
```
MySuperSecretJWTKeyForPickMyLab2026!@#$%^&*
```

#### Example Generated Secret:
```
aB3xK9mP2qR7vT5wY8zA1bC4dE6fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9zA0
```

**Important:**
- Must be at least 32 characters long
- Keep it secret (never commit to git)
- Use different secrets for development and production
- Don't share it publicly

---

## 📝 Complete .env Setup Example

### Backend .env File

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pickmylab_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Configuration
JWT_SECRET=your_generated_jwt_secret_here_min_32_characters
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Email Configuration (Optional - can leave default for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@pickmylab.com

# File Upload Directory
UPLOAD_DIR=./uploads/reports
```

---

## 🔍 How to Find Your PostgreSQL Password

### macOS (Homebrew Installation)

1. **Check if PostgreSQL is running:**
   ```bash
   brew services list | grep postgresql
   ```

2. **Try connecting without password:**
   ```bash
   psql postgres
   # If this works, you don't need a password (use empty string in .env)
   ```

3. **If password is required, try common defaults:**
   - Empty password: `DB_PASSWORD=`
   - `postgres`
   - Your macOS user password
   - Password you set during installation

4. **Reset password if needed:**
   ```bash
   # Stop PostgreSQL
   brew services stop postgresql@14
   
   # Start in single-user mode (allows connection without password)
   postgres --single -D /usr/local/var/postgres
   
   # In the postgres prompt:
   ALTER USER postgres WITH PASSWORD 'newpassword';
   \q
   
   # Restart normally
   brew services start postgresql@14
   ```

### Linux (apt/yum Installation)

1. **Try connecting as postgres user:**
   ```bash
   sudo -u postgres psql
   ```

2. **If that works, set a password:**
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_password';
   ```

3. **Or create new user:**
   ```sql
   CREATE USER pickmylab_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE pickmylab_db TO pickmylab_user;
   ```

### Windows

1. **Check PostgreSQL service:**
   - Open Services (services.msc)
   - Find "postgresql" service
   - Check if it's running

2. **Default installation:**
   - Usually uses password you set during installation
   - Or try: `postgres`

3. **Reset via pgAdmin:**
   - Open pgAdmin
   - Right-click on server → Properties
   - Change password

---

## ✅ Quick Setup Commands

### Generate JWT_SECRET
```bash
# Copy this command to generate JWT_SECRET
openssl rand -base64 32
```

### Test Database Connection
```bash
# Test with password
psql -U postgres -d pickmylab_db

# If it asks for password, enter it
# If it connects, your password works!
```

### Create .env File
```bash
cd backend

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"

# Create .env
cat > .env << EOF
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pickmylab_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
EOF

# Then edit .env and replace YOUR_POSTGRES_PASSWORD_HERE with actual password
nano .env
```

---

## 🚨 Common Issues

### Issue: "password authentication failed"

**Solution:**
1. Check if password is correct
2. Try empty password: `DB_PASSWORD=`
3. Reset PostgreSQL password (see above)

### Issue: "role does not exist"

**Solution:**
```sql
-- Create the user
CREATE USER postgres WITH PASSWORD 'password';
-- Or use existing user
```

### Issue: "database does not exist"

**Solution:**
```bash
createdb pickmylab_db
```

---

## 📌 Summary

1. **DB_PASSWORD**: 
   - Your PostgreSQL user password
   - Try empty first: `DB_PASSWORD=`
   - Or reset: `ALTER USER postgres WITH PASSWORD 'newpass';`

2. **JWT_SECRET**: 
   - Generate with: `openssl rand -base64 32`
   - Must be 32+ characters
   - Keep it secret!

---

**Need help?** Check TESTING_GUIDE.md for more details.
