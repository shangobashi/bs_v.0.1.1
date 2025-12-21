# Implementation Plan: Free Chinese Agents Integration

## Objective
Enable users to chat with Chinese AI agents (Qwen, Ernie, Deepseek, Kimi) for free, without requiring a paid API key.

## Strategy
We will implement a hybrid approach prioritizing **OpenRouter** for its ease of integration and **Local Inference (Ollama)** for privacy and unlimited usage.

### 1. Primary Solution: OpenRouter (The Aggregator)
**Why:** OpenRouter aggregates multiple models including Qwen, Kimi, and Deepseek. It offers a free tier for specific models (e.g., `qwen/qwen-2-7b-instruct:free`, `moonshotai/kimi-k2:free`).
**How:**
- Leverage the existing OpenRouter client in `agent_service.py`.
- Update the backend to accept dynamic model names for OpenRouter instead of the hardcoded `GPT-OSS`.
- Add these models to the frontend selection dropdown.

### 2. Secondary Solution: Local Inference (The Sovereign)
**Why:** True free access, privacy, and no rate limits. Qwen and Deepseek have open weights available.
**How:**
- Add a new `OLLAMA` provider to the backend.
- Point the client to `http://localhost:11434/v1`.
- User installs Ollama and pulls models (e.g., `ollama run qwen2`, `ollama run deepseek-coder`).

### 3. Fallback/Alternative: SiliconFlow
**Why:** Specialized in Chinese models with generous free tiers/credits.
**How:** Similar integration to OpenRouter (OpenAI-compatible API), just a different base URL (`https://api.siliconflow.cn/v1`).

## Implementation Steps

### Phase 1: Backend Updates (`backend/app/services/agent_service.py`)

1.  **Generalize OpenRouter Integration**:
    - Modify `_call_openrouter` and `_stream_openrouter` to use `request.model_name` instead of hardcoded `openai/gpt-oss-120b`.
    - Ensure the `OpenRouter` client is initialized even without a key if we want to allow "free tier only" usage (though OpenRouter usually requires a key even for free tier, we can guide the user to get one, or use a shared/dummy key if applicable, but best to ask user for their free key). *Correction: OpenRouter requires a key. We will prompt the user to get a free key.*

2.  **Add Local/Ollama Support**:
    - Add `ModelProvider.OLLAMA` to `app/schemas/agent.py`.
    - Initialize an `AsyncOpenAI` client pointing to `http://localhost:11434/v1` with a dummy API key.
    - Implement `_call_ollama` and `_stream_ollama` methods.

### Phase 2: Frontend Updates

1.  **Update Model Selection**:
    - In `frontend/src/components/GriotQuestionnaire.jsx` (and wherever model selection happens), add new options:
        - **Qwen**: `qwen/qwen-2-7b-instruct:free` (via OpenRouter) or `qwen2` (via Ollama)
        - **Deepseek**: `deepseek/deepseek-chat:free` (via OpenRouter) or `deepseek-v2` (via Ollama)
        - **Kimi**: `moonshotai/kimi-k2:free` (via OpenRouter)
        - **Ernie**: (Harder to access free via API, recommend Qwen/Deepseek as alternatives or check for specific OpenRouter wrappers).

2.  **Settings Configuration**:
    - Add fields in the Settings page for:
        - `OPENROUTER_API_KEY` (if not already present).
        - `OLLAMA_BASE_URL` (default to `http://localhost:11434/v1`).

## Recommended Models (Free Tier on OpenRouter)
- **Qwen**: `qwen/qwen-2-7b-instruct:free`
- **Deepseek**: `deepseek/deepseek-chat:free`
- **Kimi**: `moonshotai/kimi-k2:free`
- **Yi (01.AI)**: `01-ai/yi-34b-chat:free`

## User Workflow
1.  User selects "Qwen (Free)" from the dropdown.
2.  System checks if `OPENROUTER_API_KEY` is set.
    - If yes, routes request to OpenRouter with `qwen/qwen-2-7b-instruct:free`.
    - If no, prompts user to get a free key from OpenRouter or switch to Local/Ollama.
3.  Alternatively, User selects "Local Qwen (Ollama)".
4.  System routes request to `localhost:11434`.

## Notes
- **Ernie (Baidu)**: Direct free API access is limited outside China. We recommend using Qwen or Deepseek as high-quality Chinese alternatives that are more accessible.
- **Rate Limits**: Free tiers on OpenRouter have rate limits. Local inference is recommended for heavy usage.
