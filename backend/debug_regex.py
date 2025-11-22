import re

file_path = r"c:/Users/Shango/Documents/Code/SwarmAgents_WebUI_MVP/backend/agents/BluePadsLegal_AgentSwarm_ClaudeCLI/agents/corporate/adeyemi-oladele-corporate-ma-counsel.md"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Content length: {len(content)}")

heading_pattern = r'^##\s+(.+?)\n(.*?)(?=^##\s|\Z)'
matches = list(re.finditer(heading_pattern, content, re.MULTILINE | re.DOTALL))

print(f"Found {len(matches)} matches")
for match in matches:
    section_name = match.group(1).strip()
    section_content = match.group(2).strip()
    print(f"Section: '{section_name}' (Content len: {len(section_content)})")
    if "BIOGRAPHY" in section_name:
        print("  -> BIOGRAPHY FOUND!")
        print(f"  -> Content: '{section_content[:50]}...'")
