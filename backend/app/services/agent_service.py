import asyncio
import time
from typing import AsyncGenerator, Optional, Dict, Any
from datetime import datetime
from app.schemas.agent import ModelProvider, AgentRequest, AgentResponse
from app.core.config import settings
from app.services.session_service import session_service

class MultiAPIAgentService:
    """Service for routing requests to multiple AI providers"""

    def __init__(self):
        self._init_clients()

    def _init_clients(self):
        """Initialize API clients for each provider"""
        try:
            from anthropic import AsyncAnthropic
            if settings.ANTHROPIC_API_KEY:
                self.claude_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            else:
                self.claude_client = None
        except Exception as e:
            print(f"Failed to initialize Claude client: {e}")
            self.claude_client = None

        try:
            from openai import AsyncOpenAI
            if settings.OPENAI_API_KEY:
                self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            else:
                self.openai_client = None
        except Exception as e:
            print(f"Failed to initialize OpenAI client: {e}")
            self.openai_client = None

        try:
            import google.generativeai as genai
            if settings.GOOGLE_API_KEY:
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                self.gemini_client = genai
            else:
                self.gemini_client = None
        except Exception as e:
            print(f"Failed to initialize Gemini client: {e}")
            self.gemini_client = None

    async def execute_agent(self, request: AgentRequest) -> AgentResponse:
        """Execute agent request with specified provider"""
        start_time = time.time()

        try:
            # Inject session context if available
            if request.session_id:
                session = session_service.get_session(request.session_id)
                if session and request.system_prompt:
                    context_str = self._build_context_string(session)
                    request.system_prompt += f"\n\n{context_str}"

            if request.provider == ModelProvider.CLAUDE:
                content, tokens = await self._call_claude(request)
            elif request.provider == ModelProvider.OPENAI:
                content, tokens = await self._call_openai(request)
            elif request.provider == ModelProvider.GEMINI:
                content, tokens = await self._call_gemini(request)
            else:
                raise ValueError(f"Unknown provider: {request.provider}")

            elapsed_ms = (time.time() - start_time) * 1000

            # Use BluePadsGlobal agent_id if provided, otherwise generate one
            agent_id = request.agent_id or f"{request.provider.value}-{int(time.time())}"

            return AgentResponse(
                agent_id=agent_id,
                content=content,
                provider=request.provider,
                tokens_used=tokens,
                execution_time_ms=elapsed_ms,
                timestamp=datetime.now().isoformat()
            )
        except Exception as e:
            raise Exception(f"Agent execution failed: {str(e)}")

    async def stream_agent(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream agent response with WebSocket"""
        try:
            # Inject session context if available
            if request.session_id:
                session = session_service.get_session(request.session_id)
                if session and request.system_prompt:
                    context_str = self._build_context_string(session)
                    request.system_prompt += f"\n\n{context_str}"

            if request.provider == ModelProvider.CLAUDE:
                async for chunk in self._stream_claude(request):
                    yield chunk
            elif request.provider == ModelProvider.OPENAI:
                async for chunk in self._stream_openai(request):
                    yield chunk
            elif request.provider == ModelProvider.GEMINI:
                async for chunk in self._stream_gemini(request):
                    yield chunk
        except Exception as e:
            yield f"ERROR: {str(e)}"

    async def _call_claude(self, request: AgentRequest) -> tuple[str, int]:
        """Call Claude API"""
        if not self.claude_client:
            raise ValueError("Claude client not initialized")

        response = await self.claude_client.messages.create(
            model="claude-4-5-sonnet-20250929",
            max_tokens=request.max_tokens,
            messages=[{"role": "user", "content": request.message}],
            system=request.system_prompt or "You are a helpful AI assistant"
        )
        return response.content[0].text, response.usage.output_tokens

    async def _stream_claude(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream Claude response"""
        if not self.claude_client:
            raise ValueError("Claude client not initialized")

        with self.claude_client.messages.stream(
            model="claude-4-5-sonnet-20250929",
            max_tokens=request.max_tokens,
            messages=[{"role": "user", "content": request.message}],
            system=request.system_prompt or "You are a helpful AI assistant"
        ) as stream:
            for text in stream.text_stream:
                yield text

    async def _call_openai(self, request: AgentRequest) -> tuple[str, int]:
        """Call OpenAI API"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")

        response = await self.openai_client.chat.completions.create(
            model="gpt-5.1",
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            messages=[
                {"role": "system", "content": request.system_prompt or "You are a helpful AI assistant"},
                {"role": "user", "content": request.message}
            ]
        )
        return response.choices[0].message.content, response.usage.completion_tokens

    async def _stream_openai(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream OpenAI response"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")

        stream = await self.openai_client.chat.completions.create(
            model="gpt-5.1",
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            stream=True,
            messages=[
                {"role": "system", "content": request.system_prompt or "You are a helpful AI assistant"},
                {"role": "user", "content": request.message}
            ]
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def _call_gemini(self, request: AgentRequest) -> tuple[str, int]:
        """Call Google Gemini API"""
        if not self.gemini_client:
            raise ValueError("Gemini client not initialized")

        # Create model with system instruction if provided
        if request.system_prompt:
            model = self.gemini_client.GenerativeModel(
                "gemini-3-pro-preview",
                system_instruction=request.system_prompt
            )
        else:
            model = self.gemini_client.GenerativeModel("gemini-3-pro-preview")

        response = model.generate_content(request.message)
        return response.text, 0  # Gemini doesn't provide token count in this API

    async def _stream_gemini(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream Gemini response"""
        if not self.gemini_client:
            raise ValueError("Gemini client not initialized")

        # Create model with system instruction if provided
        if request.system_prompt:
            model = self.gemini_client.GenerativeModel(
                "gemini-3-pro-preview",
                system_instruction=request.system_prompt
            )
        else:
            model = self.gemini_client.GenerativeModel("gemini-3-pro-preview")

        response = model.generate_content(request.message, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text

    def _build_context_string(self, session: Dict[str, Any]) -> str:
        """Build context string from session data"""
        user_context = session.get("user_context", {})
        plan = session.get("activation_plan", {})
        org = plan.get("organization", {})
        
        artifacts = session.get("artifacts", {})
        artifacts_str = ""
        if artifacts:
            artifacts_str = "\nGENERATED CONFIGS:\n"
            for key, value in artifacts.items():
                artifacts_str += f"--- {key} ---\n{value}\n"

        return f"""
PROJECT CONTEXT & ACTIVATION PLAN:
Organization: {org.get('name')} ({org.get('size')}, {org.get('stage')})
Industry: {org.get('industry')}
Situation: {plan.get('situation_summary')}

ACTIVATED SWARMS:
{', '.join([s['name'] for s in plan.get('activated_swarms', [])])}
{artifacts_str}
You are part of this active engagement. Use this context to inform your responses.
"""

# Global service instance
agent_service = MultiAPIAgentService()
