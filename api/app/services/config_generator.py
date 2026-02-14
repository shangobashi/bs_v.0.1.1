from typing import Dict, Any, List
import time

class BaseConfigGenerator:
    """Base class for swarm config generators"""
    def generate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

class BluePadsGrowthGenerator(BaseConfigGenerator):
    """Generates advisory.json for Wealth & Finance"""
    def generate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "config_type": "advisory",
            "generated_at": time.time(),
            "firm_profile": {
                "name": user_context.get("organization_name"),
                "stage": user_context.get("organization_stage"),
                "industry": user_context.get("industry")
            },
            "engagement_scope": {
                "primary_objective": "Financial Growth & Stability",
                "focus_areas": ["Financial Strategy", "Investment Planning", "Capital Allocation"]
            },
            "financial_strategy": {
                "risk_tolerance": "Moderate", # Default, would be refined by agent
                "investment_horizon": "Long-term"
            }
        }

class BluePadsLabsGenerator(BaseConfigGenerator):
    """Generates project.json for Software Engineering"""
    def generate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "config_type": "project",
            "generated_at": time.time(),
            "project_details": {
                "name": f"{user_context.get('organization_name')} Tech Initiative",
                "type": "Software Development",
                "status": "Planning"
            },
            "tech_stack": {
                "recommended": ["TBD"], # To be filled by agents
                "constraints": []
            },
            "architecture": {
                "style": "TBD",
                "scalability_requirement": user_context.get("organization_size", "Startup")
            },
            "development_plan": {
                "phases": ["Discovery", "Design", "Implementation", "Testing", "Deployment"]
            }
        }

class BluePadsLegalGenerator(BaseConfigGenerator):
    """Generates client.json for Legal & Compliance"""
    def generate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "config_type": "client",
            "generated_at": time.time(),
            "client_details": {
                "entity_name": user_context.get("organization_name"),
                "jurisdiction": "TBD",
                "industry_sector": user_context.get("industry")
            },
            "legal_matters": {
                "primary_focus": "Corporate Structuring & Compliance",
                "pending_actions": []
            },
            "compliance_needs": {
                "regulatory_frameworks": ["TBD"],
                "risk_assessment": "Pending"
            }
        }

class BluePadsVisionGenerator(BaseConfigGenerator):
    """Generates campaign.json for Marketing & Growth"""
    def generate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "config_type": "campaign",
            "generated_at": time.time(),
            "campaign_strategy": {
                "brand_name": user_context.get("organization_name"),
                "market_position": "TBD",
                "objectives": ["Brand Awareness", "Customer Acquisition"]
            },
            "target_market": {
                "segments": ["TBD"],
                "demographics": "TBD"
            },
            "messaging": {
                "core_value_prop": "TBD",
                "tone": "Professional"
            }
        }

class BluePadsResearchGenerator(BaseConfigGenerator):
    """Generates research.json for Research & Innovation"""
    def generate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "config_type": "research",
            "generated_at": time.time(),
            "research_objectives": {
                "topic": user_context.get("current_situation", "Innovation Initiative"),
                "goals": ["Feasibility Study", "Market Analysis", "Tech Scouting"]
            },
            "methodology": {
                "approach": "Mixed Methods",
                "data_sources": ["TBD"]
            },
            "expected_outputs": ["Research Report", "Strategic Recommendations"]
        }

class ConfigGeneratorFactory:
    """Factory to create and run appropriate generators"""
    
    _generators = {
        "BluePadsGrowth": BluePadsGrowthGenerator(),
        "BluePadsLabs": BluePadsLabsGenerator(),
        "BluePadsLegal": BluePadsLegalGenerator(),
        "BluePadsVision": BluePadsVisionGenerator(),
        "BluePadsResearch": BluePadsResearchGenerator(),
    }

    @classmethod
    def generate_configs(cls, activated_swarms: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate configs for all activated swarms"""
        configs = {}
        for swarm_name in activated_swarms:
            # Handle partial matches or exact matches
            generator = None
            for key, gen in cls._generators.items():
                if key in swarm_name:
                    generator = gen
                    break
            
            if generator:
                configs[swarm_name] = generator.generate(user_context)
            else:
                print(f"Warning: No generator found for swarm {swarm_name}")
                
        return configs

config_generator = ConfigGeneratorFactory()
