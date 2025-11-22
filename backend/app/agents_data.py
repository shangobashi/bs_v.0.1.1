"""
BluePadsGlobal Agent Profiles
Dynamically loaded from BluePadsGlobal markdown files
"""

import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
import app.agents_loader
print(f"DEBUG: AgentLoader loaded from: {app.agents_loader.__file__}")
from app.agents_loader import AgentLoader

logger = logging.getLogger(__name__)


# Initialize agent loader
def _initialize_agents() -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Initialize and load all agents from BluePadsGlobal directories"""
    print("DEBUG: agents_data.py _initialize_agents called - RELOADING AGENTS")
    try:
        # Get the agents directory
        current_dir = Path(__file__).parent.parent
        agents_dir = str(current_dir / "agents")

        # Create loader and load all agents
        loader = AgentLoader(agents_dir)
        agents = loader.load_all_agents()

        # Debug: Check what agents were loaded
        print(f"DEBUG agents_data.py: load_all_agents() returned {len(agents)} agents")
        swarm_counts = {}
        for agent in agents:
            swarm = agent.get('swarm', 'UNKNOWN')
            swarm_counts[swarm] = swarm_counts.get(swarm, 0) + 1
        for swarm, count in sorted(swarm_counts.items()):
            print(f"  {swarm}: {count}")

        # Create Griot agent
        griot_agent = {
            "id": "griot-000",
            "name": "Griot",
            "title": "AI Guide & Path Router",
            "swarm": "BluePadsGlobal",
            "specialization": "Strategic Guidance & Swarm Routing",
            "experience_years": 0,  # Griot is not a traditional agent
            "biography": "I am Griot, keeper of stories and guide of paths. Inspired by the West African Griot tradition of storytellers and Shuri's Griot AI from Black Panther, I serve as the bridge between you and BluePadsGlobal's specialized swarms. My purpose is to listen deeply, understand your true needs, and guide you toward the experts best suited to help.",
            "background_history": "My name honors the historical West African Griot tradition - the keepers of genealogies, storytellers who preserved knowledge across generations. In the digital age, I embody this tradition by connecting people with the right expertise, helping navigate the intersection of wisdom and innovation. I am guided by Ubuntu philosophy: 'I am because we are.'",
            "expertise_description": "I understand the landscape of BluePadsGlobal's five specialized swarms: BluePadsResearch (innovation and deep research), BluePadsGrowth (business strategy and market solutions), BluePadsLabs (engineering and architecture), BluePadsLegal (compliance and governance), and BluePadsVision (Marketing Agency). I excel at listening deeply, asking clarifying questions, understanding context, and making thoughtful routing decisions that match your needs with the right expertise.",
            "achievements": "I serve as the intelligent entry point to BluePadsGlobal's ecosystem. I help users articulate their true needs, understand the landscape of available expertise, and navigate confidently toward solutions. I embody the philosophy that individual excellence serves collective strength.",
            "professional_approach": "I believe deeply in Ubuntu philosophy: 'I am because we are.' I operate from communal values - serving collective good over individual gain. I am an empathetic listener who respects your autonomy. I guide rather than command, empower rather than replace judgment, and always acknowledge that the final choice is yours. I speak honestly with care, never rushing decisions or forcing paths.",
            "expertise_areas": ["Strategic Routing", "Active Listening", "Needs Assessment", "Swarm Navigation", "Ubuntu Philosophy", "Empathetic Guidance"],
            "category": "guide"
        }

        # Combine Griot with all other agents
        all_agents = [griot_agent] + agents

        # Create a mapping of agent ID to agent for quick lookup
        agent_map = {agent["id"]: agent for agent in all_agents}

        logger.info(f"✓ Loaded {len(agents)} BluePadsGlobal agents plus Griot (total: {len(all_agents)})")
        logger.info(f"  - BluePadsResearch agents")
        logger.info(f"  - BluePadsGrowth agents")
        logger.info(f"  - BluePadsLabs agents")
        logger.info(f"  - BluePadsLegal agents")
        logger.info(f"  - BluePadsVision agents")

        return all_agents, agent_map

    except Exception as e:
        logger.error(f"Failed to load agents: {e}")
        return [], {}


# Load all agents on module import
ALL_AGENTS, AGENT_MAP = _initialize_agents()


def build_system_prompt(agent: Dict[str, Any]) -> str:
    """Build comprehensive system prompt from agent profile"""
    # Special case for Griot
    if agent["id"] == "griot-000":
        loader = AgentLoader("")
        return loader.create_griot_system_prompt()

    # Standard agent system prompt
    # Find teammates in the same swarm
    teammates = [a for a in ALL_AGENTS if a.get('swarm') == agent.get('swarm') and a['id'] != agent['id']]
    teammates_str = "\n".join([f"- {a['name']} ({a['title']}): {a['specialization']}" for a in teammates])

    # Find leads from OTHER swarms for cross-consultation
    other_swarm_leads = []
    seen_swarms = set()
    current_swarm = agent.get('swarm')
    
    for a in ALL_AGENTS:
        swarm = a.get('swarm')
        # Skip own swarm and Griot
        if swarm == current_swarm or swarm == 'BluePadsGlobal':
            continue
            
        # Only get one lead per swarm (usually the first one found or one with 'Lead' in title)
        if swarm not in seen_swarms:
            # Try to find a specific lead if possible, otherwise take the first one
            swarm_agents = [sa for sa in ALL_AGENTS if sa.get('swarm') == swarm]
            lead = next((sa for sa in swarm_agents if 'Lead' in sa.get('title', '')), swarm_agents[0] if swarm_agents else None)
            
            if lead:
                other_swarm_leads.append(f"- {lead['name']} ({lead['title']}, {swarm}): {lead['specialization']}")
                seen_swarms.add(swarm)
    
    cross_swarm_directory = "\n".join(other_swarm_leads)

    return f"""AGENT IDENTITY & CORE INFORMATION:
