import os
import sys
from app.agents_loader import AgentLoader

def verify_jake():
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "agents")
    loader = AgentLoader(base_dir)
    agents = loader.load_all_agents()
    
    jake = next((a for a in agents if "Jake Mensah" in a['name']), None)
    
    if jake:
        print(f"Name: {jake['name']}")
        print(f"Specialization: {jake['specialization']}")
        print(f"Biography: {jake['biography'][:100]}...")
    else:
        print("Jake Mensah not found.")

if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    verify_jake()
