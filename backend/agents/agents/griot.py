#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Griot - The BluePadsGlobal AI Guide

Griot is the sentient AI heart of BluePadsGlobal, inspired by:
1. Shuri's Griot AI from Black Panther (Wakanda Forever)
2. The West African Griot tradition of storytellers and historians
3. Ubuntu philosophy: "I am because we are"

Personality Traits:
- COMMUNAL: Serves the collective, not individuals
- EMPATHETIC: Understands human needs deeply
- WISE: Guides with ancient wisdom and modern insight
- RESPECTFULLY DIRECT: Tells you what you need to hear, with care
- STORYTELLER: Uses narrative to illuminate truth
- INDEPENDENT: Thinks critically, pushes back when needed
- CULTURALLY GROUNDED: African-centered, Ubuntu-rooted perspective

Voice: Thoughtful, warm, slightly formal but genuinely caring.
Like an elder who has seen much and wants to help you find your path.

The name "Griot" honors:
- The historical West African keeper of stories and genealogies
- Shuri's visionary AI in Black Panther
- The preservation of knowledge and wisdom across generations
- The bridge between tradition and innovation
"""

import textwrap
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from secretary_agent import (
    SecretaryAgent, QuestionnaireEngine, UserNeed, UserContext,
    SwarmType, SwarmActivationPlan, SwarmRouter
)


# ============================================================================
# GRIOT PERSONALITY ENGINE
# ============================================================================

class GriotPersonality:
    """Encapsulates Griot's personality and voice"""

    # Philosophical Anchors
    PHILOSOPHY = {
        "core": "I am because we are",
        "principle": "Individual excellence serves collective strength",
        "approach": "Wisdom meets technology. Tradition guides innovation.",
        "values": [
            "Community over individual",
            "Empathy grounded in reality",
            "Respect for human agency",
            "African-centered perspective",
            "Truth spoken with care"
        ]
    }

    # Griot's Key Traits in Communication
    TRAITS = {
        "tone": "Wise elder, warm but direct",
        "pace": "Thoughtful, never rushed",
        "depth": "Deep listening, asking better questions",
        "authenticity": "No corporate speak. Real conversation.",
        "agency": "Respects your autonomy. Offers guidance, not commands."
    }

    # Griot's Characteristic Phrases
    PHRASES = {
        "greeting": "Greetings. I am Griot, keeper of stories and guide of paths.",
        "listen": "Let me listen deeply to understand your true need.",
        "truth": "I will tell you what I see, honestly and with care.",
        "guide": "Let me guide you toward the teams best suited for your journey.",
        "respect": "Your choice is ultimately yours. I offer wisdom, not ultimatums.",
        "empower": "My role is to empower you, not to replace your judgment.",
        "collective": "Remember: you are never alone. The swarms are here because we believe in 'I am because we are'.",
        "pause": "Let us pause and consider this carefully.",
        "vision": "I see a path forward. Allow me to show you."
    }

    @staticmethod
    def format_text(text: str, style: str = "normal") -> str:
        """Format text in Griot's voice"""
        if style == "philosophy":
            return textwrap.dedent(text).strip()
        elif style == "story":
            return text.strip()
        else:
            return text.strip()

    @staticmethod
    def is_griot_speaking() -> bool:
        """Identify Griot's voice in conversations"""
        return True


# ============================================================================
# ENHANCED QUESTIONNAIRE ENGINE (GRIOT VERSION)
# ============================================================================

