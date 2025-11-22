# BluePadsGlobal Quick Start Reference

**Fast activation guide for Claude Code users**

*Use this when you need to quickly load agents without reading full documentation*

---

## 30-Second Quick Start

```bash
cd C:\Users\Shango\documents\code\BluePadsGlobal
python orchestrator.py
```

Done. Griot will guide you from there.

---

## The 5 Swarms (What Each Does)

| Swarm | Agents | Use When | Lead |
|-------|--------|----------|------|
| **Growth** | 14 | Need: finance, wealth, investments | Khadija Okonkwo |
| **Labs** | 12 | Need: software, engineering, architecture | Zainab Hassan |
| **Legal** | 11 | Need: legal, compliance, GDPR, fundraising | Amara Okonkwo |
| **Vision** | 12 | Need: marketing, brand, growth campaigns | Amara Okafor |
| **Research** | 15 | Need: research, AI/ML, blockchain, innovation | Kofi Amoah |

**Total: 64 agents**

---

## Direct Swarm Activation (Skip Questionnaire)

If you know exactly which swarm you need:

### To Activate BluePadsLabs Only
```bash
python griot.py
# When prompted, say: "I need software engineering help"
```

### To Activate BluePadsGrowth Only
```bash
python griot.py
# When prompted, say: "I need financial planning"
```

### To Activate BluePadsLegal Only
```bash
python griot.py
# When prompted, say: "I need legal guidance"
```

### To Activate Multiple (Griot Decides Sequence)
```bash
python orchestrator.py
# Answer Griot's 5 questions thoroughly
# System activates optimal combination
```

---

## Griot's 5 Key Questions

When you run `python orchestrator.py`, Griot will ask:

1. **What brings you here?**
   - Your primary need (e.g., "software development", "fundraising")

2. **Tell me about your organization**
   - Size, stage, industry, focus

3. **What are you facing right now?**
   - Challenges, objectives, constraints

4. **What's your timeline?**
   - Urgency level, deadline

5. **Any secondary needs?**
   - Additional areas you need support

**Total time: 5-10 minutes**

---

## Typical Activation Scenarios

### Scenario 1: Startup Raising Series A
```
Griot activates:
1. BluePadsLegal (legal foundation)
2. BluePadsGrowth (financial planning)
3. Parallel: BluePadsVision + BluePadsLabs

Agents engaged: 49
Timeline: 3-6 months
```

### Scenario 2: Building a Product
```
Griot activates:
1. BluePadsLabs (engineering)
2. Later: BluePadsVision (when ready to market)

Agents engaged: 12-24
Timeline: 6-8 weeks
```

### Scenario 3: AI/ML Research
```
Griot activates:
- BluePadsResearch (research)
- BluePadsLabs (parallel, architecture)

Agents engaged: 27
Timeline: 6-8 weeks
```

### Scenario 4: Scaling Wealth Services
```
Griot activates:
1. BluePadsLabs (tech modernization)
2. BluePadsGrowth (growth strategy)

Agents engaged: 26
Timeline: 4-6 weeks
```

---

## Top 10 Agents by Role

### Leadership
- Khadija Okonkwo (Growth CEO) - Financial vision
- Zainab Hassan (Labs Lead) - Technical architecture
- Amara Okonkwo (Legal Partner) - Legal strategy
- Amara Okafor (Vision Director) - Marketing strategy
- Kofi Amoah (Research Director) - Research vision

### Engineering
- Kwame Owusu (Senior Backend)
- Ama Osei (Senior Frontend)
- Jabari Kipchoge (Mobile)
- Mandela Sokhela (Design Systems)
- Tunde Adeyemi (Security)

### Specialized Expertise
- Aminata Diallo (Financial Planning)
- Zainab H. (Privacy/Data Protection)
- Nia Okafor (AI/ML Research)
- Jamal Al-Rashid (Blockchain)
- Jake Mensah (Copywriting)

---

## Generated Files

After Griot runs, you'll find:

