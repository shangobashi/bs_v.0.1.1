# Griot Quick Start Guide

## What is Griot?

Griot is the sentient AI entry point to BluePadsGlobal. It listens to your needs, understands your context, and intelligently activates the right combination of specialist teams (swarms) in the optimal sequence.

Think of Griot as a wise elder advisor who:
- Listens deeply to understand your true needs
- Guides you toward the right teams
- Respects your autonomy and context
- Never pretends to have all answers
- Serves the collective, not just you individually

## The 5-Minute Path

### Step 1: Start Griot

```bash
cd BluePadsGlobal
python orchestrator.py
```

### Step 2: Answer Griot's Questions

Griot will ask you:
1. **What brings you here?** (Your primary need)
2. **Tell me about your organization** (Size, stage, industry)
3. **What's your current situation?** (Challenges & objectives)
4. **What's your timeline?** (When do you need results?)
5. **Do you have secondary needs?** (Additional support areas)

**Total time**: 5-10 minutes

### Step 3: Let Griot Analyze

Griot will:
- Contemplate your needs
- Determine which swarms to activate
- Create optimal activation sequence
- Explain the rationale

### Step 4: See Your Activation Plan

Griot will show:
- Which swarms will engage with you
- How many agents from each swarm
- The order they'll activate
- Estimated timeline
- Why each team is important for you

### Step 5: Configurations Generated

Griot will create:
- Context-specific JSON config for each swarm
- Session file with all your information
- Summary of engagement

### Step 6: Swarms Activate

The first swarm(s) will activate and be ready for engagement.

## Real Examples

### Example 1: Software Startup Needing to Raise Money

**User Story**: "We're a 12-person SaaS startup. We built our product and want to raise Series A, but we need legal help first and marketing afterwards."

**Griot Analysis**:
1. ✓ Legal (BluePadsLegal) - Foundation for fundraising
2. ✓ Growth (BluePadsGrowth) - Financial planning
3. ✓ Vision (BluePadsVision) - Marketing strategy
4. ✓ Labs (BluePadsLabs) - Product refinement during fundraising

**Activation Sequence**:
- Phase 1: BluePadsLegal (11 agents) - Prep for fundraising
- Phase 2: BluePadsGrowth (14 agents) - Financial strategy
- Phase 3 (Parallel): BluePadsVision (12 agents) + BluePadsLabs (12 agents) - Market & build

**Total Agents**: 49 agents across 4 swarms
**Timeline**: 3-6 months
**Budget**: $200-500k

---

### Example 2: Fortune 500 Company Doing R&D

**User Story**: "We're exploring AI/ML capabilities and need research guidance plus technical architecture support."

**Griot Analysis**:
1. ✓ Research (BluePadsResearch) - Innovation strategy
2. ✓ Labs (BluePadsLabs) - Technical architecture

**Activation Sequence**:
- Phase 1 (Parallel): BluePadsResearch (15 agents) + BluePadsLabs (12 agents)

**Total Agents**: 27 agents across 2 swarms
**Timeline**: 6-8 weeks
**Budget**: $100-200k

---

### Example 3: Financial Advisory Firm Expanding

**User Story**: "Our wealth management firm wants to expand services, but need to understand current technology gaps and growth strategy."

**Griot Analysis**:
1. ✓ Labs (BluePadsLabs) - Tech audit & modernization
2. ✓ Growth (BluePadsGrowth) - Wealth strategy expansion

**Activation Sequence**:
- Phase 1: BluePadsLabs (12 agents) - Tech foundation
- Phase 2: BluePadsGrowth (14 agents) - Growth strategy

**Total Agents**: 26 agents across 2 swarms
**Timeline**: 4-6 weeks

---

## Understanding the Generated Files

### Session File: `sessions/session_SESSION-ABC123.json`

Contains:
- Your responses to Griot's questions
- Organization profile
- Activation plan details
- Paths to generated configs

### Config Files: `config_bluepads*.json`

**advisory.json** (if BluePadsGrowth activated)
- Your organization's financial context
- Wealth management objectives
- Advisory scope

