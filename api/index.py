from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os
import traceback

try:
    # Add the backend directory to sys.path
    backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
    sys.path.append(backend_path)

    from app.main import app

except Exception as e:
    # Fallback app to report startup error
    app = FastAPI()
    
    @app.get("/{path:path}")
    async def catch_all(path: str):
        # List context to help debug
        root_files = os.listdir('.') if os.path.exists('.') else []
        backend_files = []
        if os.path.exists(backend_path):
             backend_files = [f for f in os.listdir(backend_path)]
             
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend Startup Failed",
                "detail": str(e),
                "traceback": traceback.format_exc(),
                "debug_info": {
                    "cwd": os.getcwd(),
                    "backend_path": backend_path,
                    "backend_exists": os.path.exists(backend_path),
                    "root_files": root_files,
                    "backend_files": backend_files,
                    "sys_path": sys.path
                }
            }
        )
