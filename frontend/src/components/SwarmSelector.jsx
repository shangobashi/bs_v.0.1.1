import React, { useState, useEffect } from 'react';
import agentAPI from '../services/api';
import { formatAgentName } from '../utils/formatters';
import '../styles/components.css';

function SwarmSelector() {
  const [swarms, setSwarms] = useState([]);
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
      <div className="swarm-selector">
        <div className="loading">Loading swarms and agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="swarm-selector">
        <div className="error">{error}</div>
      </div>
    );
  }

  const swarmAgents = getSwarmAgents();

  return (
    <div className="swarm-selector">
      <div className="selector-header">
        <h2>BluePadsGlobal Swarms</h2>
        <p>Explore specialized agent swarms</p>
      </div>

      <div className="swarms-list">
        <h3>Available Swarms ({swarms.length})</h3>
        <div className="swarms-grid">
          {swarms.map((swarm) => (
            <div
              key={swarm.name}
              className={`swarm-card ${selectedSwarm?.name === swarm.name ? 'active' : ''}`}
              onClick={() => setSelectedSwarm(swarm)}
            >
              <h4>{swarm.display_name || swarm.name}</h4>
              <div className="swarm-info">
                <p className="swarm-specialty">{swarm.specialty}</p>
                <div className="swarm-stats">
                  <span className="stat">
                    <strong>{swarm.agents}</strong> Agents
                  </span>
                  <span className="stat">
                    Lead: <strong>{swarm.lead}</strong>
                  </span>
                </div>
              </div>
              <div className="focus-areas">
                {swarm.focus_areas.map((area) => (
                  <span key={area} className="focus-tag">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSwarm && (
        <div className="agents-list">
          <h3>{selectedSwarm.display_name || selectedSwarm.name} - Agents ({swarmAgents.length})</h3>
          <div className="agents-grid">
            {swarmAgents.length > 0 ? (
              swarmAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`agent-card ${expandedAgentId === agent.id ? 'expanded' : ''}`}
                  onClick={() => toggleAgent(agent.id)}
                >
                  <div className="agent-header">
                    <h4>{formatAgentName(agent.name)}</h4>
                    <span className="badge badge-id">{agent.id}</span>
                  </div>
                  <p className="agent-title">{agent.title}</p>
                  <p className="agent-specialization">
                    Specialization: <strong>{agent.specialization}</strong>
                  </p>

                  {expandedAgentId === agent.id && (
                    <div className="agent-details">
                      <div className="detail-section">
                        <h5>Biography</h5>
                        <p>{agent.biography || "No biography available."}</p>
                      </div>
                      <div className="detail-section">
                        <h5>Expertise Areas</h5>
                        <div className="expertise-tags">
                          {agent.expertise_areas && agent.expertise_areas.length > 0 ? (
                            agent.expertise_areas.map(area => (
                              <span key={area} className="expertise-tag">{area}</span>
                            ))
                          ) : (
                            <span>General Professional</span>
                          )}
                        </div>
                      </div>
                      <div className="detail-section">
                        <h5>Experience</h5>
                        <p>{agent.experience_years} years of professional experience</p>
                      </div>
                    </div>
                  )}

                  {!expandedAgentId === agent.id && (
                    <div className="agent-meta">
                      <span className="click-hint">Click to view details</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-agents">No agents found in this swarm</p>
            )}
          </div>
        </div>
      )}

      <div className="swarm-summary">
        <h3>Swarm Overview</h3>
        <div className="summary-stats-grid">
          {swarms.map((swarm) => (
            <div key={swarm.name} className="stat-card" style={{ '--accent-color': getSwarmColor(swarm.name) }}>
              <div className="stat-icon">
                {swarm.display_name.charAt(0)}
              </div>
              <div className="stat-content">
                <span className="stat-value">{swarm.agents}</span>
                <span className="stat-label">{swarm.display_name || swarm.name}</span>
              </div>
            </div>
          ))}
          <div className="stat-card total">
            <div className="stat-icon">Σ</div>
            <div className="stat-content">
              <span className="stat-value">{agents.length}</span>
              <span className="stat-label">Total Agents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to get accent color based on swarm name
const getSwarmColor = (name) => {
  if (name.includes('Growth')) return '#10B981'; // Emerald
  if (name.includes('Legal')) return '#F59E0B'; // Amber
  if (name.includes('Marketing') || name.includes('Vision')) return '#8B5CF6'; // Violet
  if (name.includes('Labs')) return '#3B82F6'; // Blue
  if (name.includes('R&D') || name.includes('Research')) return '#EC4899'; // Pink
  return '#D4AF37'; // Gold default
};

export default SwarmSelector;