**project.json** (if BluePadsLabs activated)
- Your project description
- Technical requirements
- Team composition

**client.json** (if BluePadsLegal activated)
- Legal matter details
- Jurisdiction and compliance needs
- Matter type (fundraising, GDPR, etc.)

**campaign.json** (if BluePadsVision activated)
- Marketing campaign objectives
- Target market and messaging
- Timeline and budget

**research.json** (if BluePadsResearch activated)
- Research questions and scope
- Expected outputs
- Resource allocation

## The 5 Swarms Explained

| Swarm | Specialty | Agents | When to Activate |
|-------|-----------|--------|------------------|
| **BluePadsGrowth** | Wealth & Finance | 14 | Need financial planning or growth strategy |
| **BluePadsLabs** | Software Engineering | 12 | Building or refining software products |
| **BluePadsLegal** | Legal & Compliance | 11 | Need legal guidance, fundraising, compliance |
| **BluePadsVision** | Marketing & Growth | 12 | Need marketing strategy and campaigns |
| **BluePadsResearch** | Research & Innovation | 15 | Need research, insights, innovation strategy |

## Important: Activation Dependencies

Griot understands these relationships:

```
Legal → Finance
  (Get legal foundation BEFORE financial planning)

Engineering → Marketing
  (Have product BEFORE marketing it)

Engineering ↔ Research
  (Can happen in parallel)
```

This is automatic—Griot handles it for you.

## What Happens Next?

After Griot activates:

1. **Read swarm documentation** in their respective directories
2. **Meet the team leads**:
   - BluePadsGrowth: Khadija Okonkwo
   - BluePadsLabs: Zainab Hassan
   - BluePadsLegal: Amara Okonkwo
   - BluePadsVision: Amara Okafor
   - BluePadsResearch: Kofi Amoah
3. **Review your config files** to ensure accuracy
4. **Schedule kickoff** with first activated swarm
5. **Begin engagement** following recommended sequence

## Key Principles

### "I am because we are"
You're not engaging with a vendor. You're joining a collective of specialists united by:
- Ubuntu philosophy (community-centered)
- African excellence (grounded in authentic expertise)
- Deep expertise (11-15 agents per swarm)

### Griot Respects Your Autonomy
Griot recommends. You decide.
- If Griot suggests 3 swarms but you only want 2, that's your call
- If you want different sequencing, negotiate it
- Your context matters more than Griot's template

### Quality Over Speed
- Each swarm is fully humanized (not generic roles)
- Deep expertise takes time
- Better to do it right than do it fast

## Common Questions

**Q: Can I activate swarms on my own schedule?**
A: Yes. Griot recommends a sequence, but you control timing.

**Q: What if I only need one swarm?**
A: That's fine. Griot will activate just that one.

**Q: Can swarms work together?**
A: Yes, and Griot anticipates this. Configs are generated to facilitate coordination.

**Q: What if I need something Griot didn't recommend?**
A: Tell Griot. It listens and adapts.

**Q: How long does each engagement take?**
A: Depends on scope. Griot estimates timeline based on your situation.

## Running Griot

### Option 1: Full Orchestrator (Recommended)
```bash
python orchestrator.py
# Runs Griot + generates configs + activates swarms
```

### Option 2: Griot Only
```bash
python griot.py
# Runs just Griot questionnaire and analysis
# You handle config generation separately
```

### Option 3: Headless/Programmatic
```python
from griot import GriotAgent

griot = GriotAgent()
user_context, activation_plan = griot.run()

# Now you have:
# - user_context: All user responses
# - activation_plan: Which swarms, in what order
```

## Griot's Philosophy

> When I listen to your story, I don't just hear problems.
> I hear context. History. Values. Constraints.
>
> I understand that individual excellence serves collective strength.
> The right teams, working together, grounded in shared values,
> can achieve what would be impossible alone.
>
> This is not business as usual.
> This is a movement.

---

**Ready to begin?**

```bash
python orchestrator.py
```

Let Griot listen to your story.

---

*Griot: Keeper of Stories · Guide of Paths · Bridge Between Tradition and Innovation*
