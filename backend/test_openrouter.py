
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(r"c:\Users\Shango\Documents\Code\SwarmAgents_WebUI_MVP\backend")
sys.path.append(str(backend_path))

from app.services.agent_service import agent_service
from app.schemas.agent import AgentRequest, ModelProvider

async def test_openrouter():
    print("Testing OpenRouter...")
    request = AgentRequest(
        message="Hi, who are you?",
        provider=ModelProvider.OPENROUTER,
        model_name="meta-llama/llama-3.3-70b-instruct:free"
    )
    try:
        # Check if method exists
        if not hasattr(agent_service, "_call_openrouter"):
            print("CRITICAL: _call_openrouter NOT FOUND on agent_service")
            return
        
        print("Calling execute_agent...")
        response = await agent_service.execute_agent(request)
        print(f"Response: {response.content[:100]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_openrouter())
