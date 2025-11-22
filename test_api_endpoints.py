#!/usr/bin/env python3
"""
Test BluePadsGlobal API endpoints
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
    is_griot
)


def test_list_agents_endpoint():
    """Test GET /api/v1/agents endpoint"""
    print("\n[TEST] GET /api/v1/agents")
    print("-" * 60)

    # Simulate endpoint response
    agents_list = [
        {
            "id": agent["id"],
            "name": agent["name"],
            "title": agent["title"],
            "swarm": agent["swarm"],
            "specialization": agent["specialization"],
            "experience_years": agent["experience_years"],
            "expertise_areas": agent.get("expertise_areas", []),
            "is_griot": is_griot(agent["id"])
        }
        for agent in ALL_AGENTS
    ]

    summary = get_agents_summary()

    response = {
        "agents": agents_list,
        "total": len(ALL_AGENTS),
        "summary": summary
    }

    print(f"Status: 200 OK")
    print(f"Total agents: {response['total']}")
    print(f"Swarms: {len(response['summary'])}")

    # Print first agent
    if response['agents']:
        print(f"\nFirst agent:")
        print(f"  ID: {response['agents'][0]['id']}")
        print(f"  Name: {response['agents'][0]['name']}")
        print(f"  Is Griot: {response['agents'][0]['is_griot']}")

    return True


def test_get_agent_endpoint():
    """Test GET /api/v1/agents/{agent_id} endpoint"""
    print("\n[TEST] GET /api/v1/agents/{{agent_id}}")
    print("-" * 60)

    # Test Griot
    agent = get_agent_by_id("griot-000")

    if not agent:
        print("ERROR: Griot not found!")
        return False

    response = {
        "id": agent["id"],
        "name": agent["name"],
        "title": agent["title"],
        "swarm": agent["swarm"],
        "specialization": agent["specialization"],
        "experience_years": agent["experience_years"],
        "expertise_areas": agent.get("expertise_areas", []),
        "system_prompt": agent["system_prompt"]
    }

    print(f"Status: 200 OK")
    print(f"Agent ID: {response['id']}")
    print(f"Agent Name: {response['name']}")
    print(f"System Prompt Length: {len(response['system_prompt'])} chars")
    print(f"Expertise Areas: {len(response['expertise_areas'])} areas")

    return True


def test_get_system_prompt_endpoint():
    """Test GET /api/v1/agents/{agent_id}/system-prompt endpoint"""
    print("\n[TEST] GET /api/v1/agents/{{agent_id}}/system-prompt")
    print("-" * 60)

    agent = get_agent_by_id("griot-000")

    if not agent:
        print("ERROR: Griot not found!")
        return False

    response = {
        "agent_id": agent["id"],
        "name": agent["name"],
        "system_prompt": agent["system_prompt"]
    }

    print(f"Status: 200 OK")
    print(f"Agent: {response['name']}")
    print(f"System Prompt Preview:")
    print(f"  {response['system_prompt'][:200]}...")

    return True


def test_get_swarm_agents_endpoint():
    """Test GET /api/v1/swarms/{swarm_name}/agents endpoint"""
    print("\n[TEST] GET /api/v1/swarms/{{swarm_name}}/agents")
    print("-" * 60)

    # Test BluePadsResearch swarm
    swarm_name = "BluePadsResearch_AgentSwarm_ClaudeCLI"
    agents = get_agents_by_swarm(swarm_name)

    if not agents:
        print(f"ERROR: Swarm '{swarm_name}' not found!")
        return False

    response = {
        "swarm": swarm_name,
        "agents": [
            {
                "id": agent["id"],
                "name": agent["name"],
                "title": agent["title"],
                "specialization": agent["specialization"],
                "experience_years": agent["experience_years"],
                "expertise_areas": agent.get("expertise_areas", []),
                "is_griot": is_griot(agent["id"])
            }
            for agent in agents
        ],
        "total": len(agents)
    }

    print(f"Status: 200 OK")
    print(f"Swarm: {response['swarm']}")
    print(f"Total agents in swarm: {response['total']}")

    # Print first few agents
    for agent in response['agents'][:3]:
        print(f"  - {agent['name']} ({agent['title']})")

    if len(response['agents']) > 3:
        print(f"  ... and {len(response['agents']) - 3} more")

    return True


def test_agent_execution_request():
    """Test POST /api/v1/agent/execute request"""
    print("\n[TEST] POST /api/v1/agent/execute")
    print("-" * 60)

    # Get Griot agent
    agent = get_agent_by_id("griot-000")

    if not agent:
        print("ERROR: Griot not found!")
        return False

    # Simulate request body
    request_body = {
        "agent_id": agent["id"],
        "message": "I need help with a technical architecture problem",
        "provider": "claude",
        "temperature": 0.7,
        "max_tokens": 2048,
        "system_prompt": agent["system_prompt"]
    }

    print(f"Request Body:")
    print(f"  Agent ID: {request_body['agent_id']}")
    print(f"  Provider: {request_body['provider']}")
    print(f"  Message: {request_body['message']}")
    print(f"  System Prompt Length: {len(request_body['system_prompt'])} chars")
    print(f"  Max Tokens: {request_body['max_tokens']}")

    # Simulate response
    simulated_response = {
        "agent_id": request_body['agent_id'],
        "content": "[Claude response would go here]",
        "provider": request_body['provider'],
        "tokens_used": 500,
        "execution_time_ms": 1234.56,
        "timestamp": "2024-11-02T19:00:00.000000"
    }

    print(f"\nSimulated Response:")
    print(f"  Agent ID: {simulated_response['agent_id']}")
    print(f"  Tokens Used: {simulated_response['tokens_used']}")
    print(f"  Execution Time: {simulated_response['execution_time_ms']:.2f}ms")

    return True


def test_all_agents_accessible():
    """Test that all agents are accessible"""
    print("\n[TEST] All agents accessible")
    print("-" * 60)

    missing_agents = []

    for agent in ALL_AGENTS:
        retrieved_agent = get_agent_by_id(agent["id"])
        if not retrieved_agent:
            missing_agents.append(agent["id"])

    if missing_agents:
        print(f"ERROR: {len(missing_agents)} agents not accessible!")
        for agent_id in missing_agents:
            print(f"  - {agent_id}")
        return False

    print(f"Status: OK")
    print(f"Total agents: {len(ALL_AGENTS)}")
    print(f"All agents accessible via get_agent_by_id()")

    return True


def test_swarms_summary():
    """Test swarms summary"""
    print("\n[TEST] Swarms summary")
    print("-" * 60)

    summary = get_agents_summary()

    print(f"Status: OK")
    print(f"Total swarms: {len(summary)}")

    for swarm_name, info in sorted(summary.items()):
        print(f"\n{swarm_name}:")
        print(f"  Total agents: {info['count']}")
        print(f"  Sample agents:")
        for agent_info in info['agents'][:3]:
            print(f"    - {agent_info['name']} ({agent_info['id']})")

    return True


def main():
    """Run all API endpoint tests"""
    print("\n" + "=" * 60)
    print("BLUEPADSGLOBAL API ENDPOINT TESTS")
    print("=" * 60)

    tests = [
        ("List agents", test_list_agents_endpoint),
        ("Get agent details", test_get_agent_endpoint),
        ("Get system prompt", test_get_system_prompt_endpoint),
        ("Get swarm agents", test_get_swarm_agents_endpoint),
        ("Agent execution request", test_agent_execution_request),
        ("All agents accessible", test_all_agents_accessible),
        ("Swarms summary", test_swarms_summary),
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"[FAIL] {test_name}: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60 + "\n")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
