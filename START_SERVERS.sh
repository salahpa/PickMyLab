#!/bin/bash

# PickMyLab - Start Both Servers
# Starts backend and frontend in separate terminal windows/tabs

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Starting PickMyLab Services"
echo "================================"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} backend/.env not found. Please run test_setup.sh first"
    exit 1
fi

# Start backend
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✓${NC} Backend running on http://localhost:3000 (PID: $BACKEND_PID)"
echo -e "${GREEN}✓${NC} Frontend running on http://localhost:3001 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
