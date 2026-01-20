#!/bin/bash

# Tasheel Healthcare Platform - Setup Script
# This script helps set up the development environment

echo "🚀 Setting up Tasheel Healthcare Platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo -e "${BLUE}Checking PostgreSQL installation...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install it first.${NC}"
    exit 1
fi

# Create database
echo -e "${BLUE}Creating database...${NC}"
createdb tasheel_db 2>/dev/null || echo "Database already exists or error occurred"

# Run database schema
echo -e "${BLUE}Running database schema...${NC}"
psql -U postgres -d tasheel_db -f database_schema.sql

# Setup backend
echo -e "${BLUE}Setting up backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp env.example.txt .env 2>/dev/null || echo "Please create .env file manually"
    echo -e "${YELLOW}Please update backend/.env with your database credentials${NC}"
fi

# Create logs directory
mkdir -p logs

cd ..

# Setup frontend
echo -e "${BLUE}Setting up frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "VITE_API_URL=http://localhost:3000/api" > .env
fi

cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on http://localhost:3000"
echo "Frontend will run on http://localhost:3001"
