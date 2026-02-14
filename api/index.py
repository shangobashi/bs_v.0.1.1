import sys
import os

# Add the parent directory and backend directory to sys.path
# This allows importing 'app' from the 'backend' folder
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(parent_dir, "backend")

sys.path.append(parent_dir) # For root level imports if any
sys.path.append(backend_dir) # For 'app.main'

try:
    from app.main import app
except ImportError as e:
    print(f"Import error: {e}")
    # Try alternate path if Vercel structure is different
    sys.path.append(os.path.join(current_dir, "backend"))
    from app.main import app
