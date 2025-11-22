# SwarmAgents WebUI MVP

A FastAPI + React web application for deploying and managing 50+ humanized AI agents from BluePadsGlobal swarms. Supports multi-API backends (Claude, OpenAI, Gemini) with real-time WebSocket streaming.

## Architecture Overview

### Backend Stack
- **Framework**: FastAPI (Python)
- **APIs**: Claude/Anthropic, OpenAI, Google Gemini
- **Real-time**: WebSocket streaming
- **Security**: API key management, JWT authentication (ready)

### Frontend Stack
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP**: Axios
- **State Management**: React Context (ready for Redux/Zustand upgrade)

### BluePadsGlobal Integration
- **BluePadsLabs** (12 agents): Backend, FastAPI architecture
- **BluePadsLegal** (11 agents): Security, compliance, API key handling
- **BluePadsVision** (12 agents): UI/UX, component design, responsive design
- **BluePadsResearch** (15 agents): Agent routing, performance optimization

**Total: 50 agents | 4 specialized swarms**

## Project Structure

```
SwarmAgents_WebUI_MVP/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoint routers
│   │   ├── core/             # Configuration, security
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (agent service, multi-API)
│   │   ├── utils/            # Helper functions
│   │   └── main.py           # FastAPI app entry point
│   ├── tests/                # Pytest test suite
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── styles/           # CSS/styling
│   │   ├── App.jsx           # Main app component
│   │   └── index.js          # React DOM render
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   └── .env                  # Frontend config
│
├── docs/                     # Documentation
│── configs/                  # Config files
├── .gitignore
└── README.md                 # This file
```

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp ../.env.example ../.env
   # Edit .env with your API keys
   ```

5. **Run FastAPI server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

Server runs at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   echo 'REACT_APP_API_BASE_URL=http://localhost:8000/api/v1' > .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

App runs at: `http://localhost:3000`

## API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /api/v1/status` - System status and provider availability

### Agent Execution
- `POST /api/v1/agent/execute` - Execute agent with single response
- `WS /api/v1/agent/stream` - WebSocket for real-time streaming

### Agent Management
- `GET /api/v1/agents` - List all agents from swarms
- `GET /api/v1/agents/{agent_id}` - Get specific agent profile

### Swarm Management
- `GET /api/v1/swarms` - List all BluePadsGlobal swarms
- `GET /api/v1/swarms/{swarm_name}` - Get swarm details

### Configuration
- `POST /api/v1/config/set-api-key` - Set API key for provider

## Features

### Current (MVP)
- [x] Multi-API backend support (Claude, OpenAI, Gemini)
- [x] Agent execution with streaming
- [x] WebSocket real-time responses
- [x] Agent and swarm browsing
- [x] API key management
- [x] Basic React UI scaffold

### Phase 2 (Next 4 weeks)
- [ ] Advanced agent routing
- [ ] Agent conversation history
- [ ] Agent collaboration/swarm coordination
- [ ] Performance dashboard
- [ ] User authentication
- [ ] Persistent storage
- [ ] Advanced search/filtering

### Phase 3 (Long-term)
- [ ] Agent learning and fine-tuning
- [ ] Custom agent creation
- [ ] Agent marketplace
- [ ] Analytics and insights
- [ ] Mobile app

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend (Vercel, Heroku, AWS Lambda)
```bash
# Build and deploy
# Environment variables: Set on platform
```

### Frontend (Vercel, Netlify, AWS S3)
```bash
cd frontend
npm run build
# Deploy 'build' folder
```

## Security Considerations

Per **BluePadsLegal** recommendations:
- [ ] Store API keys in secure vaults (AWS Secrets Manager, etc.)
- [ ] Implement rate limiting
- [ ] Add request signing/verification
- [ ] Enable HTTPS only
- [ ] Implement audit logging
- [ ] Regular security audits

## BluePadsGlobal Integration

This MVP leverages the expertise of 50 agents:

**BluePadsLabs** provides:
- FastAPI best practices
- System architecture guidance
- Performance optimization

**BluePadsLegal** provides:
- Security compliance checklist
- API key management policies
- Data privacy guidelines

**BluePadsVision** provides:
- Component design specifications
- Design system guidelines
- Responsive layout patterns

**BluePadsResearch** provides:
- Agent routing algorithms
- Multi-API optimization strategies
- Performance benchmarking

## Contributing

This is a MVP open to contributions. Areas for help:
- Frontend component development
- Backend optimization
- Testing and QA
- Documentation
- Agent integration

## License

MIT

## Support

For issues or questions:
1. Check documentation in `/docs`
2. Review agent expertise via `/api/v1/agents`
3. Check swarm capabilities via `/api/v1/swarms`

---

**Status**: MVP Alpha (4-week delivery target)
**Version**: 0.1.0
**Last Updated**: 2025-11-01

**"I am because we are"** - Ubuntu Philosophy
All work powered by BluePadsGlobal's 50 humanized agents.
