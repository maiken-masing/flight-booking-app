from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our controllers
from traffic_controllers.flights import router as flights_router
from traffic_controllers.seats import router as seats_router

app = FastAPI(
    title="Flight Booking Application",
    description="API for flight search and seat recommendations",
    version="0.1.0"
)

# Enable CORS - allows our frontend to safely communicate with our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"]
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Flight Booking API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Connect our controllers to specific URL paths
app.include_router(flights_router, prefix="/api/flights", tags=["flights"])
app.include_router(seats_router, prefix="/api/seats", tags=["seats"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)