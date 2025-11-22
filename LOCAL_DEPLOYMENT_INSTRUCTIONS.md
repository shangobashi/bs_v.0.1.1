# Local Deployment Instructions - SwarmAgents WebUI MVP

Complete instructions to deploy and run the application locally on your machine.

## Prerequisites

Before you start, make sure you have:
- **Python 3.10+** - Download from https://www.python.org/downloads/
- **Node.js 16+** - Download from https://nodejs.org/

### Verify Installation

**Windows:**
```bash
python --version
node --version
npm --version
```

**Mac/Linux:**
```bash
python3 --version
node --version
npm --version
```

## Quick Deploy (Recommended)

### For Windows Users

**Step 1:** Open PowerShell or Command Prompt

**Step 2:** Navigate to the project directory:
```bash
cd C:\Users\Shango\documents\code\SwarmAgents_WebUI_MVP
```

**Step 3:** Run the deployment script:
```bash
.\deploy_windows.bat
```

**What happens:**
- Creates Python virtual environment (first time only)
- Installs Python dependencies
- Installs Node.js dependencies
- Opens two new terminal windows:
  - **Backend Terminal**: FastAPI running on http://localhost:8000
  - **Frontend Terminal**: React running on http://localhost:3000
- Browser automatically opens to http://localhost:3000

### For Mac/Linux Users

**Step 1:** Open Terminal

**Step 2:** Navigate to the project directory:
```bash
cd C:\Users\Shango\documents\code\SwarmAgents_WebUI_MVP
# or wherever you cloned the project
```

**Step 3:** Make the script executable:
```bash
chmod +x deploy_macos_linux.sh
```

**Step 4:** Run the deployment script:
```bash
./deploy_macos_linux.sh
```

**What happens:**
- Creates Python virtual environment (first time only)
- Installs Python dependencies
- Installs Node.js dependencies
- Starts both servers in the same terminal:
  - **Backend**: FastAPI running on http://localhost:8000
  - **Frontend**: React running on http://localhost:3000

## Manual Setup (If Scripts Don't Work)

### Backend Setup

**Step 1:** Navigate to backend directory
```bash
cd C:\Users\Shango\documents\code\SwarmAgents_WebUI_MVP\backend
```

**Step 2:** Create virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

**Step 3:** Install dependencies
```bash
pip install --upgrade pip
pip install fastapi uvicorn anthropic openai google-generativeai pydantic cryptography python-multipart
```

**Step 4:** Start backend server
```bash
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Frontend Setup (New Terminal/Tab)

**Step 1:** Navigate to frontend directory
```bash
cd C:\Users\Shango\documents\code\SwarmAgents_WebUI_MVP\frontend
```

**Step 2:** Install dependencies (first time only)
```bash
npm install
```

**Step 3:** Start frontend server
```bash
npm start
```

**Expected output:**
```
webpack compiled successfully
Compiled successfully!

You can now view swarm-agents-webui-mvp in the browser.
  Local: http://localhost:3000
```

## Verify Everything is Running

### Backend Health Check
```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "app": "SwarmAgents WebUI MVP",
  "version": "0.1.0"
}
```

### Frontend Access
Open your browser to: **http://localhost:3000**

## What You Should See

### Backend (http://localhost:8000)
- API is running and responding
- FastAPI interactive docs available at http://localhost:8000/docs
- Health check passes

### Frontend (http://localhost:3000)
- React application loads
- You see three tabs: Chat, Swarms, Settings
- No error messages in browser console (F12 to check)

## Next Steps After Deployment

### 1. Explore Without API Keys
- Click **Swarms** tab
- Browse all 50 agents
- Click on agents to see profiles
- View swarm details

### 2. Configure API Keys (Optional)
To actually chat with AI providers:

- Click **Settings** tab
- Select a provider (Claude, OpenAI, or Gemini)
- Paste your API key:
  - **Claude**: https://console.anthropic.com
  - **OpenAI**: https://platform.openai.com/api-keys
  - **Gemini**: https://makersuite.google.com/app/apikey
- Click "Configure API Key"

### 3. Start Chatting
- Click **Chat** tab
- Select an AI provider
- Type a message
- Click Send
- Watch real-time streaming response

## Troubleshooting

### "Python is not installed"
- Install Python 3.10+ from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation
- Restart your terminal after installing

### "Node.js is not installed"
- Install Node.js 16+ from https://nodejs.org/
- Restart your terminal after installing

### "ModuleNotFoundError: No module named 'fastapi'"
```bash
# Activate virtual environment (Windows)
cd backend
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
cd backend
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn
```

### "Port 8000 already in use"
- Close other applications using port 8000
- Or start backend on a different port: `uvicorn app.main:app --port 8001`

### "Port 3000 already in use"
- Close other applications using port 3000
- Or start frontend on a different port: `PORT=3001 npm start`

### WebSocket Connection Fails
- Make sure backend is running on port 8000
- Check browser console (F12) for error messages
- App will automatically fall back to regular API calls
- This is expected behavior

### "npm start hangs"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules  # Mac/Linux
rmdir /s node_modules  # Windows

# Reinstall
npm install
npm start
```

