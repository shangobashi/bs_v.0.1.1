from pathlib import Path
import re

def extract_sections(content: str):
    sections = {}
    # Remove frontmatter
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)

    # Extract major sections by heading
    # Only split on Level 2 headers (## ), ignoring Level 3 (### )
    heading_pattern = r'^##\s+(.+?)\n(.*?)(?=^##\s|\Z)'
    matches = re.finditer(heading_pattern, content, re.MULTILINE | re.DOTALL)

    for match in matches:
        section_name = match.group(1).strip().lower().replace(' ', '_').replace('&', 'and')
        section_content = match.group(2).strip()
        sections[section_name] = section_content
    return sections

file_path = r"c:/Users/Shango/Documents/Code/SwarmAgents_WebUI_MVP/backend/agents/BluePadsLegal_AgentSwarm_ClaudeCLI/agents/corporate/adeyemi-oladele-corporate-ma-counsel.md"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

sections = extract_sections(content)
print("Sections found:", sections.keys())

bio_keys = [
    "introduction", 
    "my_story", 
    "the_origin_story", 
    "background", 
    "core_identity",
    "about_me",
    "profile",
    "personal_profile",
    "professional_profile",
    "biography",
    "bio"
]

found = False
for key in bio_keys:
    if key in sections:
        print(f"Found bio key: {key}")
        print(f"Content length: {len(sections[key])}")
        found = True
        break

if not found:
    print("No bio key found in sections.")
