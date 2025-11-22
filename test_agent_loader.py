#!/usr/bin/env python3
"""
Test script to verify BluePadsGlobal agent loading
"""

import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app.agents_data import (
    ALL_AGENTS,
    get_agent_by_id,
    get_agents_by_swarm,
    get_agents_summary,
    is_griot,
    build_system_prompt
)


def test_agents_loaded():
    """Test that agents are loaded"""
    print(f"\n[OK] Total agents loaded: {len(ALL_AGENTS)}")
    assert len(ALL_AGENTS) > 0, "No agents loaded!"
    return True


def test_griot():
    """Test Griot agent"""
    print("\n[OK] Testing Griot routing agent...")
    griot = get_agent_by_id("griot-000")

    assert griot is not None, "Griot not found!"
    assert griot["name"] == "Griot", "Griot name mismatch!"
    assert is_griot("griot-000"), "Griot not identified correctly!"
    assert "system_prompt" in griot, "Griot system prompt missing!"

    print(f"  - Griot name: {griot['name']}")
    print(f"  - Griot title: {griot['title']}")
    print(f"  - System prompt length: {len(griot['system_prompt'])} chars")

    return True


def test_swarms():
    """Test agent swarms"""
    print("\n[OK] Testing BluePadsGlobal swarms...")
    summary = get_agents_summary()

    print(f"  - Swarms found: {len(summary)}")
    for swarm_name, info in summary.items():
        print(f"    - {swarm_name}: {info['count']} agents")

    return True


def test_agent_profiles():
    """Test individual agent profiles"""
    print("\n[OK] Testing agent profiles...")

    # Get first non-Griot agent
    test_agent = None
    for agent in ALL_AGENTS:
        if not is_griot(agent["id"]):
            test_agent = agent
            break

    if test_agent:
        agent_with_prompt = get_agent_by_id(test_agent["id"])

        print(f"  - Agent: {test_agent['name']}")
        print(f"  - Title: {test_agent['title']}")
        print(f"  - Swarm: {test_agent['swarm']}")
        print(f"  - Experience: {test_agent['experience_years']} years")
        print(f"  - System prompt length: {len(agent_with_prompt['system_prompt'])} chars")

        # Verify system prompt contains key information
        assert test_agent['name'] in agent_with_prompt['system_prompt'], "Name not in system prompt!"
        assert test_agent['title'] in agent_with_prompt['system_prompt'], "Title not in system prompt!"

    return True


def test_swarm_filtering():
    """Test filtering agents by swarm"""
    print("\n[OK] Testing swarm filtering...")

    swarms = list(get_agents_summary().keys())

    for swarm in swarms:
        agents = get_agents_by_swarm(swarm)
        print(f"  - {swarm}: {len(agents)} agents")

        # Verify all returned agents belong to the swarm
        for agent in agents:
            assert agent["swarm"] == swarm, f"Agent {agent['id']} not in {swarm}!"

    return True


def print_agent_sample():
    """Print a sample agent"""
    print("\n" + "="*80)
    print("SAMPLE AGENT PROFILE")
    print("="*80)

    # Get Griot as sample
    griot = get_agent_by_id("griot-000")

    sample = {
        "id": griot["id"],
        "name": griot["name"],
        "title": griot["title"],
        "swarm": griot["swarm"],
        "specialization": griot["specialization"],
        "experience_years": griot["experience_years"],
        "expertise_areas": griot.get("expertise_areas", []),
        "biography_length": len(griot.get("biography", "")),
        "system_prompt_preview": griot["system_prompt"][:300] + "..."
    }

    print(json.dumps(sample, indent=2, default=str))

    return True


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("BLUEPADSGLOBAL AGENT LOADER TEST")
    print("="*80)

    try:
        test_agents_loaded()
        test_griot()
        test_swarms()
        test_agent_profiles()
        test_swarm_filtering()
        print_agent_sample()

        print("\n" + "="*80)
        print("[PASS] ALL TESTS PASSED")
        print("="*80 + "\n")

        return 0

    except Exception as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
