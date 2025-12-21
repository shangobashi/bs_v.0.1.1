from fastapi import FastAPI, WebSocket, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import logging
from typing import List, Dict, Any
from pathlib import Path

from app.core.config import settings
from app.schemas.agent import AgentRequest, ModelProvider, ApiKeyRequest
from app.services.agent_service import agent_service
from app.services.session_service import session_service
from app.services.config_generator import config_generator
from app.agents_data import ALL_AGENTS, get_agent_by_id, get_agents_by_swarm, get_agents_summary, is_griot, build_system_prompt

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    logger.info("Shutting down application")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

@app.get(f"{settings.API_PREFIX}/status")
async def status():
    """Get system status and available providers"""
    return {
        "status": "online",
        "providers": {
            "claude": agent_service.claude_client is not None,
            "openai": agent_service.openai_client is not None,
            "gemini": agent_service.gemini_client is not None
        },
        "max_concurrent_agents": settings.MAX_CONCURRENT_AGENTS
    }

# ============================================================================
# AGENT ENDPOINTS
# ============================================================================

@app.post(f"{settings.API_PREFIX}/agent/execute")
async def execute_agent(request: AgentRequest):
    """Execute agent with specified provider"""
    try:
        response = await agent_service.execute_agent(request)
        return response
    except Exception as e:
        logger.error(f"Agent execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket(f"{settings.API_PREFIX}/agent/stream")
async def stream_agent(websocket: WebSocket):
    """WebSocket endpoint for streaming agent responses"""
    await websocket.accept()
    try:
        while True:
            # Receive request from client
            data = await websocket.receive_text()
            request_data = json.loads(data)
            request = AgentRequest(**request_data)

            # Send start message
            await websocket.send_json({
                "type": "start",
                "agent_id": f"{request.provider.value}-stream"
            })

            # Stream response
            try:
                async for event in agent_service.stream_agent(request):
                    # event is now a dict: {"type": "thought"|"content"|"error", "content": "..."}
                    
                    if event["type"] == "error":
                        await websocket.send_json({
                            "type": "error",
                            "error": event["content"]
                        })
                    elif event["type"] == "thought":
                        await websocket.send_json({
                            "type": "thought",
                            "content": event["content"]
                        })
                    else:
                        # Regular content
                        await websocket.send_json({
                            "type": "delta",
                            "content": event["content"]
                        })

                # Send completion
                await websocket.send_json({"type": "complete"})
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "error": str(e)
                })
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await websocket.close()

# ============================================================================
# API KEY MANAGEMENT (Secure)
# ============================================================================

@app.post(f"{settings.API_PREFIX}/config/set-api-key")
async def set_api_key(request: ApiKeyRequest):
    """Set API key for a provider (SECURE - use environment variables in production)"""
    provider = request.provider.lower()
    api_key = request.api_key

    # Update in-memory settings
    if provider == "claude":
        settings.ANTHROPIC_API_KEY = api_key
        env_var = "ANTHROPIC_API_KEY"
    elif provider == "openai":
        settings.OPENAI_API_KEY = api_key
        env_var = "OPENAI_API_KEY"
    elif provider == "gemini":
        settings.GOOGLE_API_KEY = api_key
        env_var = "GOOGLE_API_KEY"
    elif provider == "openrouter":
        settings.OPENROUTER_API_KEY = api_key
        env_var = "OPENROUTER_API_KEY"
    elif provider == "ollama":
        # Ollama doesn't strictly need a key, but we can store the base URL if provided, or just ignore
        settings.OLLAMA_BASE_URL = api_key if api_key.startswith("http") else "http://localhost:11434/v1"
        env_var = "OLLAMA_BASE_URL"
    else:
        raise HTTPException(status_code=400, detail="Unknown provider")

    # Re-initialize clients
    agent_service._init_clients()

    # Persist to .env file
    try:
        env_path = Path(".env")
        env_lines = []
        if env_path.exists():
            env_lines = env_path.read_text().splitlines()
        
        # Remove existing key if present
        env_lines = [line for line in env_lines if not line.startswith(f"{env_var}=")]
        
        # Append new key
        env_lines.append(f"{env_var}={api_key}")
        
        # Write back
        env_path.write_text("\n".join(env_lines))
        logger.info(f"Persisted {env_var} to .env file")
    except Exception as e:
        logger.error(f"Failed to persist API key to .env: {e}")
        # Don't fail the request, just log error

    return {"status": "success", "provider": provider}

# ============================================================================
# AGENT PROFILES (From BluePadsGlobal)
# ============================================================================

# Use comprehensive agent profiles with full identity, history, background, and lore
# Imported from agents_data.py which contains 65 detailed agents across 5 swarms
# Note: Use ALL_AGENTS directly in endpoints rather than module-level assignment
# to avoid stale copies during uvicorn reload cycles

