# Deployment Guide - SwarmAgents WebUI MVP

Complete deployment guide for production and staging environments.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Security Checklist](#security-checklist)
5. [Monitoring & Logging](#monitoring--logging)

---

## Local Development Setup

### Quick Start (5 minutes)

**Prerequisites:**
- Python 3.10+
- Node.js 16+
- Git

**Step 1: Clone & Setup Backend**
```bash
cd SwarmAgents_WebUI_MVP
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp ../.env.example .env

# Configure API keys in .env
# ANTHROPIC_API_KEY=your-key-here
# OPENAI_API_KEY=your-key-here
# GOOGLE_API_KEY=your-key-here
```

**Step 2: Start Backend Server**
```bash
# From backend directory with venv activated
uvicorn app.main:app --reload --port 8000
```

Server runs at: `http://localhost:8000`

**Step 3: Setup Frontend**
```bash
# Open new terminal in project root
cd frontend

# Install dependencies
npm install

# Create .env file (optional, uses default localhost:8000)
echo REACT_APP_API_BASE_URL=http://localhost:8000/api/v1 > .env

# Start development server
npm start
```

App opens at: `http://localhost:3000`

**Step 4: Verify Setup**
- Backend health check: http://localhost:8000/health
- API status: http://localhost:8000/api/v1/status
- Frontend: http://localhost:3000

---

## Production Deployment

### Option 1: Traditional Server (AWS EC2, Digital Ocean, etc.)

**Backend Deployment (Ubuntu/Debian):**

```bash
# 1. SSH into server
ssh ubuntu@your-server-ip

# 2. Clone repository
git clone https://github.com/your-org/SwarmAgents_WebUI_MVP.git
cd SwarmAgents_WebUI_MVP/backend

# 3. Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configure environment
cp ../.env.example .env
nano .env  # Edit with production API keys

# 5. Create systemd service
sudo tee /etc/systemd/system/swarm-agents-backend.service > /dev/null <<EOF
[Unit]
Description=SwarmAgents Backend Service
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/SwarmAgents_WebUI_MVP/backend
Environment="PATH=/home/ubuntu/SwarmAgents_WebUI_MVP/backend/venv/bin"
ExecStart=/home/ubuntu/SwarmAgents_WebUI_MVP/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 6. Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable swarm-agents-backend
sudo systemctl start swarm-agents-backend
```

**Frontend Deployment (Vercel, Netlify, or Nginx):**

```bash
# Build production version
npm run build

# Output is in build/ directory
# Deploy to Netlify/Vercel or copy to web server

# For Nginx:
sudo cp -r build/* /var/www/html/
```

### Option 2: Docker Deployment

**Create Dockerfile for Backend:**
```dockerfile
# Dockerfile (backend root)
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create Dockerfile for Frontend:**
```dockerfile
# frontend/Dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_BASE_URL=http://backend:8000/api/v1
    depends_on:
      - backend
    restart: always
```

**Deploy with Docker:**
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Heroku Deployment

**Backend:**
```bash
# Create Heroku app
heroku create your-app-name-backend

# Set environment variables
heroku config:set ANTHROPIC_API_KEY=your-key
heroku config:set OPENAI_API_KEY=your-key
heroku config:set GOOGLE_API_KEY=your-key

# Create Procfile in backend root
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
git push heroku main
```

**Frontend (Netlify):**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

---

## Environment Configuration

### Backend (.env)

```env
# App Configuration
DEBUG=False
APP_NAME=SwarmAgents WebUI MVP
APP_VERSION=0.1.0

# API Keys (get from respective platforms)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIzaSy...

# Security
SECRET_KEY=your-random-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Agent Configuration
MAX_CONCURRENT_AGENTS=10
AGENT_TIMEOUT_SECONDS=300

# Database (for future use)
DATABASE_URL=postgresql://user:password@localhost/dbname

# CORS (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api/v1

# Analytics (optional)
REACT_APP_ANALYTICS_ID=your-analytics-id

# Feature Flags
REACT_APP_ENABLE_STREAMING=true
REACT_APP_ENABLE_ANALYTICS=false
```

---

## Security Checklist

### Before Production

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False` in production
- [ ] Use environment variables for all secrets (never commit to git)
- [ ] Enable HTTPS/TLS on production servers
- [ ] Configure proper CORS origins (not `["*"]`)
- [ ] Set up API rate limiting
- [ ] Implement request signing for sensitive endpoints
- [ ] Enable HTTPS-only cookies
- [ ] Add security headers (HSTS, CSP, X-Frame-Options)
- [ ] Set up audit logging for API calls
- [ ] Use managed secrets (AWS Secrets Manager, Azure Key Vault)
- [ ] Enable WAF (Web Application Firewall) rules
- [ ] Set up DDoS protection

### API Key Security

```python
# Good: Use environment variables
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Bad: Never hardcode keys
ANTHROPIC_API_KEY = "sk-ant-..."

# Better: Use AWS Secrets Manager
import boto3
secrets_client = boto3.client('secretsmanager')
secret = secrets_client.get_secret_value(SecretId='anthropic-api-key')
api_key = secret['SecretString']
```

---

## Monitoring & Logging

### Application Monitoring

**Backend Logging:**
```python
# app/main.py
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger(__name__)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    logger.info({
        "method": request.method,
        "path": request.url.path,
        "status": response.status_code,
    })
    return response
```

**Recommended Monitoring Stack:**
- **Logs**: CloudWatch, ELK Stack, or Datadog
- **Metrics**: Prometheus + Grafana
- **Tracing**: Jaeger or Zipkin
- **Alerts**: PagerDuty or Opsgenie

### Frontend Monitoring

**Error Tracking:**
```javascript
// Add Sentry for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Performance Monitoring:**
```javascript
// Monitor Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Health Checks

```bash
# Backend health check endpoint
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "app": "SwarmAgents WebUI MVP",
#   "version": "0.1.0"
# }
```

---

## Scaling Considerations

### Horizontal Scaling

1. **Backend**: Deploy multiple instances behind a load balancer
2. **Frontend**: CDN distribution with edge caching (CloudFlare, CloudFront)
3. **Database**: Implement read replicas for scaling queries

### Caching Strategy

```python
# Add Redis caching for agent responses
from redis import Redis
redis = Redis(host='localhost', port=6379)

@app.get("/api/v1/agents")
async def list_agents():
    cached = redis.get("agents_list")
    if cached:
        return json.loads(cached)

    agents = get_agents_from_db()
    redis.setex("agents_list", 3600, json.dumps(agents))
    return agents
```

---

## Backup & Disaster Recovery

### Data Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/swarm-agents"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup environment and configs
cp .env $BACKUP_DIR/env_$DATE

# Upload to S3
aws s3 cp $BACKUP_DIR/env_$DATE s3://your-backup-bucket/

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

### Recovery Procedure

```bash
# 1. Restore from backup
aws s3 cp s3://your-backup-bucket/env_DATE .env

# 2. Restart services
docker-compose restart

# 3. Verify functionality
curl http://localhost:8000/health
```

---

## Performance Optimization

### Frontend Optimization

```bash
# Build optimization
npm run build

# Analyze bundle size
npm install -D webpack-bundle-analyzer

# Check performance
lighthouse http://localhost:3000
```

### Backend Optimization

```python
# Add response caching headers
@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    if request.method == "GET":
        response.headers["Cache-Control"] = "public, max-age=300"
    return response
```

---

## Post-Deployment Verification

- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] WebSocket connections working
- [ ] All AI providers responding
- [ ] Database connections stable
- [ ] Logs being collected
- [ ] Monitoring alerts configured
- [ ] Backups running
- [ ] Security headers present
- [ ] HTTPS/TLS working
- [ ] Rate limiting active
- [ ] Load balancer healthy

---

## Support & Troubleshooting

**Common Issues:**

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check backend service status: `systemctl status swarm-agents-backend` |
| WebSocket timeout | Verify backend port 8000 is open: `telnet localhost 8000` |
| API key errors | Verify environment variables: `echo $ANTHROPIC_API_KEY` |
| CORS errors | Check ALLOWED_ORIGINS in .env |
| Out of memory | Increase server resources or enable caching |

For production issues, check logs:
```bash
# Backend logs
sudo journalctl -u swarm-agents-backend -f

# Docker logs
docker-compose logs -f backend
```

---

## Next Steps

1. Choose deployment platform
2. Set up environment variables
3. Configure monitoring and logging
4. Deploy to staging first
5. Run full test suite
6. Deploy to production
7. Monitor for issues
8. Plan for scaling

For detailed setup instructions, see [FRONTEND_SETUP_GUIDE.md](FRONTEND_SETUP_GUIDE.md) and [README.md](README.md).