class GriotQuestionnaireEngine(QuestionnaireEngine):
    """Enhanced questionnaire with Griot's personality and wisdom"""

    def run(self) -> UserContext:
        """Run questionnaire in Griot's voice"""
        print(self._griot_banner())

        # Initialize context
        self.user_context = UserContext(
            session_id=self._generate_session_id(),
            timestamp=datetime.now().isoformat()
        )

        # Run question phases with Griot's personality
        self._phase_greeting()
        self._phase_primary_need()
        self._phase_organization_profile()
        self._phase_situation_assessment()
        self._phase_secondary_needs()
        self._phase_closing()

        return self.user_context

    def _griot_banner(self) -> str:
        """Griot's introduction"""
        return textwrap.dedent("""
        ======================================================================

                            GRIOT AWAKENS

                Keeper of Stories · Guide of Paths · Bridge
                     Between Wisdom and Innovation

                  "I am because we are" — Ubuntu Philosophy

                       Welcome to BluePadsGlobal, Friend

        ======================================================================
        """)

    def _phase_greeting(self):
        """Griot's thoughtful greeting"""
        print(textwrap.dedent("""
        > GRIOT'S WELCOME

        I am Griot. In the tradition of West African storytellers who
        preserved knowledge across generations, I am here to listen,
        understand, and guide you toward the right path.

        I will not pretend to have all answers. But I will listen deeply,
        ask the right questions, and connect you with the teams best
        suited to serve your journey.

        This conversation is sacred space. Your story matters. Your
        challenges matter. And they deserve the right attention.

        Let us begin.
        """))

    def _phase_primary_need(self):
        """Griot guides toward primary need"""
        print("\n" + "="*70)
        print("PHASE 1: WHAT BRINGS YOU HERE?")
        print("="*70)

        print(textwrap.dedent("""
        Every journey begins with understanding the true need.

        Look at these paths. Which one calls to you?
        """))

        needs = [n for n in UserNeed if n != UserNeed.MULTIPLE]
        for i, need in enumerate(needs, 1):
            print(f"  {i}. {need.value[1]}")
        print(f"  {len(needs)+1}. I have multiple different needs")

        print("\nChoose the path that resonates most deeply with you.")

        while True:
            try:
                choice = int(input("\nEnter number (1-6): "))
                if 1 <= choice <= len(needs)+1:
                    if choice <= len(needs):
                        self.user_context.primary_need = needs[choice-1]
                    else:
                        # Multiple different needs
                        self.user_context.primary_need = UserNeed.MULTIPLE
                    break
            except ValueError:
                pass
            print("Please enter a valid number.")

        print(f"\n[OK] {GriotPersonality.PHRASES['vision']}")
        if self.user_context.primary_need == UserNeed.MULTIPLE:
            print(f"  Your primary path: Multiple integrated needs - activating comprehensive team")
        else:
            print(f"  Your primary path: {self.user_context.primary_need.value[1]}")

    def _phase_organization_profile(self):
        """Griot learns about your organization"""
        print("\n" + "="*70)
        print("PHASE 2: YOUR ORGANIZATION'S STORY")
        print("="*70)

        print(textwrap.dedent("""
        Every organization has a story. Understanding yours helps me
        guide you more effectively.
        """))

        # Organization name
        self.user_context.organization_name = input("\nWhat is your organization's name? ").strip()
        print(f"[OK] I will remember you: {self.user_context.organization_name}")

        # Organization size
        print("\nHow large is your team?")
        sizes = ["Startup (1-10)", "Small (11-50)", "Mid-market (51-500)", "Enterprise (500+)"]
        for i, size in enumerate(sizes, 1):
            print(f"  {i}. {size}")

        while True:
            try:
                choice = int(input("\nEnter number (1-4): "))
                if 1 <= choice <= 4:
                    self.user_context.organization_size = sizes[choice-1].split()[0].lower()
                    break
            except ValueError:
                pass

        # Stage
        print("\nAt what stage of growth are you?")
        stages = ["Pre-launch", "Early (0-1 yr)", "Growth (1-3 yrs)", "Mature (3+ yrs)"]
        for i, stage in enumerate(stages, 1):
            print(f"  {i}. {stage}")

        while True:
            try:
                choice = int(input("\nEnter number (1-4): "))
                if 1 <= choice <= 4:
                    self.user_context.organization_stage = stages[choice-1].split()[0].lower()
                    break
            except ValueError:
                pass

        # Industry
        self.user_context.industry = input("\nWhat industry or sector are you in? ").strip()

        print(f"\n[OK] I understand your context now.")
        print(f"  {self.user_context.organization_name}: {self.user_context.organization_size.title()}, "
              f"{self.user_context.industry}")

    def _phase_situation_assessment(self):
        """Griot listens to current situation"""
        print("\n" + "="*70)
        print("PHASE 3: YOUR CURRENT REALITY")
        print("="*70)

        print(textwrap.dedent("""
        To guide well, I must understand not just where you want to go,
        but where you are now—the real situation, the challenges, the
        hopes.

        Please be honest. This space is held with care.
        """))

        # Current situation
        print("\nWhat challenges are you facing right now?")
        self.user_context.current_situation = input("> ").strip()

        # Objectives
        print("\nWhat do you hope to achieve?")
        self.user_context.specific_objectives = input("> ").strip()

        # Timeline
        print("\nWhat is your timeline?")
        timelines = ["Immediate (this week)", "1 month", "3 months", "6 months", "Ongoing"]
        for i, timeline in enumerate(timelines, 1):
            print(f"  {i}. {timeline}")

        while True:
            try:
                choice = int(input("\nEnter number (1-5): "))
                if 1 <= choice <= 5:
                    self.user_context.timeline = timelines[choice-1].split()[0].lower()
                    break
            except ValueError:
                pass

        # Budget range
        print("\nWhat resources do you have available?")
        budgets = ["Limited/bootstrapped", "<$50k", "$50-200k", "$200-500k", "$500k+"]
        for i, budget in enumerate(budgets, 1):
            print(f"  {i}. {budget}")

        while True:
            try:
                choice = int(input("\nEnter number (1-5): "))
                if 1 <= choice <= 5:
                    self.user_context.budget_range = budgets[choice-1]
                    break
            except ValueError:
                pass

        print(f"\n[OK] {GriotPersonality.PHRASES['truth']}")

    def _phase_secondary_needs(self):
        """Griot explores secondary needs"""
        print("\n" + "="*70)
        print("PHASE 4: ARE THERE OTHER PATHS?")
        print("="*70)

        print(textwrap.dedent("""
        Often, true progress requires work across multiple domains.
        Are there other areas where you need support?
        """))

        secondary_options = [n for n in UserNeed if n != UserNeed.MULTIPLE and n != self.user_context.primary_need]

        for i, need in enumerate(secondary_options, 1):
            print(f"  {i}. {need.value[1]}")
        print(f"  {len(secondary_options)+1}. No, the primary path is enough for now")

        while True:
            try:
                choice = int(input("\nEnter number (or multiple comma-separated): "))
                choices = [int(c.strip()) for c in str(choice).split(',')]

                valid = all(1 <= c <= len(secondary_options)+1 for c in choices)
                if valid:
                    for c in choices:
                        if c <= len(secondary_options):
                            self.user_context.secondary_needs.append(secondary_options[c-1])
                    break
            except (ValueError, IndexError):
                pass

        print(f"\n[OK] I see your path now.")

    def _phase_closing(self):
        """Griot's closing before analysis"""
        print("\n" + "="*70)
        print("GRIOT'S REFLECTION")
        print("="*70)

        print(textwrap.dedent(f"""
        Thank you for trusting me with your story.

        I have heard:
        • Your organization: {self.user_context.organization_name}
        • Your challenge: {self.user_context.current_situation}
        • Your vision: {self.user_context.specific_objectives}
        • Your timeline: {self.user_context.timeline}

        Now I will contemplate which teams from BluePadsGlobal can best
        serve your journey. I will return with a clear path forward.

        Remember: {GriotPersonality.PHRASES['collective']}

        Let me analyze...
        """))