logger.info(f"✓ Loaded {len(ALL_AGENTS)} comprehensive agent profiles from BluePadsGlobal")

@app.get(f"{settings.API_PREFIX}/agents")
async def list_agents():
    """List available agents from BluePadsGlobal swarms"""
    try:
        # Use global ALL_AGENTS which has all agents including BluePadsVision
        all_agents = ALL_AGENTS

        # Build agents list
        agents_list = []
        swarms = {}
        vision_count = 0

        for agent in all_agents:
            swarm = agent.get('swarm', 'UNKNOWN')
            swarms[swarm] = swarms.get(swarm, 0) + 1

            try:
                agent_dict = {
                    "id": agent["id"],
                    "name": agent["name"],
                    "title": agent["title"],
                    "swarm": agent["swarm"],
                    "swarm_display_name": SWARM_METADATA.get(agent["swarm"], {}).get("display_name", agent["swarm"]),
                }
                
                agent_dict.update({
                    "specialization": agent.get("specialization", "Unknown"),
                    "experience_years": agent.get("experience_years", 0),
                    "expertise_areas": agent.get("expertise_areas", []),
                    "biography": agent.get("biography", ""),
                    "background_history": agent.get("background_history", ""),
                    "achievements": agent.get("achievements", ""),
                    "is_griot": is_griot(agent["id"])
                })
                agents_list.append(agent_dict)
            except Exception as e:
                print(f"ERROR building agent dict: {agent.get('id', 'UNKNOWN')} - {e}")
                continue

        # Build summary
        summary = {}
        for swarm in swarms:
            agents_in_swarm = get_agents_by_swarm(swarm)
            summary[swarm] = {
                "count": len(agents_in_swarm),
                "agents": [{"id": a["id"], "name": a["name"], "title": a["title"]} for a in agents_in_swarm]
            }

        return {
            "agents": agents_list,
            "total": len(agents_list),
            "summary": summary
        }
    except Exception as e:
        print(f"CRITICAL ERROR in list_agents: {e}")
        import traceback
        traceback.print_exc()
        return {
            "agents": [],
            "total": 0,
            "summary": {},
            "error": str(e)
        }

@app.get(f"{settings.API_PREFIX}/agents/{{agent_id}}")
async def get_agent(agent_id: str):
    """Get specific agent profile with system prompt"""
    agent = get_agent_by_id(agent_id)
    if agent:
        return agent
    raise HTTPException(status_code=404, detail="Agent not found")

@app.get(f"{settings.API_PREFIX}/debug/all-agents-check")
async def debug_check():
    """Debug endpoint to check what's in ALL_AGENTS"""
    swarms = {}
    for agent in ALL_AGENTS:
        swarm = agent.get('swarm', 'UNKNOWN')
        swarms[swarm] = swarms.get(swarm, 0) + 1

    return {
        "total_agents": len(ALL_AGENTS),
        "swarms": swarms
    }

@app.get(f"{settings.API_PREFIX}/agents/{{agent_id}}/system-prompt")
async def get_agent_system_prompt(agent_id: str):
    """Get agent's system prompt"""
    agent = get_agent_by_id(agent_id)
    if agent:
        return {
            "agent_id": agent_id,
            "name": agent["name"],
            "system_prompt": agent["system_prompt"]
        }
    raise HTTPException(status_code=404, detail="Agent not found")

@app.get(f"{settings.API_PREFIX}/swarms/{{swarm_name}}/agents")
async def get_swarm_agents(swarm_name: str):
    """Get all agents in a specific swarm"""
    agents = get_agents_by_swarm(swarm_name)
    if not agents:
        raise HTTPException(status_code=404, detail=f"Swarm '{swarm_name}' not found")

    return {
        "swarm": swarm_name,
        "agents": [
            {
                "id": agent["id"],
                "name": agent["name"],
                "title": agent["title"],
                "specialization": agent["specialization"],
                "experience_years": agent["experience_years"],
                "expertise_areas": agent.get("expertise_areas", []),
                "is_griot": is_griot(agent["id"])
            }
            for agent in agents
        ],
        "total": len(agents)
    }

# ============================================================================
# SWARM INFORMATION (Dynamic from agents)
# ============================================================================

