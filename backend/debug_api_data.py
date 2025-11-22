import requests
import json

try:
    print("Fetching swarms...")
    swarms_response = requests.get("http://localhost:8000/api/v1/swarms")
    swarms_data = swarms_response.json()
    print(f"Swarms count: {swarms_data['total']}")
    
    print("\nFetching agents...")
    agents_response = requests.get("http://localhost:8000/api/v1/agents")
    agents_data = agents_response.json()
    print(f"Agents count: {agents_data['total']}")

    print("\n--- COMPARISON ---")
    swarm_names = [s['name'] for s in swarms_data['swarms']]
    print(f"Swarm Names (from /swarms): {swarm_names}")

    agent_swarms = set([a['swarm'] for a in agents_data['agents']])
    print(f"Agent Swarms (from /agents): {list(agent_swarms)}")

    print("\n--- MISMATCH CHECK ---")
    for s_name in swarm_names:
        if s_name not in agent_swarms:
            print(f"WARNING: Swarm '{s_name}' has no matching agents in /agents response!")
        else:
            print(f"MATCH: Swarm '{s_name}' has matching agents.")

except Exception as e:
    print(f"Error: {e}")
