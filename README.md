# SwarmAgents WebUI MVP

> **Note**: This is a private portfolio project. The code provided here is a limited MVP snapshot demonstrating core architectural concepts. The full production system is proprietary.

## Project Overview

**SwarmAgents** is a sophisticated orchestration platform designed to manage and deploy **60+ humanized AI agents** organized into specialized "swarms" (Legal, Research, Vision, Labs, Growth).

Unlike standard chatbot wrappers, this system implements a **multi-agent architecture** where agents maintain distinct personas, expertise, and operational boundaries. The platform abstracts the complexity of interacting with multiple LLM providers (Anthropic Claude, OpenAI GPT-4, Google Gemini) into a unified, real-time interface.

### Core Engineering Challenges Solved
*   **Unified AI Interface**: Normalizing streaming responses from disparate API providers (Claude, OpenAI, Gemini) into a single, consistent WebSocket stream.
*   **State Management**: Persisting complex conversation states across browser sessions and agent handoffs.
*   **Agent Orchestration**: Dynamic routing of user queries to specific agents based on expertise (e.g., routing a contract question to the Legal swarm).
*   **Scalable Architecture**: Decoupled frontend and backend designed for horizontal scaling.

---

## Technical Architecture

### Backend (Python / FastAPI)
*   **Framework**: FastAPI for high-performance, async API handling.
*   **Real-time Communication**: Custom WebSocket implementation for low-latency token streaming.
*   **Design Pattern**: Service-oriented architecture with clear separation of concerns (Core, Services, API, Models).
*   **AI Integration**: Modular adapter pattern to easily plug in new LLM providers without refactoring core logic.
*   **Security**: Environment-based configuration and strict API key management (audited for security).

### Frontend (React)
*   **Framework**: React 18 with functional components and Hooks.
*   **State Management**: Context API for global state (Theme, Auth) and local state for chat history.
*   **UI/UX**: Custom CSS variable-based theming system (Dark/Light mode) with glassmorphism design elements.
*   **Performance**: Optimistic UI updates and efficient re-rendering strategies for streaming text.

### Infrastructure & DevOps
*   **Version Control**: Git with strict commit history management.
*   **Environment**: Cross-platform compatibility (Windows/Linux/MacOS).
*   **Deployment**: Docker-ready architecture (MVP runs locally for demonstration).

---

## Key Features

### 1. Multi-Provider AI Support
Seamlessly switch between **Claude 3.5 Sonnet**, **GPT-4o**, and **Gemini 1.5 Pro** mid-conversation. The backend handles the context window translation and token limit management.

### 2. "Swarm" Intelligence
Agents are not standalone; they belong to functional departments:
*   **BluePadsLegal**: Compliance, contracts, and regulatory agents.
*   **BluePadsGrowth**: Marketing, sales, and business development agents.
*   **BluePadsLabs**: Engineering, R&D, and technical agents.
*   **BluePadsVision**: Design, UI/UX, and creative direction agents.

### 3. Real-time Streaming
Implemented a robust WebSocket service that handles network interruptions and provides a "typing" experience indistinguishable from native chat applications.

### 4. Persistent Context
Leverages local storage and backend session management to ensure conversations can be resumed across page reloads, preserving the "memory" of the AI agents.

---

## Project Structure

The codebase follows industry-standard directory structures to ensure maintainability and readability.

```
SwarmAgents_WebUI_MVP/
├── backend/
│   ├── app/
│   │   ├── services/         # Business logic (Agent orchestration, API adapters)
│   │   ├── api/              # REST & WebSocket endpoints
│   │   ├── core/             # Config & Security settings
│   │   └── models/           # Data models & Schemas
│   └── tests/                # Pytest suite for reliability
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Chat, Modals, Inputs)
│   │   ├── services/         # API & WebSocket clients
│   │   ├── context/          # Global state providers
│   │   └── styles/           # Modular CSS architecture
│   └── public/               # Static assets
```

---

## Future Roadmap (Production)

*   **Vector Database Integration**: For long-term agent memory and RAG (Retrieval-Augmented Generation).
*   **Auth0 / OAuth2**: Enterprise-grade user authentication.
*   **Horizontal Scaling**: Kubernetes deployment for handling thousands of concurrent agent sessions.
*   **Agent-to-Agent Communication**: Allowing agents to collaborate in the background to solve complex user tasks.

---

## Contact

**Shango Bashi**
*   [GitHub Profile](https://github.com/shangobashi)

*This project is part of my technical portfolio demonstrating full-stack development, AI system design, and product engineering capabilities.*
