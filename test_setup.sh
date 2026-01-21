#!/bin/bash

# PickMyLab - Testing Setup Script
# This script helps set up the environment for testing

set -e

echo "🚀 PickMyLab Testing Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | head -n1)
    echo -e "${GREEN}✓${NC} PostgreSQL: $PSQL_VERSION"
else
    echo -e "${RED}✗${NC} PostgreSQL not found. Please install PostgreSQL 14+"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend node_modules exists, skipping..."
fi
cd ..

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend node_modules exists, skipping..."
fi
cd ..

echo ""
echo "🗄️  Database Setup"
echo "=================="
echo ""

# Check if database exists
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w pickmylab_db | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "Creating database..."
    createdb pickmylab_db
    echo -e "${GREEN}✓${NC} Database 'pickmylab_db' created"
else
    echo -e "${YELLOW}⚠${NC} Database 'pickmylab_db' already exists"
fi

# Run schema
echo "Running database schema..."
if psql -U postgres -d pickmylab_db -f database_schema.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Database schema applied"
else
    echo -e "${YELLOW}⚠${NC} Schema may have errors (tables might already exist)"
fi

# Run migrations
echo "Running migrations..."
MIGRATIONS=(
    "backend/src/migrations/create_payments_table.sql"
    "backend/src/migrations/create_notification_tables.sql"
    "backend/src/migrations/create_phlebotomist_tables.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$migration" ]; then
        if psql -U postgres -d pickmylab_db -f "$migration" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $(basename $migration)"
        else
            echo -e "${YELLOW}⚠${NC} $(basename $migration) - may already exist"
        fi
    fi
done

echo ""
echo "⚙️  Configuration Setup"
echo "======================="
echo ""

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp backend/env.example.txt backend/.env
    echo -e "${YELLOW}⚠${NC} Please edit backend/.env with your database credentials"
    echo -e "   Required: DB_PASSWORD, JWT_SECRET"
else
    echo -e "${GREEN}✓${NC} Backend .env exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend .env file..."
    echo "VITE_API_URL=http://localhost:3000/api" > frontend/.env
    echo -e "${GREEN}✓${NC} Frontend .env created"
else
    echo -e "${GREEN}✓${NC} Frontend .env exists"
fi

# Create uploads directory
mkdir -p backend/uploads/reports
echo -e "${GREEN}✓${NC} Uploads directory created"

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database password and JWT_SECRET"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "For detailed testing guide, see TESTING_GUIDE.md"
echo ""
