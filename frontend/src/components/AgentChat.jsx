import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import agentAPI from '../services/api';
import WebSocketService from '../services/websocket';
import MessageDisplay from './MessageDisplay';
import NovaDropdown from './Nova/NovaDropdown';
import NovaButton from './Nova/NovaButton';
import GlassCard from './Nova/GlassCard';
import SidebarToggle from './Layout/SidebarToggle';
import NovaInput from './Nova/NovaInput';
import GriotQuestionnaire from './GriotQuestionnaire';
import ArtifactViewer from './ArtifactViewer';

const AgentChat = () => {

  const [provider, setProvider] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).provider || 'claude' : 'claude';
  });

  const [model, setModel] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).model || 'Claude Sonnet 4.5' : 'Claude Sonnet 4.5';
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_state');
    return saved ? JSON.parse(saved).messages || [] : [];
  });

  const [message, setMessage] = useState('');

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
  const [showSaveMenu, setShowSaveMenu] = useState(false);
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
      provider,
      model
    };
    localStorage.setItem('swarm_chat_state', JSON.stringify(stateToSave));
  }, [messages, selectedAgent, griotActivationPlan, sessionId, provider, model]);

  // Sync agentsRef with agents state
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.agentId && agents.length > 0) {
      const targetAgent = agents.find(a => a.id === location.state.agentId);
      if (targetAgent) {
        setSelectedAgent(targetAgent);
        // Clear the state to prevent re-selection on refresh if desired, 
        // but keeping it might be fine. 
        // Ideally, we just want to set it once when we enter.
        // For now, this dependency on agents ensures it runs when agents load.
      }
    }
  }, [location.state, agents]);

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

    // Small delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    setShowSaveMenu(false);
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
          content: `Delegating task to ${targetAgent.name} (${targetAgent.title})...`
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
        } else if (msg.type === 'thought' && msg.content) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.type === 'agent') {
              const newThoughts = (lastMsg.thoughts || '') + msg.content;
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  thoughts: newThoughts,
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
      let currentAgent = selectedAgent;

      // Safety check: Ensure we have the system prompt
      if (currentAgent && !currentAgent.system_prompt) {
        try {
          console.log("Fetching full agent details for execution...");
          currentAgent = await agentAPI.getAgent(currentAgent.id);
          setSelectedAgent(currentAgent); // Update state for future use
        } catch (error) {
          console.error("Failed to fetch full agent details during execution:", error);
        }
      }

      const options = currentAgent ? {
        systemPrompt: currentAgent.system_prompt,
        agentId: currentAgent.id,
        sessionId: sessionId,
        model: model
      } : { model: model };

      if (useStreaming && wsConnected) {
        // Add placeholder for streaming response
        setMessages((prev) => [...prev, { type: 'agent', content: '', thoughts: '', streaming: true, agentName: currentAgent?.name, agentId: currentAgent?.id }]);

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
    <div className="nova-chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', padding: '2rem' }}>
      {/* Header Section */}
      <GlassCard className="chat-header" style={{ padding: '1rem 2rem', position: 'relative', zIndex: 50 }}>
        <div className="chat-header-content">
          <div className="chat-header-left">
            <SidebarToggle />
            <div className="agent-select-container">
              <NovaDropdown
                value={selectedAgent ? selectedAgent.id : ''}
                placeholder="Select an Agent"
                style={{
                  height: '26px',
                  fontSize: '0.75rem',
                  padding: '0 10px'
                }}
                options={agents.map(agent => {
                  // Helper to format agent name sparsely
                  const formatAgentName = (name) => {
                    if (!name) return '';
                    let formatted = name;
                    formatted = formatted.replace(/BluePadsResearch_AgentSwarm_ClaudeCLI/g, 'BP Research');
                    formatted = formatted.replace(/BluePadsGrowth_AgentSwarm_ClaudeCLI/g, 'BP Growth');
                    formatted = formatted.replace(/BluePadsGlobal/g, 'BP Global');

                    const nameParts = formatted.split(' ');
                    if (nameParts.length > 1 && !nameParts[0].includes('.')) {
                      formatted = `${nameParts[0][0]}.${nameParts.slice(1).join(' ')}`;
                    }
                    return formatted;
                  };

                  const formatSwarmName = (swarm) => {
                    if (!swarm) return '';
                    let formatted = swarm;
                    if (formatted.includes('BluePadsResearch')) return 'BP Research';
                    if (formatted.includes('BluePadsGrowth')) return 'BP Growth';
                    if (formatted.includes('BluePadsLabs')) return 'BP Labs';
                    if (formatted.includes('BluePadsVision')) return 'BP Vision';
                    if (formatted.includes('BluePadsLegal')) return 'BP Legal';
                    if (formatted.includes('BluePadsGlobal')) return 'BP Global';
                    formatted = formatted.replace(/_AgentSwarm_/g, ' ');
                    formatted = formatted.replace(/_/g, ' ');
                    return formatted;
                  }

                  let displayName = formatAgentName(agent.name);
                  const swarmName = agent.swarm ? `(${formatSwarmName(agent.swarm)})` : '';
                  const title = agent.role || agent.title ? ` - ${agent.role || agent.title} ` : '';

                  let fullLabel = `${displayName} ${swarmName}${title} `;
                  fullLabel = fullLabel.replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();

                  if (fullLabel.length > 60) fullLabel = fullLabel.substring(0, 57) + '...';

                  return { value: agent.id, label: fullLabel };
                })}
                onChange={async (agentId) => {
                  const basicAgent = agents.find(a => a.id === agentId);
                  setSelectedAgent(basicAgent);
                  try {
                    const fullAgent = await agentAPI.getAgent(agentId);
                    setSelectedAgent(fullAgent);
                  } catch (error) {
                    console.error("Failed to fetch full agent details:", error);
                  }
                }}
              />
            </div>

            {status && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(status.providers).map(([name, active]) => (
                  <span key={name} style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: active ? 'rgba(0, 255, 148, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#00FF94' : 'var(--text-muted)',
                    border: active ? '1px solid rgba(0, 255, 148, 0.2)' : 'none',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {name.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="chat-header-right">
            <label style={{
              fontSize: '0.8rem',
              color: wsConnected ? 'var(--text-secondary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: wsConnected ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              background: wsConnected ? 'rgba(255, 184, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              border: wsConnected ? '1px solid rgba(255, 184, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.3s ease'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: wsConnected ? '#00FF94' : '#FF4B4B',
                boxShadow: wsConnected ? '0 0 8px #00FF94' : 'none'
              }}></span>
              Streaming
              <div style={{
                width: '32px',
                height: '18px',
                background: useStreaming ? 'rgba(255,184,0,0.3)' : 'rgba(255,255,255,0.1)',
                borderRadius: '9px',
                position: 'relative',
                border: useStreaming ? '1px solid rgba(255,184,0,0.5)' : '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked && wsConnected)}
                  disabled={!wsConnected}
                  style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', cursor: wsConnected ? 'pointer' : 'not-allowed' }}
                />
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: useStreaming ? '#FFB800' : 'rgba(255,255,255,0.5)',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: useStreaming ? '16px' : '2px',
                  transition: 'left 0.3s ease'
                }} />
              </div>
            </label>

            <div style={{ width: '220px' }}>
              <NovaDropdown
                value={model}
                onChange={(val) => {
                  setModel(val);
                  const v = val.toLowerCase();
                  // Auto-set provider based on model
                  if (v.includes('claude')) setProvider('claude');
                  else if (v.includes('gpt-5') || v.includes('gpt-4')) setProvider('openai');
                  else if (v.includes('gemini')) setProvider('gemini');
                  else if (v.includes('gpt-oss')) setProvider('openrouter');
                  else if (v.includes('moonshotai') || v.includes('kimi')) setProvider('openrouter');
                  else if (v.includes('qwen') || v.includes('deepseek') || v.includes('llama')) {
                    if (v.includes('/') || v.includes(':free')) {
                      setProvider('openrouter');
                    } else {
                      setProvider('ollama');
                    }
                  }
                }}
                options={[
                  { value: 'Claude Opus 4.5', label: 'Claude Opus 4.5' },
                  { value: 'Claude Sonnet 4.5', label: 'Claude Sonnet 4.5' },
                  { value: 'Claude Haiku 4.5', label: 'Claude Haiku 4.5' },
                  { value: 'GPT-5.2 Thinking', label: 'GPT-5.2 Thinking' },
                  { value: 'GPT-5.2 Instant', label: 'GPT-5.2 Instant' },
                  { value: 'GPT-5.2 Codex', label: 'GPT-5.2 Codex' },
                  { value: 'GPT-4.5', label: 'GPT-4.5' },
                  { value: 'Gemini 3 Flash', label: 'Gemini 3 Flash' },
                  { value: 'Gemini 3 Pro', label: 'Gemini 3 Pro' },
                  { value: 'Gemini 3 Deep Think', label: 'Gemini 3 Deep Think' },
                  { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (Free)' },
                  { value: 'qwen/qwen-2.5-coder-32b-instruct', label: 'Qwen 2.5 Coder 32B' },
                  { value: 'moonshotai/kimi-k2:free', label: 'Kimi K2 (Free)' },
                  { value: 'qwen2', label: 'Qwen 2 (Local)' },
                  { value: 'deepseek-coder-v2', label: 'Deepseek Coder V2 (Local)' },
                  { value: 'llama3', label: 'Llama 3 (Local)' }
                ]}
                style={{ height: '42px' }}
              />
            </div>


            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <NovaButton
                  variant="ghost"
                  onClick={() => setShowSaveMenu(!showSaveMenu)}
                  title="Save Chat Options"
                  style={{
                    minWidth: 'auto',
                    height: '42px',
                    padding: '0 1.2rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Save Chat ▾
                </NovaButton>

                {showSaveMenu && (
                  <GlassCard style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 1000,
                    minWidth: '160px',
                    background: 'rgba(20, 20, 20, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}>
                    <NovaButton
                      variant="ghost"
                      onClick={() => { downloadChat('json'); setShowSaveMenu(false); }}
                      style={{ justifyContent: 'flex-start', padding: '0.5rem', fontSize: '0.9rem' }}
                    >
                      As JSON
                    </NovaButton>
                    <NovaButton
                      variant="ghost"
                      onClick={() => { downloadChat('md'); setShowSaveMenu(false); }}
                      style={{ justifyContent: 'flex-start', padding: '0.5rem', fontSize: '0.9rem' }}
                    >
                      As Markdown
                    </NovaButton>
                  </GlassCard>
                )}
              </div>

              <NovaButton
                variant="ghost"
                onClick={clearChat}
                title="Clear Chat"
                style={{
                  minWidth: 'auto',
                  height: '42px',
                  padding: '0 1.2rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Clear
              </NovaButton>
            </div>

            {sessionId && Object.keys(sessionArtifacts).length > 0 && (
              <NovaButton variant="ghost" onClick={() => setShowArtifacts(true)} style={{ minWidth: 'auto', padding: '0.6rem 1.2rem' }}>
                Artifacts
              </NovaButton>
            )}
          </div>
        </div>
      </GlassCard >

      <ArtifactViewer
        artifacts={sessionArtifacts}
        isOpen={showArtifacts}
        onClose={() => setShowArtifacts(false)}
      />

      {/* Main Chat Area */}
      <GlassCard className="chat-area" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Griot / Activation Plan Logic */}
        {selectedAgent && selectedAgent.id === 'griot-000' && !griotActivationPlan && (
          <div style={{ padding: '2rem', overflowY: 'auto' }}>
            <GriotQuestionnaire onComplete={handleGriotQuestionnaireComplete} />
          </div>
        )}

        {griotActivationPlan && (
          <div style={{ padding: '2rem', overflowY: 'auto' }}>
            {/* Simplified Activation Plan View for Nova */}
            <h2 style={{ color: '#FFF', marginBottom: '1rem' }}>Activation Plan</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{griotActivationPlan.griot_message}</p>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              {griotActivationPlan.activated_swarms.map((swarm, idx) => (
                <GlassCard key={idx} style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h4 style={{ color: '#FFB800', marginBottom: '0.5rem' }}>{swarm.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{swarm.reason}</p>
                  <NovaButton variant="primary" onClick={() => {/* Logic from original */ }} style={{ marginTop: '1rem' }}>
                    Chat with Team
                  </NovaButton>
                </GlassCard>
              ))}
            </div>
            <NovaButton style={{ marginTop: '2rem' }} onClick={() => {
              setGriotActivationPlan(null);
              setMessages([]);
              setSessionId(null);
            }}>Start New Session</NovaButton>
          </div>
        )}

        {/* Standard Chat Messages */}
        {(!selectedAgent || selectedAgent.id !== 'griot-000' || griotActivationPlan) && (
          <>
            <div className="messages-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '10%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <p>Select an Agent to begin.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <MessageDisplay key={index} message={msg} />
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#FFB800', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area" style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <NovaInput
                  multiline
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <NovaButton type="submit" variant="primary" disabled={loading || !message.trim()} style={{ minWidth: '100px' }}>
                  Send
                </NovaButton>
              </form>
            </div>
          </>
        )}
      </GlassCard>

      {/* Clear Modal (Simplified) */}
      {
        showClearModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <GlassCard style={{ width: '400px', padding: '2rem' }}>
              <h3 style={{ color: '#FFF', marginBottom: '0.5rem' }}>Clear History?</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This cannot be undone.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <NovaButton variant="ghost" onClick={() => setShowClearModal(false)}>Cancel</NovaButton>
                <NovaButton onClick={confirmClearChat} style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }}>Clear</NovaButton>
              </div>
            </GlassCard>
          </div>
        )
      }
    </div >
  );
}

export default AgentChat;

