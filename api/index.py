from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import sys
import traceback
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))

app = FastAPI(title="BlueSwarm Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Minimal logic to get the app running ---
load_error = None
try:
    from app.agents_data import ALL_AGENTS, get_agents_summary
    from app.core.config import settings
    from app.services.agent_service import agent_service
except Exception as e:
    ALL_AGENTS = []
    settings = None
    load_error = {
        "detail": str(e),
        "traceback": traceback.format_exc()
    }

@app.get("/api/v1/status")
async def status():
    return {
        "status": "online",
        "vercel": True,
        "backend_loaded": settings is not None,
        "load_error": load_error,
        "sys_path": sys.path,
        "cwd": os.getcwd(),
        "api_dir_files": os.listdir(str(current_dir))
    }

@app.get("/api/v1/agents")
async def list_agents():
    if not ALL_AGENTS:
        return {"agents": [], "count": 0}
    return {"agents": ALL_AGENTS, "count": len(ALL_AGENTS)}

@app.get("/api/v1/swarms")
async def list_swarms():
    try:
         from app.main import build_swarms_from_agents
         return {"swarms": build_swarms_from_agents(), "total": 0}
    except Exception as e:
         return {"swarms": [], "total": 0, "error": str(e)}
