import os
import sys
from app.agents_loader import AgentLoader

def audit_agents():
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "agents")
    loader = AgentLoader(base_dir)
    agents = loader.load_all_agents()
    
    print(f"Loaded {len(agents)} agents.")
    
    missing_data = []
    
    for agent in agents:
        issues = []
        if agent['specialization'] == "Professional":
            issues.append("Default Specialization")
        if not agent['biography'] or agent['biography'] == "No biography available.":
            issues.append("Missing Biography")
        if not agent['experience_years'] or agent['experience_years'] == "Unknown":
            issues.append("Missing Experience")
            
        if issues:
            missing_data.append({
                "name": agent['name'],
                "swarm": agent['swarm'],
                "issues": issues
            })
            
    with open("audit_report.txt", "w", encoding="utf-8") as f:
        if not missing_data:
            f.write("All agents have complete data!\n")
        else:
            f.write(f"Found issues in {len(missing_data)} agents:\n")
            for item in missing_data:
                f.write(f"- {item['name']} ({item['swarm']}): {', '.join(item['issues'])}\n")
    
    print("Audit complete. Check audit_report.txt")

if __name__ == "__main__":
    # Add project root to path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    audit_agents()
