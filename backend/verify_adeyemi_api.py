import requests
import json

try:
    r = requests.get('http://localhost:8000/api/v1/agents')
    if r.status_code != 200:
        print(f"Error: Status {r.status_code}")
        print(r.text)
        exit(1)
        
    data = r.json()
    agents = data.get('agents', [])
    
    adeyemi = next((a for a in agents if 'Adeyemi Oladele' in a['name']), None)
    
    if adeyemi:
        print(f"Found: {adeyemi['name']}")
        bio = adeyemi.get('biography', '')
        print(f"Bio length: {len(bio)}")
        if bio:
            print(f"Bio preview: {bio[:100]}...")
        else:
            print("Bio is empty/missing")
            
        # Also check other fields
        print(f"Specialization: {adeyemi.get('specialization')}")
        print(f"Title: {adeyemi.get('title')}")
    else:
        print("Adeyemi Oladele not found in API response")
        
except Exception as e:
    print(f"Exception: {e}")
