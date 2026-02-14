import sys
import os

# Add the current 'api' directory to sys.path so 'app' can be imported
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from app.main import app
