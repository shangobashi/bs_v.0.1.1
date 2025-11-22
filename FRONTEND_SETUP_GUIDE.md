# Frontend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Backend URL (Optional)
Create a `.env` file in the `frontend` directory:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

The default is already set to `http://localhost:8000/api/v1`, so this step is only needed if your backend is running on a different URL.

### 3. Start Development Server
```bash
npm start
```

The application will open automatically at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AgentChat.jsx          # Main chat interface
│   │   ├── ApiKeyManager.jsx      # API key configuration
│   │   ├── MessageDisplay.jsx     # Message rendering
│   │   └── SwarmSelector.jsx      # Agent/swarm browser
│   ├── services/
│   │   ├── api.js                 # REST API client
│   │   └── websocket.js           # WebSocket client
│   ├── styles/
│   │   ├── App.css                # Main styling
│   │   └── components.css         # Component styling
│   ├── App.jsx                    # Main app component
│   └── index.js                   # React entry point
├── public/
│   └── index.html                 # HTML template
└── package.json                   # Dependencies
```

## Features

### 1. **Chat Interface** (Main Tab)
- Real-time conversation with AI agents
- Support for Claude, OpenAI, and Google Gemini
- WebSocket streaming for real-time responses
- Message history with execution metrics

### 2. **Swarm Explorer** (Swarms Tab)
- Browse all 50 agents across 4 specialized swarms
- View swarm details and specializations
- Agent profiles with titles and specializations
- Visual organization by swarm

### 3. **API Configuration** (Settings Tab)
- Configure API keys for each provider
- Secure local storage (never sent to servers)
- Links to obtain API keys from official sources
- Provider status monitoring

## API Integration

### Available Providers
- **Claude (Anthropic)**: claude-3-5-sonnet-20241022
- **OpenAI**: gpt-4-turbo-preview
- **Google Gemini**: gemini-pro

### Key Endpoints
- `GET /health` - Health check
- `GET /api/v1/status` - Provider status
- `POST /api/v1/agent/execute` - Single response
- `WS /api/v1/agent/stream` - Real-time streaming
- `GET /api/v1/agents` - List agents
- `GET /api/v1/swarms` - List swarms
- `POST /api/v1/config/set-api-key` - Configure API key

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Environment Variables

```
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

For WebSocket connections, the app uses the same base URL but with `ws://` instead of `http://`.

## Troubleshooting

### WebSocket Connection Issues
If you see "WebSocket unavailable" messages:
1. Ensure the backend is running on port 8000
2. Check CORS settings in the backend
3. The app will gracefully fall back to regular API calls

### API Calls Not Working
1. Verify backend is running at `http://localhost:8000`
2. Check the browser console for error messages
3. Ensure API keys are configured in Settings

### Styling Not Loading
1. Clear browser cache
2. Restart the development server: `npm start`

## Dependencies

- **react** (18.2.0): UI framework
- **react-dom** (18.2.0): React DOM rendering
- **react-router-dom** (6.20.0): Routing
- **axios** (1.6.0): HTTP client
- **react-scripts** (5.0.1): Build tools

## Available Scripts

- `npm start` - Run development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm eject` - Eject from create-react-app (irreversible)

## Next Steps

1. Install dependencies: `npm install`
2. Ensure backend is running: `python backend/app/main.py`
3. Start frontend: `npm start`
4. Go to Settings tab and configure API keys
5. Start chatting in the Chat tab!

## Support

For issues or questions:
1. Check the main README.md for backend setup
2. Review component code in `src/components/`
3. Check browser console for error messages
4. Ensure backend is running and accessible
