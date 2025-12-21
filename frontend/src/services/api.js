import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

class AgentAPI {
  constructor(baseURL = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Health & Status
  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/session/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Agent Execution
  async executeAgent(message, provider, options = {}) {
    try {
      const response = await this.client.post('/agent/execute', {
        message,
        provider,
        model_name: options.model,
        agent_id: options.agentId,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        system_prompt: options.systemPrompt,
        session_id: options.sessionId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Agent Management
  async listAgents() {
    try {
      const response = await this.client.get('/agents');
      return response.data.agents;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAgent(agentId) {
    try {
      const response = await this.client.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Swarm Management
  async listSwarms() {
    try {
      const response = await this.client.get('/swarms');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSwarm(swarmName) {
    try {
      const response = await this.client.get(`/swarms/${swarmName}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Configuration
  async setApiKey(provider, apiKey) {
    try {
      const response = await this.client.post('/config/set-api-key', {
        provider,
        api_key: apiKey,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Griot Questionnaire
  async submitGriotQuestionnaire(data) {
    try {
      const response = await this.client.post('/griot/questionnaire', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return new Error(error.response.data.detail || 'API Error');
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Is the backend running?');
    } else {
      return error;
    }
  }
}

export default new AgentAPI();
