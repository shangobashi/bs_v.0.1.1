import json
import time
import os
from pathlib import Path
from typing import Dict, Any, Optional, List

SESSION_DIR = Path("sessions")
SESSION_DIR.mkdir(exist_ok=True)

class SessionService:
    """
    Manages user sessions, persisting context, activation plans, and artifacts.
    """

    def __init__(self):
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self._load_sessions()

    def _load_sessions(self):
        """Load all sessions from disk"""
        for session_file in SESSION_DIR.glob("session_*.json"):
            try:
                data = json.loads(session_file.read_text(encoding='utf-8'))
                self.active_sessions[data['session_id']] = data
            except Exception as e:
                print(f"Error loading session {session_file}: {e}")

    def create_session(self, user_context: Dict[str, Any], activation_plan: Dict[str, Any]) -> str:
        """Create a new session and save it"""
        session_id = activation_plan.get('session_id') or f"SESSION-{int(time.time())}"
        
        session_data = {
            "session_id": session_id,
            "created_at": time.time(),
            "updated_at": time.time(),
            "user_context": user_context,
            "activation_plan": activation_plan,
            "artifacts": {},  # Store generated files/configs here
            "chat_history": [] # Optional: could store history here later
        }
        
        self.active_sessions[session_id] = session_data
        self._save_session(session_id)
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data by ID"""
        return self.active_sessions.get(session_id)

    def update_session_artifact(self, session_id: str, artifact_key: str, artifact_data: Any):
        """Save a generated artifact (e.g., project.json) to the session"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id]["artifacts"][artifact_key] = artifact_data
            self.active_sessions[session_id]["updated_at"] = time.time()
            self._save_session(session_id)

    def _save_session(self, session_id: str):
        """Persist session to disk"""
        if session_id in self.active_sessions:
            file_path = SESSION_DIR / f"session_{session_id}.json"
            file_path.write_text(json.dumps(self.active_sessions[session_id], indent=2), encoding='utf-8')

# Global instance
session_service = SessionService()
