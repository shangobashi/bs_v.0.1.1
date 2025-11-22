import React, { useState } from 'react';
import '../styles/griot-questionnaire.css';

/**
 * GriotQuestionnaire Component
 *
 * Presents a multi-phase questionnaire in Griot's voice to collect user needs,
 * organization info, and situation assessment. Routes users to appropriate swarms
 * based on their answers.
 */
function GriotQuestionnaire({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0-5 representing phases
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
    // Validation
    if (phase === 0 && !answers.primaryNeed) {
      setError('Please select your primary need to continue');
      return;
    }
    if (phase === 1 && !answers.organizationName.trim()) {
      setError('Please enter your organization name');
      return;
    }
    if (phase === 2 && (!answers.organizationSize || !answers.organizationStage || !answers.industry)) {
      setError('Please complete all organization profile fields');
      return;
    }
    if (phase === 3 && !answers.currentSituation.trim()) {
      setError('Please describe your current situation and objectives');
      return;
    }

    setError(null);

    if (phase < 5) {
      setPhase(phase + 1);
    } else {
      submitQuestionnaire();
    }
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
      // Use agentAPI service instead of direct fetch to handle base URL correctly
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

      // Call onComplete with activation plan
      if (onComplete) {
        onComplete(result);
      }
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
              Look at these paths. Which one calls to you most strongly?
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
                    value={need.id}
                    checked={answers.primaryNeed === need.id}
                    onChange={() => setAnswers({ ...answers, primaryNeed: need.id })}
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
              To guide you well, I must understand the organization you serve.
            </p>

            <div className="form-group">
              <label htmlFor="orgName">Organization Name</label>
              <input
                id="orgName"
                type="text"
                placeholder="Your organization name"
                value={answers.organizationName}
                onChange={(e) => setAnswers({ ...answers, organizationName: e.target.value })}
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
              <h2>PHASE 2 (cont.): ORGANIZATION SCALE</h2>
              <p className="phase-subtitle">Help me understand your scale and stage.</p>
            </div>

            <div className="form-group">
              <label>Organization Size</label>
              <div className="options-list">
                {organizationSizes.map((size, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input
                      type="radio"
                      name="size"
                      checked={answers.organizationSize === size}
                      onChange={() => setAnswers({ ...answers, organizationSize: size })}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Organization Stage</label>
              <div className="options-list">
                {organizationStages.map((stage, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input
                      type="radio"
                      name="stage"
                      checked={answers.organizationStage === stage}
                      onChange={() => setAnswers({ ...answers, organizationStage: stage })}
                    />
                    {stage}
                  </label>
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
              I will tell you what I see, honestly and with care. Share the truth of your situation.
            </p>

            <div className="form-group">
              <label htmlFor="situation">Your Situation & Objectives</label>
              <textarea
                id="situation"
                placeholder="Describe your current situation, challenges, and what you want to achieve. Be honest and detailed."
                value={answers.currentSituation}
                onChange={(e) => setAnswers({ ...answers, currentSituation: e.target.value })}
                rows="6"
              />
            </div>

            {primaryNeed && (
              <div className="info-box">
                <p>
                  Based on your primary need of <strong>{primaryNeed.label}</strong>,
                  I will be activating the <strong>{primaryNeed.swarm}</strong> team to support you.
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
              Sometimes the journey requires more than one guide. Which other teams might serve you?
            </p>

            <div className="options-list">
              {secondaryNeedsList.map((need) => (
                <label key={need.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={answers.secondaryNeeds.includes(need.id)}
                    onChange={() => toggleSecondaryNeed(need.id)}
                  />
                  {need.label}
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
                I have listened deeply and I understand your path. Let me guide you toward the teams best suited for your journey.
              </p>

              <div className="answer-summary">
                <h3>Your Answers:</h3>
                <div className="summary-item">
                  <strong>Primary Need:</strong> {primaryNeeds.find(n => n.id === answers.primaryNeed)?.label}
                </div>
                <div className="summary-item">
                  <strong>Organization:</strong> {answers.organizationName} ({answers.industry})
                </div>
                <div className="summary-item">
                  <strong>Size & Stage:</strong> {answers.organizationSize} • {answers.organizationStage}
                </div>
                {answers.secondaryNeeds.length > 0 && (
                  <div className="summary-item">
                    <strong>Secondary Needs:</strong> {answers.secondaryNeeds.join(', ')}
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
        <h1>GRIOT AWAKENS</h1>
        <p>Keeper of Stories · Guide of Paths · Bridge Between Wisdom and Innovation</p>
        <p className="ubuntu">"I am because we are" — Ubuntu Philosophy</p>
      </div>

      <div className="questionnaire-container">
        <div className="phase-indicator">
          {phaseNames.map((name, idx) => (
            <div
              key={idx}
              className={`phase-dot ${idx === phase ? 'active' : ''} ${idx < phase ? 'completed' : ''}`}
              title={name}
            >
              {idx + 1}
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="phase-content">
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
