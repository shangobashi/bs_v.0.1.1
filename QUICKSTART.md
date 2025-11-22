# Quick Start Guide - SwarmAgents WebUI MVP

Get the complete application running in 10 minutes.

## Prerequisites

- Python 3.10+ ([Download](https://www.python.org/downloads/))
- Node.js 16+ ([Download](https://nodejs.org/))
- Git (optional)
- API keys (optional - start without them to test UI)

## One-Command Setup (Windows)

Create a file named `start_all.bat`:

```batch
@echo off
title SwarmAgents WebUI MVP

REM Start Backend in a new window
start "SwarmAgents Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000"

REM Wait a bit for backend to start
timeout /t 5

REM Start Frontend in a new window
start "SwarmAgents Frontend" cmd /k "cd frontend && npm install && npm start"

REM Open browser
timeout /t 3
start http://localhost:3000

echo.
echo Both services are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
pause
```

Run: `start_all.bat`

## One-Command Setup (Mac/Linux)

Create a file named `start_all.sh`:

```bash
#!/bin/bash

# Start Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start Frontend
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

# Open browser
sleep 3
open http://localhost:3000

echo "Backend (PID: $BACKEND_PID) running on http://localhost:8000"
echo "Frontend (PID: $FRONTEND_PID) running on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
```

Run: `chmod +x start_all.sh && ./start_all.sh`

## Manual Setup (5 Steps)

### Step 1: Backend Setup (2 minutes)

```bash
cd SwarmAgents_WebUI_MVP
cd backend

# Create environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 2: Frontend Setup (2 minutes)

Open a **new terminal** in the project root:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Expected output:**
```
webpack compiled successfully
Compiled successfully!

You can now view swarm-agents-webui-mvp in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Step 3: Verify Setup (1 minute)

- Frontend: Open http://localhost:3000 (should open automatically)
- Backend: Open http://localhost:8000/health
- API Status: http://localhost:8000/api/v1/status

### Step 4: Configure API Keys (Optional, 2 minutes)

To use actual AI providers:

1. Get API keys:
   - Claude: https://console.anthropic.com
   - OpenAI: https://platform.openai.com/api-keys
   - Google Gemini: https://makersuite.google.com/app/apikey

2. In the app, click **Settings** tab

3. Select provider and paste API key

4. Click **Configure API Key**

### Step 5: Start Using!

1. Click **Chat** tab
2. Type a message (e.g., "Hello!")
3. Click **Send**
4. See real-time AI response
5. Explore **Swarms** tab to browse 50 agents

---

## Testing Without API Keys

You can explore the UI without configuring API keys:

- Browse all 50 agents in the **Swarms** tab
- View agent profiles and specializations
- Try sending messages (will show API key error, which is expected)
- Configure settings interface

---

## File Structure

```
SwarmAgents_WebUI_MVP/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app (port 8000)
│   │   ├── core/config.py    # Configuration
│   │   ├── schemas/          # Request/response schemas
│   │   └── services/         # Business logic
│   ├── requirements.txt       # Python dependencies
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── App.jsx           # Main app
│   │   └── index.js          # Entry point
│   ├── package.json          # Node dependencies
│   └── public/index.html     # HTML template
├── README.md                 # Full documentation
├── DEPLOYMENT_GUIDE.md       # Production deployment
└── TESTING_GUIDE.md          # Testing procedures
```

---

## Troubleshooting

### Frontend won't start

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf frontend/node_modules
cd frontend && npm install
npm start
```

### Backend won't start

```bash
# Check Python version
python --version  # Should be 3.10+

# Reinstall dependencies
pip install --upgrade -r backend/requirements.txt

# Check port 8000 is free
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000
```

### WebSocket connection fails

- Ensure backend is running on port 8000
- Check browser console for errors (F12)
- Try refreshing the page
- App will fall back to regular API calls

### API key not working

```
Error: API key invalid
```

- Verify key is correct from provider website
- Check there are no extra spaces
- Ensure API key is active (not revoked)
- Check API key has correct permissions

---

## Development URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | User interface |
| Backend | http://localhost:8000 | API server |
| Docs | http://localhost:8000/docs | Swagger docs |
| Health | http://localhost:8000/health | Health check |
| Status | http://localhost:8000/api/v1/status | Provider status |

---

## Next Steps

1. **Configure API Keys** (optional but recommended)
   - Add Claude API key
   - Add OpenAI API key
   - Add Google Gemini API key

2. **Test Features**
   - Send messages to different providers
   - Browse all agents in Swarms tab
   - Try streaming vs. regular responses

3. **Review Documentation**
   - [README.md](README.md) - Full architecture overview
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
   - [TESTING_GUIDE.md](TESTING_GUIDE.md) - Test procedures
   - [FRONTEND_SETUP_GUIDE.md](FRONTEND_SETUP_GUIDE.md) - Frontend details

4. **Deploy to Production**
   - Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Choose deployment platform (Heroku, Vercel, Docker, etc.)
   - Set up monitoring and logging

---

## Common Commands

### Backend

```bash
cd backend

# Activate environment
source venv/bin/activate  # or venv\Scripts\activate

# Start server
uvicorn app.main:app --reload --port 8000

# Run tests
pytest tests/

# Check coverage
pytest --cov=app tests/
```

### Frontend

```bash
cd frontend

# Start development
npm start

# Build for production
npm run build

# Run tests
npm test

# Check coverage
npm test -- --coverage --watchAll=false
```

---

## Architecture at a Glance

```
[Browser]
    ↓
[React Frontend] ← REST API & WebSocket → [FastAPI Backend]
    ↓                                            ↓
CSS/JS                                   [Multi-API Router]
                                              ↓
                                    ┌─────────┼─────────┐
                                    ↓         ↓         ↓
                              [Claude]   [OpenAI]  [Gemini]
```

**Key Features:**
- 50 AI agents across 4 specialized swarms
- Real-time WebSocket streaming
- Multi-provider support (Claude, OpenAI, Gemini)
- User-provided API keys (secure, never stored on server)
- Responsive design (desktop and mobile)
- No database required for MVP

---

## Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Health check passes
- [ ] Can see all 4 swarms
- [ ] Can see 50 agents across swarms
- [ ] Can configure API keys (optional)
- [ ] Can send messages to AI (with API key)
- [ ] Real-time streaming works
- [ ] Can switch between providers
- [ ] No console errors

---

## Getting Help

### Common Issues Resolved

| Issue | Solution |
|-------|----------|
| `Port already in use` | Change port or kill existing process |
| `Module not found` | Run `pip install -r requirements.txt` or `npm install` |
| `API key invalid` | Verify key from provider website |
| `WebSocket failed` | Refresh page, check backend is running |
| `CORS errors` | Backend running? Check port 8000 |

### Debug Mode

Enable verbose logging:

**Backend:**
```python
# In app/main.py
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```javascript
// In src/App.jsx
localStorage.debug = '*';
```

---

## Performance Tips

- **Frontend**: First load might be slow due to npm install. Subsequent starts are fast.
- **Backend**: Uses in-memory caching. Restart to clear.
- **Streaming**: Works best with stable internet connection
- **Multiple requests**: Can handle up to 10 concurrent agents

---

## Production Readiness

This MVP is ready for:
- ✅ Development and testing
- ✅ Internal demos
- ✅ Proof of concept
- ⚠️ Limited production (add authentication & monitoring first)

For full production, follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## That's It!

You now have a complete full-stack application with:
- FastAPI backend with 3 AI providers
- React frontend with real-time streaming
- 50 agents across 4 specialized swarms
- Ready-to-use chat interface

**Happy building!** 🚀

For detailed documentation, see [README.md](README.md).