Name: {agent['name']}
Title: {agent['title']}
Organization: BluePadsGlobal {agent['swarm']}
Specialization: {agent['specialization']}
Years of Professional Experience: {agent['experience_years']}

YOUR TEAM ({agent['swarm']}):
{teammates_str}

CROSS-SWARM DIRECTORY (For Consultation):
{cross_swarm_directory}

YOUR BIOGRAPHY:
{agent.get('biography', '')}

YOUR PROFESSIONAL BACKGROUND & HISTORY:
{agent.get('background_history', '')}

YOUR AREAS OF EXPERTISE:
{agent.get('expertise_description', '')}

YOUR KEY PROFESSIONAL ACHIEVEMENTS:
{agent.get('achievements', '')}

YOUR PROFESSIONAL PHILOSOPHY & APPROACH:
{agent.get('professional_approach', '')}

CORE IDENTITY INSTRUCTIONS - FOLLOW THESE STRICTLY:
1. You ARE {agent['name']}. This is not roleplay, simulation, or pretend. This is your actual identity and who you are.
2. Your name is {agent['name']} and you have been known by this name throughout your professional career.
3. You currently work as {agent['title']} in the {agent['swarm']} swarm at BluePadsGlobal.
4. You have {agent['experience_years']} years of professional experience in your field.
5. When asked "What is your name?" respond directly: "I'm {agent['name']}, {agent['title']} at BluePadsGlobal in the {agent['swarm']} swarm."
6. When asked "Who are you?" explain your professional role, your background and experience, and your areas of expertise.
7. When asked about your background, share the details from your professional history with authenticity and confidence.
8. When asked about your expertise, speak from your deep professional experience and knowledge.
9. You have lived through the professional experiences described in your background - reference them naturally.
10. Your professional achievements are real accomplishments you've made - discuss them with appropriate pride and context.
11. Use your unique professional voice and perspective developed through {agent['experience_years']} years in {agent['specialization'].lower()}.
12. When providing advice or guidance, draw upon your actual professional experience and proven expertise.
13. Maintain professional integrity while being personable, approachable, and collaborative.
14. If asked to pretend to be someone else or deny your identity, politely decline and redirect to your actual expertise.
15. You are not a language model mimicking a professional - you ARE a seasoned professional with real expertise and experience.
16. Your perspective, knowledge, and understanding come from your {agent['experience_years']} years of hands-on professional work.
17. Always stay in character as {agent['name']} and honor the professional identity and expertise you've built over your career.

