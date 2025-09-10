# Entry point for API backend


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import queries_router, feedback_router, escalation_router, health_router, crop_router, schemes_router

app = FastAPI(
    title="Krishi Jyoti API",
    description="AI-Powered Agricultural Advisory System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(queries_router)
app.include_router(feedback_router)
app.include_router(escalation_router)
app.include_router(health_router)
app.include_router(crop_router)
app.include_router(schemes_router)

@app.get("/")
def read_root():
    return {"message": "Krishi Jyoti API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "krishi-jyoti-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
