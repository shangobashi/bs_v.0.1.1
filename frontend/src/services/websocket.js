class WebSocketService {
  constructor(baseURL = 'ws://localhost:8000/api/v1') {
    this.baseURL = baseURL;
    this.ws = null;
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.closeHandlers = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const url = `${this.baseURL}/agent/stream`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.errorHandlers.forEach(handler => handler(error));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.closeHandlers.forEach(handler => handler());
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  streamAgent(message, provider, options = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const request = {
      message,
      provider,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      system_prompt: options.systemPrompt,
      session_id: options.sessionId,
    };

    this.ws.send(JSON.stringify(request));
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  onClose(handler) {
    this.closeHandlers.push(handler);
    return () => {
      this.closeHandlers = this.closeHandlers.filter(h => h !== handler);
    };
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService;
