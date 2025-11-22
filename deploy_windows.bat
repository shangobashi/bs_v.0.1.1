@echo off
REM SwarmAgents WebUI MVP - Windows Local Deployment Script
REM This script sets up and runs both backend and frontend servers

echo.
echo ================================================================================
echo         SwarmAgents WebUI MVP - Local Deployment (Windows)
echo ================================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected
echo.

REM Get project root directory
set PROJECT_ROOT=%~dp0

echo.
echo ================================================================================
echo Step 1: Setting up Backend (FastAPI)
echo ================================================================================
echo.

cd /d "%PROJECT_ROOT%backend"

REM Check if venv exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated

echo.
echo Installing Python dependencies...
python -m pip install --upgrade pip --quiet
python -m pip install fastapi uvicorn anthropic openai google-generativeai pydantic cryptography python-multipart --quiet
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo [OK] Python dependencies installed

echo.
echo ================================================================================
echo Step 2: Setting up Frontend (React)
echo ================================================================================
echo.

cd /d "%PROJECT_ROOT%frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install --quiet
    if errorlevel 1 (
        echo ERROR: Failed to install Node.js dependencies
        pause
        exit /b 1
    )
    echo [OK] Node.js dependencies installed
) else (
    echo [OK] Node.js dependencies already installed
)

echo.
echo ================================================================================
echo Step 3: Starting Servers
echo ================================================================================
echo.

echo Starting Backend Server on port 8000...
echo (A new window will open for the backend)
echo.

cd /d "%PROJECT_ROOT%backend"
start "SwarmAgents Backend - FastAPI" cmd /k "venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak

echo.
echo Starting Frontend Server on port 3000...
echo (A new window will open for the frontend)
echo.

cd /d "%PROJECT_ROOT%frontend"
start "SwarmAgents Frontend - React" cmd /k "npm start"

echo.
echo ================================================================================
echo Deployment Complete!
echo ================================================================================
echo.
echo Backend Server:  http://localhost:8000
echo Frontend App:    http://localhost:3000
echo API Docs:        http://localhost:8000/docs
echo.
echo Two terminal windows have been opened:
echo 1. Backend (FastAPI) - Running on port 8000
echo 2. Frontend (React) - Running on port 3000
echo.
echo Your browser should automatically open to http://localhost:3000
echo If not, open it manually in your web browser.
echo.
echo Press any key to close this window...
pause

echo.
echo ================================================================================
echo NEXT STEPS:
echo ================================================================================
echo 1. Configure API keys (optional):
echo    - Go to Settings tab in the web app
echo    - Paste your Claude, OpenAI, or Gemini API key
echo    - Click "Configure API Key"
echo.
echo 2. Start chatting:
echo    - Go to Chat tab
echo    - Select an AI provider
echo    - Type a message and send
echo.
echo 3. Explore agents:
echo    - Go to Swarms tab
echo    - Browse all 50 agents across 4 swarms
echo.
echo For documentation, see:
echo - START_HERE.md
echo - QUICKSTART.md
echo - DEPLOYMENT_GUIDE.md
echo.
echo To stop the servers:
echo - Close the backend and frontend terminal windows
echo.
echo ================================================================================
