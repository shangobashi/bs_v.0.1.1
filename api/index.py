from os.path import dirname, join, abspath
import sys

# Add the backend directory to sys.path
sys.path.append(abspath(join(dirname(__file__), '..', 'backend')))

from app.main import app

# This is required for Vercel
# Vercel looks for a variable named 'app' or 'handler'
