import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import agentAPI from '../services/api';
import { formatAgentName } from '../utils/formatters';
import GlassCard from './Nova/GlassCard';
import NovaButton from './Nova/NovaButton';
import SidebarToggle from './Layout/SidebarToggle';
import '../styles/components.css';

function SwarmSelector() {
  const [swarms, setSwarms] = useState([]);
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedSwarm, setSelectedSwarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedAgentId, setExpandedAgentId] = useState(null);

  useEffect(() => {
    loadSwarms();
    loadAgents();
  }, []);

  const toggleAgent = (agentId) => {
    if (expandedAgentId === agentId) {
      setExpandedAgentId(null);
    } else {
      setExpandedAgentId(agentId);
    }
  };

  const loadSwarms = async () => {
    try {
      const data = await agentAPI.listSwarms();
      setSwarms(data.swarms);
      if (data.swarms.length > 0) {
        setSelectedSwarm(data.swarms[0]);
      }
    } catch (err) {
      setError(`Error loading swarms: ${err.message}`);
    }
  };

  const loadAgents = async () => {
    try {
      const agentsList = await agentAPI.listAgents();
      setAgents(agentsList);
    } catch (err) {
      setError(`Error loading agents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSwarmAgents = () => {
    if (!selectedSwarm) return [];

    const swarmName = selectedSwarm.name;
    const swarmDisplayName = selectedSwarm.display_name || "";

    return agents.filter((agent) => {
      if (!agent.swarm) return false;

      // 1. Exact match (Internal Name)
      if (agent.swarm === swarmName) return true;

      // 2. Exact match (Display Name - unlikely but possible fallback)
      if (agent.swarm === swarmDisplayName) return true;

      // 3. Normalized match (ignore case/whitespace)
      if (agent.swarm.trim().toLowerCase() === swarmName.trim().toLowerCase()) return true;

      // 4. Prefix match (for cases like "BluePadsLabs" matching "BluePadsLabs_AgentSwarm...")
      if (agent.swarm.startsWith(swarmName) || swarmName.startsWith(agent.swarm)) return true;

      return false;
    });
  };

  if (loading) {
    return (
      <div className="nova-container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div className="loading">Loading swarms and agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nova-container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
        <div className="error">{error}</div>
      </div>
    );
  }

  const swarmAgents = getSwarmAgents();

  return (
    <div className="nova-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem' }}>
        <SidebarToggle />
        <div className="selector-header" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#FFF' }}>BluePadsGlobal Swarms</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Explore specialized agent swarms</p>
        </div>
        <div style={{ width: '40px' }}></div> {/* Spacer for balance */}
      </div>

      <div className="swarms-section" style={{ marginBottom: '4rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Available Swarms ({swarms.length})</h3>
        <div className="swarms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {swarms.map((swarm) => (
            <GlassCard
              key={swarm.name}
              className={`swarm-card ${selectedSwarm?.name === swarm.name ? 'active' : ''}`}
              onClick={() => setSelectedSwarm(swarm)}
              style={{
                cursor: 'pointer',
                borderColor: selectedSwarm?.name === swarm.name ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                background: selectedSwarm?.name === swarm.name ? 'linear-gradient(145deg, rgba(255, 184, 0, 0.1) 0%, rgba(10, 10, 10, 0.8) 100%)' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.25rem', margin: 0, color: '#FFF' }}>{swarm.display_name || swarm.name}</h4>
                <span style={{
                  background: 'rgba(255,184,0,0.1)',
                  color: '#FFB800',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {swarm.agents} Agents
                </span>
              </div>

              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {swarm.specialty}
              </p>

              <div className="focus-areas" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {swarm.focus_areas.map((area) => (
                  <span key={area} className="focus-tag" style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {area}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {selectedSwarm && (
        <div className="agents-section">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
            {selectedSwarm.display_name || selectedSwarm.name} - Agents ({swarmAgents.length})
          </h3>
          <div className="agents-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {swarmAgents.length > 0 ? (
              swarmAgents.map((agent) => (
                <GlassCard
                  key={agent.id}
                  className={`agent-card ${expandedAgentId === agent.id ? 'expanded' : ''}`}
                  onClick={() => toggleAgent(agent.id)}
                  style={{
                    cursor: 'pointer',
                    gridColumn: expandedAgentId === agent.id ? '1 / -1' : 'auto',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="agent-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#FFF' }}>{formatAgentName(agent.name)}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{agent.id}</span>
                  </div>
                  <p style={{ color: '#FFB800', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{agent.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <strong>Specialization:</strong> {agent.specialization}
                  </p>

                  {expandedAgentId === agent.id ? (
                    <div className="agent-details" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h5 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Biography</h5>
                        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>{agent.biography || "No biography available."}</p>
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <h5 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Expertise</h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {agent.expertise_areas && agent.expertise_areas.length > 0 ? (
                            agent.expertise_areas.map(area => (
                              <span key={area} style={{
                                background: 'rgba(255,184,0,0.1)',
                                color: '#FFB800',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                border: '1px solid rgba(255,184,0,0.2)'
                              }}>{area}</span>
                            ))
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>General Professional</span>
                          )}
                        </div>
                      </div>

                      <NovaButton
                        variant="primary"
                        style={{ marginTop: '1rem' }}
                        onClick={() => navigate('/chat', { state: { agentId: agent.id } })}
                      >
                        Initiate Chat
                      </NovaButton>
                    </div>
                  ) : (
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Click to view details</span>
                    </div>
                  )}
                </GlassCard>
              ))
            ) : (
              <p className="no-agents" style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No agents found in this swarm</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SwarmSelector;