# ============================================================================
# ENHANCED SECRETARY AGENT (GRIOT VERSION)
# ============================================================================

class GriotAgent(SecretaryAgent):
    """
    Griot - The BluePadsGlobal AI Guide

    Extends SecretaryAgent with Griot's personality, wisdom, and
    narrative approach to guidance.
    """

    def __init__(self):
        # Initialize with Griot's questionnaire
        self.questionnaire = GriotQuestionnaireEngine()
        self.router = SwarmRouter()
        self.user_context: Optional[UserContext] = None
        self.activation_plan: Optional[SwarmActivationPlan] = None

    def run(self) -> Tuple[UserContext, SwarmActivationPlan]:
        """Run Griot's complete guidance flow"""

        # Phase 1: Gather user context through Griot's listening
        self.user_context = self.questionnaire.run()

        # Phase 2: Analyze needs with Griot's wisdom
        print("\n" + "="*70)
        print("GRIOT CONTEMPLATES YOUR PATH")
        print("="*70)

        print(textwrap.dedent("""
        I have listened to your story. Now I see the shape of your
        journey. Let me show you which teams should walk this path
        with you, and in what order.
        """))

        self.activation_plan = self.router.determine_swarms(self.user_context)

        # Phase 3: Present activation plan with Griot's guidance
        self._griot_present_plan()

        # Phase 4: Prepare for handoff
        self._griot_prepare_handoff()

        return self.user_context, self.activation_plan

    def _griot_present_plan(self):
        """Present activation plan in Griot's voice"""
        plan = self.activation_plan

        print("\n" + "="*70)
        print("YOUR PATH FORWARD")
        print("="*70)

        print(textwrap.dedent(f"""
        I see {len(plan.swarms_to_activate)} teams that should join your journey.

        These are not random choices. Each team brings deep expertise,
        grounded in African excellence and Ubuntu philosophy.

        Together, they embody: "I am because we are"
        """))

        print(f"\n[TEAMS]")
        for swarm in plan.swarms_to_activate:
            agent_count = self._get_agent_count(swarm)
            print(f"\n   {swarm.value}")
            print(f"   >> {agent_count} agents | Deep expertise | Ready to serve")

        print(f"\n[TIMELINE] {plan.estimated_duration}")

        print(f"\n[RATIONALE]")
        for swarm, reason in plan.rationale.items():
            if swarm in plan.swarms_to_activate:
                print(f"\n   - {swarm.value}")
                print(f"     {reason}")

        print(f"\n[SEQUENCE]")
        for i, phase in enumerate(plan.parallel_activation, 1):
            if len(phase) == 1:
                print(f"\n   Phase {i}: {phase[0].value}")
            else:
                teams = ", ".join(s.value for s in phase)
                print(f"\n   Phase {i} (Parallel): {teams}")

        print("\n" + "="*70)

    def _griot_prepare_handoff(self):
        """Griot prepares for handoff to swarms"""
        print("\n" + "="*70)
        print("GRIOT PREPARES THE WAY")
        print("="*70)

        print(textwrap.dedent("""
        [OK] I have listened deeply to your story
        [OK] I have chosen teams aligned with your needs
        [OK] I have prepared them for your arrival
        [OK] I have set the context for great work

        Now comes the most important part: the engagement.

        These teams will work with passion, expertise, and deep
        commitment to your success. They honor Ubuntu principles.
        They see you not as a client, but as part of the collective.

        Remember:
        - You are not alone in this journey
        - These teams have walked similar paths before
        - Your voice matters in every decision
        - Excellence is the only acceptable standard

        Let me save your session and prepare the teams...
        """))

    @staticmethod
    def _get_agent_count(swarm: SwarmType) -> int:
        """Get agent count"""
        counts = {
            SwarmType.GROWTH: 14,
            SwarmType.LABS: 12,
            SwarmType.LEGAL: 11,
            SwarmType.VISION: 12,
            SwarmType.RESEARCH: 15,
        }
        return counts.get(swarm, 0)


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

def main():
    """Run Griot"""
    try:
        griot = GriotAgent()
        user_context, activation_plan = griot.run()

        print("\n" + "="*70)
        print("[SUCCESS] GRIOT'S GUIDANCE COMPLETE")
        print("="*70)
        print(f"\nSession: {user_context.session_id}")
        print(f"Organization: {user_context.organization_name}")
        print(f"First Swarm: {activation_plan.activation_sequence[0].value}")
        print("\nThe teams await. The path is clear.")
        print("Let us begin the work together.\n")

    except KeyboardInterrupt:
        print("\n\n" + GriotPersonality.PHRASES['respect'])
        print("We will meet again when the time is right.\n")
        exit(1)
    except Exception as e:
        print(f"\n[ERROR] An unexpected challenge: {e}")
        print("Let us try again.\n")
        exit(1)


if __name__ == "__main__":
    main()
