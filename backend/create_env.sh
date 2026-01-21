#!/bin/bash

# Script to help create .env file with generated JWT_SECRET

echo "🔧 PickMyLab Backend .env Setup"
echo "================================"
echo ""

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

echo "Generated JWT_SECRET: $JWT_SECRET"
echo ""

# Ask for database password
read -sp "Enter PostgreSQL password (press Enter if no password): " DB_PASSWORD
echo ""

# Create .env file
cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pickmylab_db
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@pickmylab.com

# File Upload Directory
UPLOAD_DIR=./uploads/reports
EOF

echo "✅ .env file created!"
echo ""
echo "📝 Next steps:"
echo "1. Review .env file: cat .env"
echo "2. Add email credentials if needed (optional)"
echo "3. Start server: npm run dev"
echo ""
