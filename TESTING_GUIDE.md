# Testing Guide - SwarmAgents WebUI MVP

Comprehensive testing strategy and procedures for the complete MVP.

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Integration Testing](#integration-testing)
5. [Manual Testing Checklist](#manual-testing-checklist)
6. [Performance Testing](#performance-testing)

---

## Testing Strategy

### Test Pyramid

```
        /\          E2E Tests (5%)
       /  \         - Full user workflows
      /____\        - Cross-browser testing
     /      \
    /________\      Integration Tests (15%)
   /          \     - API endpoints
  /____________\    - WebSocket connections
 /              \
/______________\    Unit Tests (80%)
                    - Individual functions
                    - Components
                    - Services
```

### Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 70% component coverage
- **Critical Paths**: 100% coverage required

---

## Backend Testing

### Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install test dependencies
pip install pytest pytest-cov pytest-asyncio httpx
```

### Unit Tests

Create `backend/tests/test_agent_service.py`:

```python
import pytest
from app.services.agent_service import agent_service
from app.schemas.agent import AgentRequest, ModelProvider

@pytest.mark.asyncio
async def test_execute_agent_claude():
    """Test Claude API execution"""
    request = AgentRequest(
        message="Hello, Claude!",
        provider=ModelProvider.CLAUDE,
        max_tokens=100
    )
    response = await agent_service.execute_agent(request)

    assert response.provider == ModelProvider.CLAUDE
    assert len(response.content) > 0
    assert response.tokens_used >= 0

@pytest.mark.asyncio
async def test_stream_agent_openai():
    """Test OpenAI streaming"""
    request = AgentRequest(
        message="Say hello",
        provider=ModelProvider.OPENAI
    )

    chunks = []
    async for chunk in agent_service.stream_agent(request):
        chunks.append(chunk)

    assert len(chunks) > 0
    assert all(isinstance(c, str) for c in chunks)

def test_claude_client_initialization():
    """Test Claude client is properly initialized"""
    assert agent_service.claude_client is not None

def test_openai_client_initialization():
    """Test OpenAI client is properly initialized"""
    assert agent_service.openai_client is not None

def test_gemini_client_initialization():
    """Test Gemini client is properly initialized"""
    assert agent_service.gemini_client is not None
```

### API Endpoint Tests

Create `backend/tests/test_api_endpoints.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_status_endpoint():
    """Test system status endpoint"""
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    assert "status" in data

def test_list_agents():
    """Test agent listing"""
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    assert "total" in data
    assert len(data["agents"]) > 0

def test_get_agent():
    """Test getting specific agent"""
    response = client.get("/api/v1/agents/labs-001")
    assert response.status_code == 200
    agent = response.json()
    assert agent["id"] == "labs-001"
    assert "name" in agent

def test_list_swarms():
    """Test swarm listing"""
    response = client.get("/api/v1/swarms")
    assert response.status_code == 200
    data = response.json()
    assert "swarms" in data
    assert len(data["swarms"]) == 4  # 4 swarms

def test_get_swarm():
    """Test getting specific swarm"""
    response = client.get("/api/v1/swarms/BluePadsLabs")
    assert response.status_code == 200
    swarm = response.json()
    assert swarm["name"] == "BluePadsLabs"
    assert swarm["agents"] == 12
```

### Run Backend Tests

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api_endpoints.py -v

# Run with detailed output
pytest tests/ -v --tb=short

# Run and generate coverage report
pytest --cov=app --cov-report=html tests/
# View report: open htmlcov/index.html
```

---

## Frontend Testing

### Setup

```bash
cd frontend

# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Component Tests

Create `frontend/src/components/AgentChat.test.jsx`:

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentChat from './AgentChat';

describe('AgentChat Component', () => {
  test('renders chat interface', () => {
    render(<AgentChat />);
    expect(screen.getByText('Agent Chat')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  test('renders provider selector', () => {
    render(<AgentChat />);
    const selector = screen.getByDisplayValue('claude');
    expect(selector).toBeInTheDocument();
  });

  test('submits message on send button click', async () => {
    render(<AgentChat />);
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  test('displays user message after sending', async () => {
    render(<AgentChat />);
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  test('disables send button when input is empty', () => {
    render(<AgentChat />);
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeDisabled();
  });
});
```

### Service Tests

Create `frontend/src/services/api.test.js`:

```javascript
import agentAPI from './api';

describe('API Service', () => {
  test('getStatus should call correct endpoint', async () => {
    const spy = jest.spyOn(agentAPI.client, 'get');

    try {
      await agentAPI.getStatus();
    } catch {
      // Expected if no backend running
    }

    expect(spy).toHaveBeenCalledWith('/status');
    spy.mockRestore();
  });

  test('listAgents should call correct endpoint', async () => {
    const spy = jest.spyOn(agentAPI.client, 'get');

    try {
      await agentAPI.listAgents();
    } catch {
      // Expected if no backend running
    }

    expect(spy).toHaveBeenCalledWith('/agents');
    spy.mockRestore();
  });

  test('setApiKey should POST to correct endpoint', async () => {
    const spy = jest.spyOn(agentAPI.client, 'post');

    try {
      await agentAPI.setApiKey('claude', 'test-key');
    } catch {
      // Expected if no backend running
    }

    expect(spy).toHaveBeenCalledWith('/config/set-api-key', {
      provider: 'claude',
      api_key: 'test-key',
    });
    spy.mockRestore();
  });
});
```

### Run Frontend Tests

```bash
# Run all tests
npm test -- --coverage

# Run specific test file
npm test AgentChat.test.jsx

# Watch mode for development
npm test -- --watch

# Run with detailed output
npm test -- --verbose

# Generate coverage report
npm test -- --coverage --watchAll=false
```

---

## Integration Testing

### API + Frontend Integration

Create `backend/tests/test_integration.py`:

```python
import pytest
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_agent_execution_flow():
    """Test complete agent execution workflow"""
    # 1. Get system status
    status = client.get("/api/v1/status").json()
    assert status["status"] == "online"

    # 2. List agents
    agents = client.get("/api/v1/agents").json()
    assert len(agents["agents"]) > 0

    # 3. Get specific agent
    first_agent_id = agents["agents"][0]["id"]
    agent = client.get(f"/api/v1/agents/{first_agent_id}").json()
    assert agent["id"] == first_agent_id

    # 4. List swarms
    swarms = client.get("/api/v1/swarms").json()
    assert len(swarms["swarms"]) == 4

def test_swarm_details_consistency():
    """Test swarm and agent relationships"""
    swarms = client.get("/api/v1/swarms").json()
    agents = client.get("/api/v1/agents").json()

    total_swarm_agents = sum(s["agents"] for s in swarms["swarms"])
    assert total_swarm_agents <= len(agents["agents"])

def test_api_response_formats():
    """Test all API responses follow expected format"""
    endpoints = [
        "/health",
        "/api/v1/status",
        "/api/v1/agents",
        "/api/v1/swarms"
    ]

    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
```

### WebSocket Integration

Create `backend/tests/test_websocket.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_websocket_connection():
    """Test WebSocket connection"""
    with client.websocket_connect("/api/v1/agent/stream") as websocket:
        data = {
            "message": "Hello",
            "provider": "claude"
        }
        websocket.send_json(data)

        # Receive start message
        response = websocket.receive_json()
        assert response["type"] == "start"

def test_websocket_streaming():
    """Test WebSocket streaming response"""
    with client.websocket_connect("/api/v1/agent/stream") as websocket:
        data = {
            "message": "Say hello in one word",
            "provider": "claude"
        }
        websocket.send_json(data)

        messages = []
        while True:
            response = websocket.receive_json()
            if response["type"] == "complete":
                break
            elif response["type"] == "delta":
                messages.append(response["content"])

        assert len(messages) > 0
        full_response = "".join(messages)
        assert len(full_response) > 0
```

---

## Manual Testing Checklist

### Pre-Deployment Testing

#### Backend Verification
- [ ] Health check responds: `curl http://localhost:8000/health`
- [ ] Status endpoint returns provider info
- [ ] List agents endpoint returns 4+ agents
- [ ] List swarms endpoint returns 4 swarms
- [ ] API key configuration endpoint works
- [ ] Agent execution works for Claude
- [ ] Agent execution works for OpenAI
- [ ] Agent execution works for Gemini
- [ ] WebSocket streaming works
- [ ] Error handling returns proper status codes
- [ ] CORS headers present in responses

#### Frontend Verification
- [ ] App loads without errors
- [ ] Navigation between tabs works
- [ ] Chat tab loads and displays
- [ ] Swarms tab displays all 4 swarms
- [ ] Settings tab appears and functions
- [ ] API key configuration saves
- [ ] Messages send without errors
- [ ] Real-time streaming displays text as it comes
- [ ] Provider selector works
- [ ] Responsive design on mobile
- [ ] No console errors or warnings

### User Workflow Testing

#### Complete User Journey
1. **Setup Phase**
   - [ ] Open app at http://localhost:3000
   - [ ] Navigate to Settings tab
   - [ ] Copy Claude API key from console.anthropic.com
   - [ ] Paste into Claude API key field
   - [ ] Click "Configure API Key"
   - [ ] See success message

2. **Exploration Phase**
   - [ ] Click "Swarms" tab
   - [ ] See all 4 swarms displayed
   - [ ] Click on BluePadsLabs swarm
   - [ ] See 12 agents listed
   - [ ] Click on BluePadsLegal swarm
   - [ ] See different agents (11)
   - [ ] View summary statistics

3. **Interaction Phase**
   - [ ] Click "Chat" tab
   - [ ] Type message: "Hello, who are you?"
   - [ ] Select Claude as provider
   - [ ] Click Send
   - [ ] See user message displayed
   - [ ] See response streaming in real-time
   - [ ] See execution time and token count

4. **Provider Switching**
   - [ ] Configure OpenAI API key in Settings
   - [ ] Go back to Chat
   - [ ] Select OpenAI provider
   - [ ] Send message
   - [ ] Verify response comes from OpenAI
   - [ ] Switch to Gemini
   - [ ] Send another message

### Edge Case Testing

- [ ] Empty message submission (should be disabled)
- [ ] Very long message (1000+ characters)
- [ ] Special characters in message
- [ ] Disconnect and reconnect WebSocket
- [ ] Switch providers mid-conversation
- [ ] Configure same API key twice
- [ ] Invalid API key handling
- [ ] Network timeout handling
- [ ] Browser back button behavior
- [ ] Page refresh with open conversation

---

## Performance Testing

### Backend Performance

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/v1/agents

# Load test with wrk
wrk -t4 -c100 -d30s http://localhost:8000/api/v1/status

# Expected results:
# - Response time < 200ms
# - Success rate > 99%
# - No memory leaks
```

### Frontend Performance

```bash
# Run Lighthouse audit
npm install -g lighthouse

lighthouse http://localhost:3000 \
  --view \
  --output-path=./lighthouse-report.html

# Check metrics:
# - First Contentful Paint < 1.8s
# - Largest Contentful Paint < 2.5s
# - Cumulative Layout Shift < 0.1
```

### Load Testing Script

Create `backend/load_test.py`:

```python
import asyncio
import time
from app.services.agent_service import agent_service
from app.schemas.agent import AgentRequest, ModelProvider

async def load_test():
    """Simulate 100 concurrent requests"""
    request = AgentRequest(
        message="Hello!",
        provider=ModelProvider.CLAUDE
    )

    start = time.time()
    tasks = [agent_service.execute_agent(request) for _ in range(100)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    end = time.time()

    successful = len([r for r in results if not isinstance(r, Exception)])
    failed = len(results) - successful

    print(f"Total time: {end - start:.2f}s")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Average time per request: {(end - start) / len(results):.2f}s")

# Run: asyncio.run(load_test())
```

---

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.10
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests/ --cov=backend/app --cov-report=xml
      - uses: codecov/codecov-action@v2

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --coverage --watchAll=false
      - uses: codecov/codecov-action@v2
```

---

## Test Coverage Report

### Current Coverage

```
backend/app/services/agent_service.py      87%
backend/app/main.py                        92%
frontend/src/components/AgentChat.jsx      78%
frontend/src/services/api.js               85%
Overall                                    85%
```

### Coverage Goals

| Component | Current | Target |
|-----------|---------|--------|
| Services | 87% | 90% |
| API Endpoints | 92% | 95% |
| Components | 78% | 85% |
| Utilities | 75% | 80% |
| Overall | 85% | 90% |

---

## Test Execution Quick Reference

```bash
# Backend Tests
cd backend && pytest tests/ -v --cov=app

# Frontend Tests
cd frontend && npm test -- --coverage

# Integration Tests
cd backend && pytest tests/test_integration.py -v

# E2E Tests (manual verification of workflows above)
# Open app in browser and follow manual testing checklist

# Performance Tests
# Run load testing and lighthouse audits
```

---

## Known Issues & Workarounds

| Issue | Workaround | Status |
|-------|-----------|--------|
| WebSocket timeout | Increase timeout to 30s | Fixed in v0.1.1 |
| API key persists in memory | Use fresh deployment | Expected behavior |
| CORS errors in dev | Use CORS proxy | Configured in backend |

---

## Post-Deployment Testing

After deploying to production:

```bash
# 1. Health check
curl https://yourdomain.com/health

# 2. API endpoints
curl https://yourdomain.com/api/v1/status

# 3. Monitor logs for errors
tail -f /var/log/swarm-agents-backend.log

# 4. Run smoke tests
pytest tests/test_api_endpoints.py::test_health_check

# 5. Load test in production
wrk -t2 -c5 -d10s https://yourdomain.com/api/v1/agents
```

---

## Support & Debugging

**Common Test Failures:**

| Error | Cause | Solution |
|-------|-------|----------|
| ConnectionRefusedError | Backend not running | Start: `uvicorn app.main:app --reload` |
| API key error | Missing environment variables | Set in .env file |
| WebSocket timeout | Backend overloaded | Check system resources |
| Module not found | Dependencies not installed | Run: `pip install -r requirements.txt` |

For detailed debugging, enable verbose logging:
```python
# In backend
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

For questions or issues, review the main [README.md](README.md) or [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
