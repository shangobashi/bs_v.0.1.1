import React, { useState, useEffect, useRef } from 'react';
import agentAPI from '../services/api';
import WebSocketService from '../services/websocket';
import MessageDisplay from './MessageDisplay';
import GriotQuestionnaire from './GriotQuestionnaire';
import ArtifactViewer from './ArtifactViewer';
import '../styles/components.css';

function AgentChat() {
  // Initialize state from localStorage if available
  const [message, setMessage] = useState('');

  const [provider, setProvider] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).provider || 'claude' : 'claude';
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).messages || [] : [];
  });

  const [loading, setLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [status, setStatus] = useState(null);
  const [agents, setAgents] = useState([]);

  const [selectedAgent, setSelectedAgent] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).selectedAgent || null : null;
  });

  const [griotActivationPlan, setGriotActivationPlan] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).griotActivationPlan || null : null;
  });

  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).sessionId || null : null;
  });

  const [sessionArtifacts, setSessionArtifacts] = useState({});
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const messagesEndRef = useRef(null);
  const wsServiceRef = useRef(null);
  const agentsRef = useRef([]); // Keep track of agents for WebSocket callbacks

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      messages,
      selectedAgent,
      griotActivationPlan,
      sessionId,
      provider
    };
    localStorage.setItem('swarm_chat_state', JSON.stringify(stateToSave));
  }, [messages, selectedAgent, griotActivationPlan, sessionId, provider]);

  // Sync agentsRef with agents state
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  useEffect(() => {
    fetchStatus();
    loadAgents();
    initializeWebSocket();

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
    checkForDelegation();
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      loadSessionArtifacts();
    }
  }, [sessionId]);

  const clearChat = () => {
    setShowClearModal(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    setSessionId(null);
    setGriotActivationPlan(null);
    setSessionArtifacts({});
    localStorage.removeItem('swarm_chat_state');
    setShowClearModal(false);
  };

  const downloadChat = (format) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chat-history-${timestamp}.${format === 'json' ? 'json' : 'md'}`;
    let content = '';
    let type = '';

    if (format === 'json') {
      content = JSON.stringify({
        sessionId,
        agent: selectedAgent?.name,
        messages,
        artifacts: sessionArtifacts
      }, null, 2);
      type = 'application/json';
    } else {
      // Markdown format
      content = `# Chat History with ${selectedAgent?.name || 'Agent'}\n\n`;
      content += `**Date:** ${new Date().toLocaleString()}\n`;
      content += `**Session ID:** ${sessionId || 'N/A'}\n\n---\n\n`;

      messages.forEach(msg => {
        const role = msg.type === 'user' ? 'User' : (msg.agentName || 'Agent');
        content += `### ${role}\n${msg.content}\n\n`;
      });
      type = 'text/markdown';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowClearModal(false);
  };

  const loadSessionArtifacts = async () => {
    try {
      const session = await agentAPI.getSession(sessionId);
      if (session && session.artifacts) {
        setSessionArtifacts(session.artifacts);
      }
    } catch (error) {
      console.error('Error loading session artifacts:', error);
    }
  };

  const handleConsultation = async (content) => {
    const match = content.match(/\[CONSULT:\s*([^\]]+)\]/i);
    if (match) {
      const targetAgentName = match[1].trim();
      console.log(`Consultation detected with: ${targetAgentName}`);

      const targetAgent = agentsRef.current.find(a => a.name.toLowerCase() === targetAgentName.toLowerCase());

      if (targetAgent) {
        // Extract question
        const question = content.split(match[0])[1].trim();

        setMessages(prev => [...prev, {
          type: 'system',
          content: `📞 Consulting ${targetAgent.name} (${targetAgent.title})...`
        }]);

        try {
          // Call the consulted agent
          // We use non-streaming for the internal consultation to keep it simple
          const response = await agentAPI.executeAgent(question, provider, {
            systemPrompt: targetAgent.system_prompt,
            agentId: targetAgent.id,
            sessionId: sessionId
          });

          const answer = response.content;

          setMessages(prev => [...prev, {
            type: 'system',
            content: `✅ ${targetAgent.name} says: "${answer.substring(0, 100)}..."`
          }]);

          // Feed answer back to original agent
          const feedback = `[SYSTEM: ${targetAgent.name} responded: "${answer}". Please incorporate this into your response to the user.]`;

          // Trigger original agent again
          setTimeout(() => {
            executeAgentRequest(feedback, true);
          }, 1000);

        } catch (error) {
          console.error('Consultation failed:', error);
          setMessages(prev => [...prev, { type: 'error', content: `Consultation failed: ${error.message}` }]);
        }
      } else {
        console.warn(`Consultation target '${targetAgentName}' not found.`);
      }
      return true;
    }
    return false;
  };

  const handleDelegation = async (content) => {
    // Check for Consultation first (as it might appear similar or be prioritized)
    if (await handleConsultation(content)) return true;

    // Simple regex to find [DELEGATE: Agent Name]
    const match = content.match(/\[DELEGATE:\s*([^\]]+)\]/i);
    if (match) {
      const targetAgentName = match[1].trim();
      console.log(`Delegation detected to: ${targetAgentName}`);

      // Find the agent using ref to avoid stale closure
      const targetAgent = agentsRef.current.find(a => a.name.toLowerCase() === targetAgentName.toLowerCase());

      if (targetAgent) {
        // Add system message about delegation
        setMessages(prev => [...prev, {
          type: 'system',
          content: `🔄 Delegating task to ${targetAgent.name} (${targetAgent.title})...`
        }]);

        // Switch agent
        try {
          const fullAgent = await agentAPI.getAgent(targetAgent.id);
          setSelectedAgent(fullAgent);

          // Extract context (text after the tag)
          const context = content.split(match[0])[1].trim();

          if (context) {
            // Automatically send the context to the new agent
            // We need a small delay to ensure state updates
            setTimeout(() => {
              executeAgentRequest(context, true);
            }, 1000);
          }
        } catch (error) {
          console.error('Error switching agent:', error);
        }
      } else {
        console.warn(`Delegation target '${targetAgentName}' not found.`);
      }
      return true; // Delegation handled
    }
    return false;
  };

  const checkForDelegation = async () => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.type === 'agent' && !lastMsg.streaming) {
      handleDelegation(lastMsg.content);
    }
  };

  const fetchStatus = async () => {
    try {
      const result = await agentAPI.getStatus();
      setStatus(result);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const agentsList = await agentAPI.listAgents();
      setAgents(agentsList);

      // Only load default if no agent is currently selected (and none restored from localStorage)
      if (agentsList.length > 0 && !selectedAgent) {
        // Load the first agent's full details (includes system_prompt)
        const fullAgent = await agentAPI.getAgent(agentsList[0].id);
        setSelectedAgent(fullAgent);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const initializeWebSocket = async () => {
    try {
      const apiBaseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8005/api/v1';
      const wsBaseURL = apiBaseURL.replace('http://', 'ws://').replace('https://', 'wss://');
      wsServiceRef.current = new WebSocketService(wsBaseURL);
      await wsServiceRef.current.connect();
      setWsConnected(true);

      wsServiceRef.current.onMessage((msg) => {
        if (msg.type === 'delta' && msg.content) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.type === 'agent') {
              const newContent = lastMsg.content + msg.content;

              // Check for delegation in real-time
              if (newContent.includes(']')) {
                handleDelegation(newContent);
              }

              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  content: newContent,
                },
              ];
            }
            return prev;
          });
        } else if (msg.type === 'complete') {
          setLoading(false);
        } else if (msg.type === 'error') {
          setMessages((prev) => [
            ...prev,
            { type: 'error', content: msg.error },
          ]);
          setLoading(false);
        }
      });

      wsServiceRef.current.onError((error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
        setUseStreaming(false);
      });

      wsServiceRef.current.onClose(() => {
        setWsConnected(false);
      });
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setUseStreaming(false);
    }
  };

  const handleGriotQuestionnaireComplete = (activationPlan) => {
    // Store the activation plan and session ID
    setGriotActivationPlan(activationPlan);
    if (activationPlan.session_id) {
      setSessionId(activationPlan.session_id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);

    await executeAgentRequest(userMessage);
  };

  const executeAgentRequest = async (userMessage, isSystemHandoff = false) => {
    try {
      const options = selectedAgent ? {
        systemPrompt: selectedAgent.system_prompt,
        agentId: selectedAgent.id,
        sessionId: sessionId // Pass session ID
      } : {};

      if (useStreaming && wsConnected) {
        // Add placeholder for streaming response
        setMessages((prev) => [...prev, { type: 'agent', content: '', streaming: true, agentName: selectedAgent?.name, agentId: selectedAgent?.id }]);

        wsServiceRef.current.streamAgent(userMessage, provider, options);
      } else {
        // Use regular API call
        const response = await agentAPI.executeAgent(userMessage, provider, options);
        setMessages((prev) => [
          ...prev,
          {
            type: 'agent',
            content: response.content,
            provider: response.provider,
            tokens: response.tokens_used,
            time: response.execution_time_ms,
            agentId: selectedAgent?.id,
            agentName: selectedAgent?.name,
          },
        ]);
        setLoading(false);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: 'error', content: `Error: ${error.message}` },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="agent-chat">
      <div className="chat-header">
        <div className="chat-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Agent Chat</h2>
          <div className="chat-controls">
            <div className="control-group">
              <label htmlFor="agent">Agent:</label>
              <select
                id="agent"
                value={selectedAgent?.id || ''}
                onChange={async (e) => {
                  const agentId = e.target.value;
                  try {
                    // Fetch full agent details (includes system_prompt)
                    const fullAgent = await agentAPI.getAgent(agentId);
                    setSelectedAgent(fullAgent);
                  } catch (error) {
                    console.error('Error loading agent details:', error);
                  }
                }}
                disabled={loading}
              >
                <option value="">Select an agent...</option>
                {agents.map((agent) => {
                  // Format name: "FirstInitial. LastName"
                  const formatAgentName = (fullName) => {
                    const parts = fullName.split(' ');
                    if (parts.length >= 2) {
                      return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
                    }
                    return fullName;
                  };

                  return (
                    <option key={agent.id} value={agent.id}>
                      {formatAgentName(agent.name)} ({agent.swarm_display_name || agent.swarm}) - {agent.title}
                    </option>
                  );
                })}
              </select>
              {selectedAgent && (
                <small className="agent-description">{selectedAgent.title}</small>
              )}
            </div>

            <div className="control-group">
              <label htmlFor="provider">Provider:</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={loading}
                style={{ width: '180px' }}
              >
                <option value="claude">Claude</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked && wsConnected)}
                  disabled={!wsConnected}
                />
                Real-time Streaming {wsConnected ? '(Connected)' : '(Disconnected)'}
              </label>
            </div>
          </div>
        </div>

        <div className="chat-header-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          {status && (
            <div className="status-info">
              <span className={`provider-badge ${status.providers.claude ? 'active' : 'inactive'}`}>
                Claude
              </span>
              <span className={`provider-badge ${status.providers.openai ? 'active' : 'inactive'}`}>
                OpenAI
              </span>
              <span className={`provider-badge ${status.providers.gemini ? 'active' : 'inactive'}`}>
                Gemini
              </span>
            </div>
          )}

          <div className="header-actions" style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexDirection: 'column', alignItems: 'flex-end' }}>
            <button
              className="theme-toggle"
              onClick={clearChat}
              title="Clear Chat History"
              style={{
                width: '180px',
                justifyContent: 'center',
                margin: 0,
                color: 'var(--error)',
                borderColor: 'var(--error)'
              }}
            >
              <span className="theme-label" style={{ color: 'var(--error)' }}>CLEAR CHAT</span>
            </button>

            {sessionId && Object.keys(sessionArtifacts).length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={() => setShowArtifacts(true)} style={{ marginTop: '0.5rem' }}>
                📄 View Artifacts
              </button>
            )}
          </div>
        </div>
      </div>

      <ArtifactViewer
        artifacts={sessionArtifacts}
        isOpen={showArtifacts}
        onClose={() => setShowArtifacts(false)}
      />

      {/* Show Griot questionnaire if selected agent is Griot */}
      {selectedAgent && selectedAgent.id === 'griot-000' && !griotActivationPlan && (
        <GriotQuestionnaire onComplete={handleGriotQuestionnaireComplete} />
      )}

      {/* Show activation plan after questionnaire */}
      {griotActivationPlan && (
        <div className="activation-plan-container">
          <div className="activation-header">
            <h2>Your Activation Plan</h2>
            <p className="griot-message">{griotActivationPlan.griot_message}</p>
          </div>

          <div className="swarms-list">
            <h3>Activated Teams:</h3>
            {griotActivationPlan.activated_swarms.map((swarm, idx) => (
              <div key={idx} className="swarm-item">
                <div className="swarm-info">
                  <h4>{swarm.name.replace('BluePads', '')}</h4>
                  <p>{swarm.reason}</p>
                  <small>{swarm.agent_count} agents ready to serve you</small>
                </div>
                <div className="swarm-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={async () => {
                      // Find first agent of this swarm and select them
                      const swarmAgent = agents.find(a =>
                        a.swarm === swarm.name ||
                        a.swarm.startsWith(swarm.name) ||
                        a.swarm.includes(swarm.name)
                      );

                      if (swarmAgent) {
                        try {
                          setLoading(true);
                          // Fetch full agent details (includes system_prompt)
                          const fullAgent = await agentAPI.getAgent(swarmAgent.id);
                          setSelectedAgent(fullAgent);
                          setGriotActivationPlan(null); // Clear plan to show chat
                          setMessages([]); // Clear previous messages

                          // TRIGGER HANDOFF
                          // We need to wait for state updates to propagate, but since we have fullAgent here,
                          // we can construct the options manually for the first call.

                          const handoffMessage = `[SYSTEM: The user has been handed off to you from the Griot. 
                          Session ID: ${sessionId}. 
                          Please acknowledge the activation plan and the user's context. 
                          Welcome them to the ${swarm.name} swarm and propose the first step of the engagement.]`;

                          // We need to call the API directly here because 'selectedAgent' state won't be updated yet
                          const options = {
                            systemPrompt: fullAgent.system_prompt,
                            agentId: fullAgent.id,
                            sessionId: sessionId
                          };

                          if (useStreaming && wsConnected) {
                            setMessages([{ type: 'agent', content: '', streaming: true, agentName: fullAgent.name, agentId: fullAgent.id }]);
                            wsServiceRef.current.streamAgent(handoffMessage, provider, options);
                          } else {
                            const response = await agentAPI.executeAgent(handoffMessage, provider, options);
                            setMessages([{
                              type: 'agent',
                              content: response.content,
                              provider: response.provider,
                              tokens: response.tokens_used,
                              time: response.execution_time_ms,
                              agentId: fullAgent.id,
                              agentName: fullAgent.name,
                            }]);
                            setLoading(false);
                          }

                        } catch (error) {
                          console.error('Error loading agent details:', error);
                          alert('Failed to load agent details. Please try again.');
                          setLoading(false);
                        }
                      } else {
                        alert(`No agents found for ${swarm.name}.`);
                      }
                    }}
                  >
                    Chat with Team
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="next-steps">
            <h3>Next Steps:</h3>
            <ol>
              {griotActivationPlan.next_steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              // Clear the activation plan to start over
              setGriotActivationPlan(null);
              setMessages([]);
              setSessionId(null);
            }}
          >
            Start New Session
          </button>
        </div>
      )}

      {/* Regular chat interface for non-Griot agents */}
      {(!selectedAgent || selectedAgent.id !== 'griot-000' || griotActivationPlan) && (
        <>
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="empty-state">
                <p>Start a conversation with an AI agent</p>
                <small>Select a provider and type your message below</small>
              </div>
            )}

            {messages.map((msg, index) => (
              <MessageDisplay key={index} message={msg} />
            ))}

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Waiting for response...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-form">
            <div className="input-wrapper">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="message-input"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="send-button"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}

      {/* Clear Chat Modal */}
      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Clear Chat History</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to clear the current chat history? This action cannot be undone.</p>
              <p>You can download your chat history before clearing.</p>
            </div>
            <div className="download-options">
              <button className="btn btn-outline btn-sm" onClick={() => downloadChat('json')}>
                Download JSON
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => downloadChat('md')}>
                Download Markdown
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowClearModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmClearChat} style={{ backgroundColor: 'var(--error)', color: 'white', border: 'none' }}>
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentChat;