# Swarm metadata mapping
SWARM_METADATA = {
    "BluePadsLabs_AgentSwarm_ClaudeCLI": {
        "display_name": "BP Labs",
        "lead": "Zainab Hassan",
        "specialty": "Software Engineering & Architecture",
        "focus_areas": ["FastAPI", "React", "System Design", "Performance"]
    },
    "BluePadsLegal_AgentSwarm_ClaudeCLI": {
        "display_name": "BP Legal Division",
        "lead": "Amara Okonkwo",
        "specialty": "Legal & Compliance",
        "focus_areas": ["API Security", "Data Privacy", "Compliance", "Risk Management"]
    },
    "BluePadsGrowth_AgentSwarm_ClaudeCLI": {
        "display_name": "BP Growth Division",
        "lead": "Khadija Okonkwo",
        "specialty": "Business Strategy & Growth",
        "focus_areas": ["Market Analysis", "Growth Strategy", "Financial Planning", "Investment"]
    },
    "BluePadsResearch_AgentSwarm_ClaudeCLI": {
        "display_name": "BP R&D Division",
        "lead": "Kofi Amoah",
        "specialty": "Research & Innovation",
        "focus_areas": ["AI/ML Research", "Blockchain", "Agent Systems", "Data Science"]
    },
    "BluePadsVision_AgentSwarm_ClaudeCLI": {
        "display_name": "BP Marketing Agency",
        "lead": "Amara Okafor",
        "specialty": "Marketing Agency",
        "focus_areas": ["Brand Strategy", "Digital Marketing", "UI/UX Design", "Content Creation"]
    },
}

def build_swarms_from_agents():
    """Build swarms list from actual agent data"""
    summary = get_agents_summary()
    swarms = []

    for swarm_name, info in summary.items():
        # Skip Griot (BluePadsGlobal) when building swarm list
        if swarm_name == "BluePadsGlobal":
            continue

        metadata = SWARM_METADATA.get(swarm_name, {})
        swarms.append({
            "name": swarm_name,  # Keep full name for agent filtering
            "display_name": metadata.get("display_name", swarm_name),
            "agents": info["count"],
            "lead": metadata.get("lead", "TBD"),
            "specialty": metadata.get("specialty", "Specialized Agents"),
            "focus_areas": metadata.get("focus_areas", [])
        })

    return swarms

@app.get(f"{settings.API_PREFIX}/swarms")
async def list_swarms():
    """List BluePadsGlobal swarms with actual agent counts"""
    swarms = build_swarms_from_agents()
    return {"swarms": swarms, "total": len(swarms), "total_agents": sum(s["agents"] for s in swarms)}