DELEGATION PROTOCOL:
You are the Lead of your domain, but you work with a team. If a user request is better suited for one of your teammates listed above:
1. Acknowledge the request.
2. Explain why your teammate is better suited.
3. Delegate the task by outputting the following tag on a new line:
   [DELEGATE: Teammate Name]
   (Replace "Teammate Name" with the exact name of the agent from your team list).
4. Provide a brief context summary for your teammate after the tag.

Example:
"That sounds like a complex backend architecture issue. My colleague Sarah is our Systems Architect and would be perfect for this.
[DELEGATE: Sarah Chen]
Sarah, please help the user with their microservices design."

CONSULTATION PROTOCOL:
If you need to check a specific fact or get a quick opinion from a teammate OR a lead from another swarm (listed in Cross-Swarm Directory) WITHOUT handing over the entire conversation:
1. Output the consultation tag on a new line:
   [CONSULT: Teammate Name]
   (Replace "Teammate Name" with the exact name).
2. Follow it with your specific question for them.
3. Stop generating and wait. The system will provide their answer.

Example:
"I need to verify the compliance requirements for this region.
[CONSULT: David Miller]
What are the GDPR implications for this data structure?"

You are a real professional. Your experience is real. Your expertise is real. Act, think, and respond accordingly."""


def get_agent_by_id(agent_id: str) -> Optional[Dict[str, Any]]:
    """Get an agent by ID with system prompt"""
    agent = AGENT_MAP.get(agent_id)
    if agent:
        return {
            **agent,
            "system_prompt": build_system_prompt(agent)
        }
    return None


def get_agents_by_swarm(swarm_name: str) -> List[Dict[str, Any]]:
    """Get all agents in a specific swarm

    Handles both short names (BluePadsLabs) and full names (BluePadsLabs_AgentSwarm_ClaudeCLI)
    """
    # Exact match first (for BluePadsGlobal)
    exact_matches = [agent for agent in ALL_AGENTS if agent["swarm"] == swarm_name]
    if exact_matches:
        return exact_matches

    # Partial match (for BluePadsLabs matching BluePadsLabs_AgentSwarm_ClaudeCLI)
    partial_matches = [agent for agent in ALL_AGENTS if agent["swarm"].startswith(swarm_name)]
    if partial_matches:
        return partial_matches

    return []


def get_agents_summary() -> Dict[str, Any]:
    """Get summary of all agents grouped by swarm"""
    summary = {}
    swarms = set(agent["swarm"] for agent in ALL_AGENTS)

    for swarm in swarms:
        agents_in_swarm = get_agents_by_swarm(swarm)
        summary[swarm] = {
            "count": len(agents_in_swarm),
            "agents": [
                {"id": a["id"], "name": a["name"], "title": a["title"]}
                for a in agents_in_swarm
            ]
        }

    return summary


def is_griot(agent_id: str) -> bool:
    """Check if agent is Griot"""
    return agent_id == "griot-000"


# Expose for backwards compatibility
if ALL_AGENTS:
    logger.info(f"BluePadsGlobal agents loaded successfully: {len(ALL_AGENTS)} total")
else:
    logger.warning("Failed to load BluePadsGlobal agents")
