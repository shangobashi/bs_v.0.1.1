import React, { useState, useEffect } from 'react';
import '../styles/griot-questionnaire.css';

/**
 * GriotQuestionnaire Component - Ubuntu Glass Redesign
 *
 * Presents a multi-phase questionnaire in Griot's voice to collect user needs.
 * Uses a glassmorphism UI with deep "Ubuntu Connection" theming.
 */
function GriotQuestionnaire({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [answers, setAnswers] = useState({
    primaryNeed: null,
    organizationName: '',
    organizationSize: null,
    organizationStage: null,
    industry: '',
    currentSituation: '',
    secondaryNeeds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scroll to top on phase change
  useEffect(() => {
    const container = document.querySelector('.questionnaire-container');
    if (container) container.scrollTop = 0;
  }, [phase]);

  const primaryNeeds = [
    { id: 'wealth_management', label: 'Wealth Management & Financial Planning', swarm: 'BluePadsGrowth' },
    { id: 'software_development', label: 'Software Product Development', swarm: 'BluePadsLabs' },
    { id: 'legal_compliance', label: 'Legal & Compliance (SaaS Focused)', swarm: 'BluePadsLegal' },
    { id: 'marketing_growth', label: 'Marketing Agency', swarm: 'BluePadsVision' },
    { id: 'research_innovation', label: 'Research & Innovation', swarm: 'BluePadsResearch' },
  ];

  const organizationSizes = ['Startup', 'Small (10-50)', 'Mid-Market (50-500)', 'Enterprise (500+)'];
  const organizationStages = ['Pre-Launch', 'Early (0-2 years)', 'Growth (2-5 years)', 'Mature (5+ years)'];
  const secondaryNeedsList = [
    { id: 'legal', label: 'Legal & Compliance Support' },
    { id: 'marketing', label: 'Marketing & Growth Strategy' },
    { id: 'research', label: 'Research & Innovation' },
    { id: 'financial', label: 'Financial Planning' },
    { id: 'tech', label: 'Technical Development' },
  ];

  const handleNextPhase = () => {
    if (phase === 0 && !answers.primaryNeed) return setError('Please select your primary need to continue');
    if (phase === 1 && !answers.organizationName.trim()) return setError('Please enter your organization name');
    if (phase === 2 && (!answers.organizationSize || !answers.organizationStage || !answers.industry)) return setError('Please complete all organization profile fields');
    if (phase === 3 && !answers.currentSituation.trim()) return setError('Please describe your current situation');

    setError(null);
    if (phase < 5) setPhase(phase + 1);
    else submitQuestionnaire();
  };

  const handlePreviousPhase = () => {
    if (phase > 0) {
      setPhase(phase - 1);
      setError(null);
    }
  };

  const submitQuestionnaire = async () => {
    setLoading(true);
    try {
      const result = await import('../services/api').then(module =>
        module.default.submitGriotQuestionnaire({
          primary_need: answers.primaryNeed,
          organization_name: answers.organizationName,
          organization_size: answers.organizationSize,
          organization_stage: answers.organizationStage,
          industry: answers.industry,
          current_situation: answers.currentSituation,
          secondary_needs: answers.secondaryNeeds,
        })
      );
      if (onComplete) onComplete(result);
    } catch (err) {
      setError(`Error processing your responses: ${err.message}`);
      setLoading(false);
    }
  };

  const toggleSecondaryNeed = (needId) => {
    const updated = answers.secondaryNeeds.includes(needId)
      ? answers.secondaryNeeds.filter(id => id !== needId)
      : [...answers.secondaryNeeds, needId];
    setAnswers({ ...answers, secondaryNeeds: updated });
  };

  const renderPhase = () => {
    const primaryNeed = primaryNeeds.find(n => n.id === answers.primaryNeed);

    switch (phase) {
      case 0:
        return (
          <div className="griot-phase">
            <div className="phase-header">
              <h2>PHASE 1: WHAT BRINGS YOU HERE?</h2>
              <p className="phase-subtitle">Every journey begins with understanding the true need.</p>
            </div>
            <p className="griot-voice">
              "Look at these paths. Which one calls to you most strongly? I am here to guide you to the right team."
            </p>
            <div className="options-grid">
              {primaryNeeds.map((need) => (
                <div
                  key={need.id}
                  className={`option-card ${answers.primaryNeed === need.id ? 'selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, primaryNeed: need.id })}
                >
                  <input
                    type="radio"
                    name="primaryNeed"
                    checked={answers.primaryNeed === need.id}
                    onChange={() => { }}
                  />
                  <label>{need.label}</label>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="griot-phase">
            <div className="phase-header">
              <h2>PHASE 2: ORGANIZATION PROFILE</h2>
              <p className="phase-subtitle">Tell me about your organization.</p>
            </div>
            <p className="griot-voice">
              "To guide you well, I must understand the collective you serve. Who are you?"
            </p>
            <div className="form-group">
              <label htmlFor="orgName">Organization Name</label>
              <input
                id="orgName"
                type="text"
                placeholder="Your organization name"
                value={answers.organizationName}
                onChange={(e) => setAnswers({ ...answers, organizationName: e.target.value })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="industry">Industry or Sector</label>
              <input
                id="industry"
                type="text"
                placeholder="e.g., FinTech, Healthcare, E-commerce"
                value={answers.industry}
                onChange={(e) => setAnswers({ ...answers, industry: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="griot-phase">
            <div className="phase-header">
              <h2>PHASE 2 (cont.): SCALE & STAGE</h2>
              <p className="phase-subtitle">Help me understand your scale and stage.</p>
            </div>
            <div className="form-group">
              <label>Organization Size</label>
              <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {organizationSizes.map((size, idx) => (
                  <div
                    key={idx}
                    className={`option-card ${answers.organizationSize === size ? 'selected' : ''}`}
                    onClick={() => setAnswers({ ...answers, organizationSize: size })}
                  >
                    <input
                      type="radio"
                      name="size"
                      checked={answers.organizationSize === size}
                      onChange={() => { }}
                    />
                    <label>{size}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Organization Stage</label>
              <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {organizationStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`option-card ${answers.organizationStage === stage ? 'selected' : ''}`}
                    onClick={() => setAnswers({ ...answers, organizationStage: stage })}
                  >
                    <input
                      type="radio"
                      name="stage"
                      checked={answers.organizationStage === stage}
                      onChange={() => { }}
                    />
                    <label>{stage}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="griot-phase">
            <div className="phase-header">
              <h2>PHASE 3: SITUATION & OBJECTIVES</h2>
              <p className="phase-subtitle">What are you facing? What do you want to achieve?</p>
            </div>
            <p className="griot-voice">
              "I will tell you what I see, honestly and with care. Share the truth of your situation."
            </p>
            <div className="form-group">
              <label htmlFor="situation">Your Situation & Objectives</label>
              <textarea
                id="situation"
                placeholder="Describe your current situation, challenges, and what you want to achieve..."
                value={answers.currentSituation}
                onChange={(e) => setAnswers({ ...answers, currentSituation: e.target.value })}
                rows="6"
                autoFocus
              />
            </div>
            {primaryNeed && (
              <div className="info-box">
                <p>
                  Based on your primary need of <strong>{primaryNeed.label}</strong>,
                  I will be activating the <strong>{primaryNeed.swarm}</strong> team.
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="griot-phase">
            <div className="phase-header">
              <h2>PHASE 4: SECONDARY NEEDS</h2>
              <p className="phase-subtitle">Are there other areas where you need support?</p>
            </div>
            <p className="griot-voice">
              "Sometimes the journey requires more than one guide. Which other teams might serve you?"
            </p>
            <div className="options-list">
              {secondaryNeedsList.map((need) => (
                <label key={need.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={answers.secondaryNeeds.includes(need.id)}
                    onChange={() => toggleSecondaryNeed(need.id)}
                  />
                  <span>{need.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="griot-phase">
            <div className="phase-header">
              <h2>PHASE 5: CLOSING REFLECTION</h2>
              <p className="phase-subtitle">Let me show you the path forward.</p>
            </div>
            <div className="summary-box">
              <p className="griot-voice">
                "I have listened deeply and I understand your path. Let me guide you toward the teams best suited for your journey."
              </p>
              <div className="answer-summary">
                <h3>Your Answers:</h3>
                <div className="summary-item">
                  <strong>Primary Need</strong> {primaryNeeds.find(n => n.id === answers.primaryNeed)?.label}
                </div>
                <div className="summary-item">
                  <strong>Organization</strong> {answers.organizationName} ({answers.industry})
                </div>
                <div className="summary-item">
                  <strong>Size & Stage</strong> {answers.organizationSize} • {answers.organizationStage}
                </div>
                {answers.secondaryNeeds.length > 0 && (
                  <div className="summary-item">
                    <strong>Secondary Needs</strong> {answers.secondaryNeeds.join(', ')}
                  </div>
                )}
              </div>
              <p className="griot-final-message">
                "I am because we are" — Your choice is ultimately yours.
                I offer wisdom, not ultimatums. But I believe these teams
                walking the path with you will find the strength you seek.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const phaseNames = ['Primary Need', 'Organization', 'Scale', 'Situation', 'Secondary Needs', 'Summary'];

  return (
    <div className="griot-questionnaire">
      <div className="griot-banner">
        <h1>GRIOT</h1>
      </div>

      <div className="questionnaire-container">
        <div className="phase-indicator">
          {phaseNames.map((name, idx) => (
            <div
              key={idx}
              className={`phase-dot ${idx === phase ? 'active' : ''} ${idx < phase ? 'completed' : ''}`}
              title={name}
            >
              {idx < phase ? '✓' : idx + 1}
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="phase-content" key={phase}>
          {renderPhase()}
        </div>

        <div className="phase-buttons">
          <button
            className="btn btn-secondary"
            onClick={handlePreviousPhase}
            disabled={phase === 0}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNextPhase}
            disabled={loading}
          >
            {phase === 5 ? (loading ? 'Processing...' : 'Activate Swarms →') : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GriotQuestionnaire;