## Stopping the Servers

### Windows (Batch Script)
- Close the two terminal windows
- Or press Ctrl+C in each terminal

### Windows (Manual)
- Press Ctrl+C in the backend terminal
- Press Ctrl+C in the frontend terminal

### Mac/Linux (Script)
- Press Ctrl+C in the terminal

### Mac/Linux (Manual)
- Press Ctrl+C in the backend terminal
- Press Ctrl+C in the frontend terminal

## Network Access

### Local Only (Default)
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Only accessible from your machine

### From Other Machines
To access from another machine on your network:

**Windows Backend:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then access from another machine: `http://<your-ip>:8000`

**Frontend:** Configure in `frontend/.env`:
```
REACT_APP_API_BASE_URL=http://<your-ip>:8000/api/v1
```

## File Locations

| Component | Location |
|-----------|----------|
| Backend Code | `backend/app/` |
| Frontend Code | `frontend/src/` |
| Backend Config | `backend/.env` |
| Frontend Config | `frontend/.env` |
| Documentation | Root directory (*.md files) |

## Performance Notes

### First Run
- Frontend npm install: 2-3 minutes
- Backend pip install: 1-2 minutes
- Total setup: 5-10 minutes

### Subsequent Runs
- Frontend start: 10-30 seconds
- Backend start: 5-10 seconds
- Total startup: 30-60 seconds

## Common Ports

If you need to change ports, here are the defaults:
- **Backend FastAPI**: 8000
- **Frontend React**: 3000
- **Database** (Phase 2): 5432

## Getting Help

If you encounter issues:

1. **Check Documentation**:
   - START_HERE.md
   - QUICKSTART.md
   - DEPLOY_LOCAL.md
   - README.md

2. **Check Logs**:
   - Backend terminal for FastAPI errors
   - Frontend terminal for React errors
   - Browser console (F12) for frontend errors

3. **Verify Prerequisites**:
   ```bash
   python --version  # Should be 3.10+
   node --version    # Should be 16+
   npm --version     # Should be 8+
   ```

4. **Try Manual Setup**:
   - If scripts fail, try manual setup above
   - Ensures each step completes successfully

## What's Next?

After deployment is successful:

1. **Explore the UI** (5-10 minutes)
   - Click through tabs
   - View all agents and swarms
   - Understand the interface

2. **Configure API Keys** (2-5 minutes)
   - Get API key from provider
   - Paste in Settings
   - Configure

3. **Test Chat** (5-10 minutes)
   - Send a message
   - Watch real-time streaming
   - Try different providers

4. **Review Documentation** (10-20 minutes)
   - Read README.md for architecture
   - Read DEPLOYMENT_GUIDE.md for production
   - Understand the full project

5. **Next Phase Planning** (When ready)
   - Consider Phase 2 features
   - Plan user authentication
   - Design conversation history storage

---

## Success Indicators

You'll know deployment is successful when:

✅ Backend terminal shows "Application startup complete"
✅ Frontend terminal shows "Compiled successfully!"
✅ Browser opens to http://localhost:3000
✅ Three tabs visible: Chat, Swarms, Settings
✅ Swarms tab shows 4 swarms and 50 agents
✅ No red error messages in browser console
✅ Health check returns success: `curl http://localhost:8000/health`

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy (Windows) | `.\deploy_windows.bat` |
| Deploy (Mac/Linux) | `./deploy_macos_linux.sh` |
| Backend Manual | `cd backend && venv\Scripts\activate && uvicorn app.main:app --reload` |
| Frontend Manual | `cd frontend && npm start` |
| Health Check | `curl http://localhost:8000/health` |
| View API Docs | http://localhost:8000/docs |
| Access Frontend | http://localhost:3000 |

---

**Ready to deploy? Run the appropriate script for your OS and enjoy the application!**

For more information, see START_HERE.md or other documentation files.
