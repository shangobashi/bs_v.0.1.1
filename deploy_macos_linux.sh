#!/bin/bash
# SwarmAgents WebUI MVP - Mac/Linux Local Deployment Script
# This script sets up and runs both backend and frontend servers

set -e

echo ""
echo "================================================================================"
echo "         SwarmAgents WebUI MVP - Local Deployment (Mac/Linux)"
echo "================================================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.10+ from https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "[OK] Python and Node.js detected"
echo ""

# Get project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "================================================================================"
echo "Step 1: Setting up Backend (FastAPI)"
echo "================================================================================"
echo ""

cd "$PROJECT_ROOT/backend"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "[OK] Virtual environment created"
else
    echo "[OK] Virtual environment already exists"
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate
echo "[OK] Virtual environment activated"

echo ""
echo "Installing Python dependencies..."
python -m pip install --upgrade pip --quiet
python -m pip install fastapi uvicorn anthropic openai google-generativeai pydantic cryptography python-multipart --quiet
echo "[OK] Python dependencies installed"

echo ""
echo "================================================================================"
echo "Step 2: Setting up Frontend (React)"
echo "================================================================================"
echo ""

cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install --quiet
    echo "[OK] Node.js dependencies installed"
else
    echo "[OK] Node.js dependencies already installed"
fi

echo ""
echo "================================================================================"
echo "Step 3: Starting Servers"
echo "================================================================================"
echo ""

echo "Starting Backend Server on port 8000..."
echo ""

cd "$PROJECT_ROOT/backend"
source venv/bin/activate

# Start backend in background
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "[OK] Backend started (PID: $BACKEND_PID)"

echo "Waiting 5 seconds for backend to initialize..."
sleep 5

echo ""
echo "Starting Frontend Server on port 3000..."
echo ""

cd "$PROJECT_ROOT/frontend"

# Start frontend in foreground (it will run until user stops it)
npm start

# When npm start exits, kill the backend
kill $BACKEND_PID 2>/dev/null || true

echo ""
echo "================================================================================"
echo "Servers stopped"
echo "================================================================================"