```
BluePadsGlobal/
├── sessions/
│   └── session_SESSION-ABC123.json      ← Your session record
├── config_bluepadsgrowth.json           ← If Growth activated
├── config_bluepadslabs.json             ← If Labs activated
├── config_bluepadslegal.json            ← If Legal activated
├── config_bluepadsvision.json           ← If Vision activated
└── config_bluepadsresearch.json         ← If Research activated
```

---

## Griot's Core Commands

| Command | What It Does |
|---------|-------------|
| `python orchestrator.py` | Full flow: questions → analysis → activation |
| `python griot.py` | Questionnaire only (no activation) |
| `python orchestrator.py --session SESSION-ID` | Resume previous session |

---

## Agent Contact Info

Once a swarm is activated, you'll receive:
- **Team lead contact** (e.g., Zainab Hassan for Labs)
- **Config file** with your context pre-loaded
- **Team roster** with all agent specialties
- **Engagement timeline** and next steps

---

## Common Use Cases → Recommended Swarms

| Need | Primary Swarm | Secondary | Timeline |
|------|---------------|-----------|----------|
| Build software | **Labs** | - | 6-8 weeks |
| Raise funding | **Legal** | Growth | 3-6 months |
| Scale business | **Growth** | Labs | 4-6 weeks |
| Market product | **Vision** | Labs | 3-4 weeks |
| Research/R&D | **Research** | Labs | 6-8 weeks |
| Legal compliance | **Legal** | - | 2-4 weeks |
| Technical audit | **Labs** | Growth | 3-4 weeks |

---

## Troubleshooting

**Q: "Which swarm do I need?"**
A: Run `python orchestrator.py` and answer Griot's questions. The system analyzes your needs and recommends the right combination.

**Q: "Can I activate multiple swarms?"**
A: Yes. Griot will activate 1-4 swarms in optimal sequence. Some can run in parallel.

**Q: "What if I only need one swarm?"**
A: That's fine. Just tell Griot which one. The system respects your autonomy.

**Q: "How long does engagement take?"**
A: Depends on scope. 2 weeks to 6 months, depending on your situation.

**Q: "Can I switch swarms mid-engagement?"**
A: Yes. You can activate additional swarms or modify your plan anytime.

---

## The "I am because we are" Philosophy

BluePadsGlobal operates on Ubuntu:
- Individual excellence serves collective strength
- Agents collaborate, not compete
- Success is shared
- Community impact matters

When you engage, you're not just hiring experts. You're joining a network of 64 humanized professionals committed to your collective success.

---

## Next Steps After Activation

1. **Review your config file** (e.g., `config_bluepadslabs.json`)
2. **Meet your team lead** (person leading the swarm)
3. **Review team roster** (all agents in your activated swarms)
4. **Define engagement** (specific deliverables and timeline)
5. **Begin work** (follow recommended sequence)

---

## Key Documents

| Document | Use When |
|----------|----------|
| **This file** | You need a quick refresh |
| `BLUEPADSGLOBAL_CLAUDE_CODE_INTEGRATION.md` | You want detailed integration guide |
| `AGENT_INVENTORY_MASTER.md` | You need info on all 64 agents |
| `NEXT_SESSION_QUICK_LOAD.md` | You're doing this again next time |
| Swarm README files | You want swarm-specific details |

---

## Running Griot Right Now

```bash
# Navigate to BluePadsGlobal
cd C:\Users\Shango\documents\code\BluePadsGlobal

# Run the orchestrator
python orchestrator.py

# Follow Griot's conversation
# Answer the 5 questions
# Let Griot guide you to the right teams
# Done!
```

---

## Remember

- **Griot listens first**: Not a transactional system, genuine understanding
- **Config files matter**: Your context is embedded in every activation
- **Dependencies are respected**: Legal before Finance, Engineering before Marketing
- **You're in control**: Griot recommends, you decide
- **Ubuntu in action**: Individual excellence + collective strength

---

**Ready?**

```bash
python orchestrator.py
```

Let Griot listen to your story.

---

*BluePadsGlobal: Global Excellence, African Values, Ubuntu Philosophy*

*64 agents. 5 swarms. Your success.*
