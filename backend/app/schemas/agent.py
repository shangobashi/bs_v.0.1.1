from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class ModelProvider(str, Enum):
    CLAUDE = "claude"
    OPENAI = "openai"
    GEMINI = "gemini"

class AgentRole(str, Enum):
    LABS = "labs"
    LEGAL = "legal"
    VISION = "vision"
    RESEARCH = "research"

class AgentRequest(BaseModel):
    """Request schema for agent execution"""
    message: str
    provider: ModelProvider
    agent_id: Optional[str] = None  # BluePadsGlobal agent identifier
    agent_role: Optional[AgentRole] = None
    temperature: float = 0.7
    max_tokens: int = 2048
    system_prompt: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    """Response schema from agent execution"""
    agent_id: str
    content: str
    provider: ModelProvider
    tokens_used: int
    execution_time_ms: float
    timestamp: str

class StreamingMessage(BaseModel):
    """WebSocket streaming message"""
    type: str  # "start", "delta", "error", "complete"
    content: Optional[str] = None
    agent_id: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AgentProfile(BaseModel):
    """Agent profile from BluePadsGlobal swarms"""
    id: str
    name: str
    title: str
    swarm: str
    specialization: str
    language: str
    experience_years: int
    expertise_areas: List[str]
    biography: Optional[str] = None
    background_history: Optional[str] = None
    achievements: Optional[str] = None

class ApiKeyRequest(BaseModel):
    """Request schema for setting API keys"""
    provider: str
    api_key: str
