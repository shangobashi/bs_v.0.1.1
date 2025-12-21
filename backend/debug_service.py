
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(r"c:\Users\Shango\Documents\Code\SwarmAgents_WebUI_MVP\backend")
sys.path.append(str(backend_path))

try:
    from app.services.agent_service import agent_service
    print(f"Agent service instance: {agent_service}")
    print(f"Has _call_openrouter: {hasattr(agent_service, '_call_openrouter')}")
    if hasattr(agent_service, '_call_openrouter'):
        print("Method found.")
    else:
        print("Method NOT found.")
        print(f"Attributes: {dir(agent_service)}")
except Exception as e:
    print(f"Error: {e}")
