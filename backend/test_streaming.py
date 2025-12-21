
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(r"c:\Users\Shango\Documents\Code\SwarmAgents_WebUI_MVP\backend")
sys.path.append(str(backend_path))

from app.services.agent_service import agent_service
from app.schemas.agent import AgentRequest, ModelProvider

async def test_streaming():
    print("Testing Streaming...")
    request = AgentRequest(
        message="Hi, please use <thinking> tags to tell me what you are thinking, then say hello.",
        provider=ModelProvider.OPENROUTER,
        model_name="meta-llama/llama-3.3-70b-instruct:free"
    )
    try:
        print("Calling stream_agent...")
        async for event in agent_service.stream_agent(request):
            print(f"Event: {event['type']} | Content: {repr(event['content'][:50])}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_streaming())