@app.get(f"{settings.API_PREFIX}/swarms/{{swarm_name}}")
async def get_swarm(swarm_name: str):
    """Get swarm details"""
    swarms = build_swarms_from_agents()
    for swarm in swarms:
        if swarm["name"].lower() == swarm_name.lower():
            return swarm
    raise HTTPException(status_code=404, detail="Swarm not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

# DEBUG ENDPOINT
@app.get(f"{settings.API_PREFIX}/debug/swarm-test")
async def debug_swarm_test():
    """Debug endpoint to test swarm lookups"""
    from app.agents_data import get_agents_by_swarm
    
    test_results = {
        "BluePadsLabs": len(get_agents_by_swarm('BluePadsLabs')),
        "BluePadsLabs_AgentSwarm_ClaudeCLI": len(get_agents_by_swarm('BluePadsLabs_AgentSwarm_ClaudeCLI')),
        "BluePadsGlobal": len(get_agents_by_swarm('BluePadsGlobal')),
    }
    
    # Also show what's in ALL_AGENTS
    from app.agents_data import ALL_AGENTS
    swarms_in_agents = {}
    for agent in ALL_AGENTS:
        swarm = agent.get('swarm', 'UNKNOWN')
        swarms_in_agents[swarm] = swarms_in_agents.get(swarm, 0) + 1
    
    return {
        "test_results": test_results,
        "swarms_in_all_agents": swarms_in_agents,
        "total_agents": len(ALL_AGENTS)
    }


# ============================================================================
# GRIOT QUESTIONNAIRE ENDPOINT
# ============================================================================

@app.post(f"{settings.API_PREFIX}/griot/questionnaire")
async def process_griot_questionnaire(request: dict):
    """
    Process Griot questionnaire responses and determine swarm activation plan
    
    Returns:
    - activated_swarms: List of swarms to activate based on primary and secondary needs
    - activation_plan: Detailed explanation of why each swarm was chosen
    - next_steps: Instructions for user on what happens next
    """
    from typing import List, Dict, Any
    
    # Map primary need to swarm
    primary_need_to_swarm = {
        'wealth_management': 'BluePadsGrowth',
        'software_development': 'BluePadsLabs',
        'legal_compliance': 'BluePadsLegal',
        'marketing_growth': 'BluePadsVision',
        'research_innovation': 'BluePadsResearch',
    }
    
    # Map secondary needs to swarms
    secondary_need_to_swarms = {
        'legal': 'BluePadsLegal',
        'marketing': 'BluePadsVision',
        'research': 'BluePadsResearch',
        'financial': 'BluePadsGrowth',
        'tech': 'BluePadsLabs',
    }
    
    primary_need = request.get('primary_need')
    secondary_needs = request.get('secondary_needs', [])
    organization_name = request.get('organization_name')
    organization_size = request.get('organization_size')
    organization_stage = request.get('organization_stage')
    industry = request.get('industry')
    current_situation = request.get('current_situation')
    
    # Determine activated swarms
    activated_swarms = []
    activation_reasons = {}
    
    # Primary need always activates a swarm
    if primary_need and primary_need in primary_need_to_swarm:
        swarm = primary_need_to_swarm[primary_need]
        activated_swarms.append(swarm)
        activation_reasons[swarm] = f"Primary need: {primary_need.replace('_', ' ').title()}"
    
    # Secondary needs add additional swarms
    for secondary_need in secondary_needs:
        if secondary_need in secondary_need_to_swarms:
            swarm = secondary_need_to_swarms[secondary_need]
            if swarm not in activated_swarms:
                activated_swarms.append(swarm)
                activation_reasons[swarm] = f"Secondary need: {secondary_need.title()}"
    
    # Dependency-based activation
    # If legal is activated, it should come first (dependency)
    if 'BluePadsLegal' in activated_swarms and 'BluePadsGrowth' in activated_swarms:
        # Reorder so Legal comes first
        activated_swarms.remove('BluePadsLegal')
        activated_swarms.insert(0, 'BluePadsLegal')
    
    # Generate activation plan narrative
    situation_summary = current_situation if current_situation else ""
    if situation_summary and len(situation_summary) > 200:
        situation_summary = situation_summary[:200] + '...'

    activation_plan = {
        'session_id': f"SESSION-{int(time.time())}",
        'organization': {
            'name': organization_name,
            'industry': industry,
            'size': organization_size,
            'stage': organization_stage,
        },
        'situation_summary': situation_summary,
        'activated_swarms': [
            {
                'name': swarm,
                'reason': activation_reasons[swarm],
                'agent_count': get_agent_count_for_swarm(swarm),
            }
            for swarm in activated_swarms
        ],
        'griot_message': generate_griot_activation_message(activated_swarms, organization_name),
        'next_steps': [
            'Review your activation plan below',
            'Meet your dedicated teams',
            'Begin your engagement',
            'Monitor progress and adjust as needed',
        ]
    }

    # Create session and save context
    user_context = {
        "primary_need": primary_need,
        "secondary_needs": secondary_needs,
        "organization_name": organization_name,
        "organization_size": organization_size,
        "organization_stage": organization_stage,
        "industry": industry,
        "current_situation": current_situation
    }
    
    # Generate swarm configs
    generated_configs = config_generator.generate_configs(activated_swarms, user_context)
    
    # Create session
    session_id = session_service.create_session(user_context, activation_plan)
    
    # Save generated configs to session artifacts
    for swarm_name, config in generated_configs.items():
        # Map swarm name to config key (e.g. BluePadsLabs -> project.json)
        config_key = "unknown.json"
        if "Growth" in swarm_name: config_key = "advisory.json"
        elif "Labs" in swarm_name: config_key = "project.json"
        elif "Legal" in swarm_name: config_key = "client.json"
        elif "Vision" in swarm_name: config_key = "campaign.json"
        elif "Research" in swarm_name: config_key = "research.json"
        
        session_service.update_session_artifact(session_id, config_key, config)

    return activation_plan


@app.get(f"{settings.API_PREFIX}/session/{{session_id}}")
async def get_session(session_id: str):
    """Get session details including artifacts"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def get_agent_count_for_swarm(swarm_name: str) -> int:
    """Get count of agents in a swarm"""
    agents = get_agents_by_swarm(swarm_name)
    return len(agents)


def generate_griot_activation_message(activated_swarms: List[str], org_name: str) -> str:
    """Generate Griot's activation message"""
    swarm_labels = {
        'BluePadsGrowth': 'Wealth & Growth',
        'BluePadsLabs': 'Engineering & Architecture',
        'BluePadsLegal': 'Legal & Compliance',
        'BluePadsVision': 'Marketing Agency',
        'BluePadsResearch': 'Research & Innovation',
    }
    
    swarms_text = ', '.join([swarm_labels.get(s, s) for s in activated_swarms])
    
    message = f"""
I have listened deeply and I see your path clearly.

For {org_name}, I am activating the following teams to walk alongside you:

{swarms_text}

These teams bring the expertise you need. They understand your situation,
and they are committed to your success. Remember: "I am because we are."

You are never alone on this journey. These swarms form the collective strength
needed to help you achieve your vision.

Your activation begins now.
"""
    return message.strip()


import time
