import asyncio
import time
from typing import AsyncGenerator, Optional, Dict, Any, List
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

        try:
            if settings.OPENROUTER_API_KEY:
                self.openrouter_client = AsyncOpenAI(
                    api_key=settings.OPENROUTER_API_KEY,
                    base_url="https://openrouter.ai/api/v1"
                )
            else:
                self.openrouter_client = None
        except Exception as e:
            print(f"Failed to initialize OpenRouter client: {e}")
            self.openrouter_client = None

        try:
            # Initialize Ollama client (using OpenAI compatible API)
            # Default to localhost:11434 if not specified
            ollama_base_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434/v1")
            self.ollama_client = AsyncOpenAI(
                api_key="ollama", # Ollama doesn't require a key, but library might expect one
                base_url=ollama_base_url
            )
        except Exception as e:
            print(f"Failed to initialize Ollama client: {e}")
            self.ollama_client = None

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
                if request.model_name == "GPT-OSS":
                     content, tokens = await self._call_openrouter(request)
                else:
                    content, tokens = await self._call_openai(request)
            elif request.provider == ModelProvider.GEMINI:
                content, tokens = await self._call_gemini(request)
            elif request.provider == ModelProvider.OLLAMA:
                content, tokens = await self._call_ollama(request)
            elif request.provider == ModelProvider.OPENROUTER:
                content, tokens = await self._call_openrouter(request)
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

    async def stream_agent(self, request: AgentRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream agent response with WebSocket"""
        try:
            # Inject session context if available
            if request.session_id:
                session = session_service.get_session(request.session_id)
                if session and request.system_prompt:
                    context_str = self._build_context_string(session)
                    request.system_prompt += f"\n\n{context_str}"

            processor = StreamProcessor()
            
            # Select the appropriate generator based on provider
            generator = None
            if request.provider == ModelProvider.CLAUDE:
                generator = self._stream_claude(request)
            elif request.provider == ModelProvider.OPENAI:
                if request.model_name == "GPT-OSS":
                    generator = self._stream_openrouter(request)
                else:
                    generator = self._stream_openai(request)
            elif request.provider == ModelProvider.GEMINI:
                generator = self._stream_gemini(request)
            elif request.provider == ModelProvider.OLLAMA:
                generator = self._stream_ollama(request)
            elif request.provider == ModelProvider.OPENROUTER:
                generator = self._stream_openrouter(request)
            
            if generator:
                async for chunk in generator:
                    # Process chunk through StreamProcessor
                    events = processor.process(chunk)
                    for event in events:
                        yield event
                
                # Flush any remaining content
                remaining_events = processor.flush()
                for event in remaining_events:
                    yield event
                    
        except Exception as e:
            yield {"type": "error", "content": f"ERROR: {str(e)}"}



    async def _call_claude(self, request: AgentRequest) -> tuple[str, int]:
        """Call Claude API"""
        if not self.claude_client:
            return f"Have you forgotten to set your Claude API Key in [Settings](/settings)?", 0

        model = request.model_name or "claude-sonnet-4-5-20250929"
        # Map frontend model names to API model names
        if model == "Claude Opus 4.5":
            model = "claude-opus-4-5-20251101"
        elif model == "Claude Sonnet 4.5":
            model = "claude-sonnet-4-5-20250929"
        elif model == "Claude Haiku 4.5":
            model = "claude-haiku-4-5-20251001"

        response = await self.claude_client.messages.create(
            model=model,
            max_tokens=request.max_tokens,
            messages=[{"role": "user", "content": request.message}],
            system=request.system_prompt or "You are a helpful AI assistant"
        )
        return response.content[0].text, response.usage.output_tokens

    async def _stream_claude(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream Claude response"""
        if not self.claude_client:
            yield f"Have you forgotten to set your Claude API Key in [Settings](/settings)?"
            return

        model = request.model_name or "claude-sonnet-4-5-20250929"
        if model == "Claude Opus 4.5":
            model = "claude-opus-4-5-20251101"
        elif model == "Claude Sonnet 4.5":
            model = "claude-sonnet-4-5-20250929"
        elif model == "Claude Haiku 4.5":
            model = "claude-haiku-4-5-20251001"

        with self.claude_client.messages.stream(
            model=model,
            max_tokens=request.max_tokens,
            messages=[{"role": "user", "content": request.message}],
            system=request.system_prompt or "You are a helpful AI assistant"
        ) as stream:
            for text in stream.text_stream:
                yield text

    async def _call_openai(self, request: AgentRequest) -> tuple[str, int]:
        """Call OpenAI API"""
        model = request.model_name or "gpt-5.2"
        
        # Map frontend names to API model IDs
        if model == "GPT-5.2 Thinking":
            model = "gpt-5.2"
        elif model == "GPT-5.2 Instant":
            model = "gpt-5.2-chat-latest"
        elif model == "GPT-5.2 Codex":
            model = "gpt-5.2-codex"
        elif model == "GPT-4.5":
            model = "gpt-4.5"
        
        # GPT-OSS is handled by _call_openrouter

        if not self.openai_client:
             return f"Have you forgotten to set your OpenAI API Key in [Settings](/settings)?", 0

        # Add reasoning_effort if using GPT-5-High (if supported by library, otherwise just use model)
        # For now, we assume the model ID distinction is sufficient or the library isn't updated for reasoning_effort param yet
        
        response = await self.openai_client.chat.completions.create(
            model=model,
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
        model = request.model_name or "gpt-5.2"
        
        if model == "GPT-5.2 Thinking":
            model = "gpt-5.2"
        elif model == "GPT-5.2 Instant":
            model = "gpt-5.2-chat-latest"
        elif model == "GPT-5.2 Codex":
            model = "gpt-5.2-codex"
        elif model == "GPT-4.5":
            model = "gpt-4.5"
        
        # GPT-OSS is handled by _stream_openrouter

        if not self.openai_client:
            yield f"Have you forgotten to set your OpenAI API Key in [Settings](/settings)?"
            return

        stream = await self.openai_client.chat.completions.create(
            model=model,
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
            return f"Have you forgotten to set your Gemini API Key in [Settings](/settings)?", 0

        # Create model with system instruction if provided
        model_name = request.model_name or "gemini-3-flash"
        
        if model_name == "Gemini 3 Flash":
            model_name = "gemini-3-flash"
        elif model_name == "Gemini 3 Pro":
            model_name = "gemini-3-pro"
        elif model_name == "Gemini 3 Deep Think":
            model_name = "gemini-3-deep-think"

        # Create model with system instruction if provided
        if request.system_prompt:
            model = self.gemini_client.GenerativeModel(
                model_name,
                system_instruction=request.system_prompt
            )
        else:
            model = self.gemini_client.GenerativeModel(model_name)

        response = model.generate_content(request.message)
        return response.text, 0  # Gemini doesn't provide token count in this API

    async def _stream_gemini(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream Gemini response"""
        if not self.gemini_client:
            yield f"Have you forgotten to set your Gemini API Key in [Settings](/settings)?"
            return

        # Create model with system instruction if provided
        model_name = request.model_name or "gemini-3-flash"
        
        if model_name == "Gemini 3 Flash":
            model_name = "gemini-3-flash"
        elif model_name == "Gemini 3 Pro":
            model_name = "gemini-3-pro"
        elif model_name == "Gemini 3 Deep Think":
            model_name = "gemini-3-deep-think"

        # Create model with system instruction if provided
        if request.system_prompt:
            model = self.gemini_client.GenerativeModel(
                model_name,
                system_instruction=request.system_prompt
            )
        else:
            model = self.gemini_client.GenerativeModel(model_name)

        response = model.generate_content(request.message, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text

    async def _call_openrouter(self, request: AgentRequest) -> tuple[str, int]:
        """Call OpenRouter API"""
        if not self.openrouter_client:
             return f"Have you forgotten to set your OpenRouter API Key in [Settings](/settings)?", 0

        model = request.model_name or "meta-llama/llama-3.3-70b-instruct:free"
        # Handle legacy "GPT-OSS" name or generic names
        if model == "GPT-OSS" or model == "Llama 3.3 70B (Free)":
            model = "meta-llama/llama-3.3-70b-instruct:free"
        elif model == "Qwen 2.5 Coder 32B":
            model = "qwen/qwen-2.5-coder-32b-instruct:free"
        
        # Ensure we are using valid free models if requested
        if "free" in model and ":" not in model:
             # Try to append :free if it looks like a free model request but missing tag
             model = f"{model}:free"

        response = await self.openrouter_client.chat.completions.create(
            model=model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            messages=[
                {"role": "system", "content": request.system_prompt or "You are a helpful AI assistant"},
                {"role": "user", "content": request.message}
            ],
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "BlueSwarm MVP",
            }
        )
        return response.choices[0].message.content, response.usage.completion_tokens

    async def _stream_openrouter(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream OpenRouter response"""
        if not self.openrouter_client:
             yield f"Have you forgotten to set your OpenRouter API Key in [Settings](/settings)?"
             return

        model = request.model_name or "openai/gpt-oss-120b"
        if model == "GPT-OSS":
            model = "openai/gpt-oss-120b"

        stream = await self.openrouter_client.chat.completions.create(
            model=model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            stream=True,
            messages=[
                {"role": "system", "content": request.system_prompt or "You are a helpful AI assistant"},
                {"role": "user", "content": request.message}
            ],
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "BlueSwarm MVP",
            }
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def _call_ollama(self, request: AgentRequest) -> tuple[str, int]:
        """Call Ollama API (Local)"""
        if not self.ollama_client:
            return "Ollama client not initialized. Is Ollama running on localhost:11434?", 0

        model = request.model_name or "qwen2"
        
        try:
            response = await self.ollama_client.chat.completions.create(
                model=model,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                messages=[
                    {"role": "system", "content": request.system_prompt or "You are a helpful AI assistant"},
                    {"role": "user", "content": request.message}
                ]
            )
            return response.choices[0].message.content, response.usage.completion_tokens
        except Exception as e:
            return f"Error calling Ollama: {str(e)}. Make sure model '{model}' is pulled (run 'ollama pull {model}').", 0

    async def _stream_ollama(self, request: AgentRequest) -> AsyncGenerator[str, None]:
        """Stream Ollama response"""
        if not self.ollama_client:
            yield "Ollama client not initialized. Is Ollama running on localhost:11434?"
            return

        model = request.model_name or "qwen2"

        try:
            stream = await self.ollama_client.chat.completions.create(
                model=model,
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
        except Exception as e:
            yield f"Error calling Ollama: {str(e)}. Make sure model '{model}' is pulled (run 'ollama pull {model}')."

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

IMPORTANT INSTRUCTION:
Check the conversation history before responding. If you have already introduced yourself (Name, Division, Specialty) in this session, DO NOT repeat the full introduction. Only introduce yourself if this is the very first message of the conversation or if explicitly asked. Be concise.
"""

class StreamProcessor:
    """
    Processes a stream of text chunks to separate <thinking> blocks from regular content.
    Emits structured events:
    - {"type": "thought", "content": "..."}
    - {"type": "content", "content": "..."}
    """
    def __init__(self):
        self.buffer = ""
        self.in_thinking_block = False
        self.thinking_tag_start = "<thinking>"
        self.thinking_tag_end = "</thinking>"

    def process(self, chunk: str) -> List[Dict[str, Any]]:
        self.buffer += chunk
        events = []
        
        while True:
            if not self.in_thinking_block:
                # Look for start tag
                start_idx = self.buffer.find(self.thinking_tag_start)
                
                if start_idx != -1:
                    # Found start tag
                    # Emit everything before the tag as content
                    if start_idx > 0:
                        events.append({"type": "content", "content": self.buffer[:start_idx]})
                    
                    # Remove processed part including the tag
                    self.buffer = self.buffer[start_idx + len(self.thinking_tag_start):]
                    self.in_thinking_block = True
                else:
                    # No start tag found yet
                    # Check if we might be in the middle of a start tag
                    # Keep the last few chars just in case they are part of "<thinking>"
                    partial_len = len(self.thinking_tag_start) - 1
                    if len(self.buffer) > partial_len:
                        # Safe to emit the beginning
                        content_to_emit = self.buffer[:-partial_len]
                        if content_to_emit:
                            events.append({"type": "content", "content": content_to_emit})
                            self.buffer = self.buffer[-partial_len:]
                    break
            
            else: # Inside thinking block
                # Look for end tag
                end_idx = self.buffer.find(self.thinking_tag_end)
                
                if end_idx != -1:
                    # Found end tag
                    # Emit everything before the tag as thought
                    if end_idx > 0:
                        events.append({"type": "thought", "content": self.buffer[:end_idx]})
                    
                    # Remove processed part including the tag
                    self.buffer = self.buffer[end_idx + len(self.thinking_tag_end):]
                    self.in_thinking_block = False
                else:
                    # No end tag found yet
                    # Check if we might be in the middle of an end tag
                    partial_len = len(self.thinking_tag_end) - 1
                    if len(self.buffer) > partial_len:
                        # Safe to emit the beginning as thought
                        thought_to_emit = self.buffer[:-partial_len]
                        if thought_to_emit:
                            events.append({"type": "thought", "content": thought_to_emit})
                            self.buffer = self.buffer[-partial_len:]
                    break
        
        return events

    def flush(self) -> List[Dict[str, Any]]:
        """Flush any remaining buffer content"""
        events = []
        if self.buffer:
            if self.in_thinking_block:
                # If we are still in thinking block at the end, treat it as thought
                events.append({"type": "thought", "content": self.buffer})
            else:
                events.append({"type": "content", "content": self.buffer})
        self.buffer = ""
        return events

# Global service instance
agent_service = MultiAPIAgentService()
