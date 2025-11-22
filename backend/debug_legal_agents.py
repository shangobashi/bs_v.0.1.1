import requests
import json

try:
    r = requests.get('http://localhost:8000/api/v1/agents')
    data = r.json()
    agents = data.get('agents', [])
    
    legal_agents = [a for a in agents if 'Legal' in a['swarm']]
    print(f"Found {len(legal_agents)} Legal agents:")
    for a in legal_agents:
        print(f"- {a['name']} (ID: {a['id']})")
        if 'Adeyemi' in a['name'] or 'Oladele' in a['name']:
            print(f"  MATCH FOUND! Bio length: {len(a.get('biography', ''))}")

except Exception as e:
    print(f"Exception: {e}")
