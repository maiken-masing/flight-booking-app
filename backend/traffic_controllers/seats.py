from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict
import logging

from models.seat import Seat, SeatPreference
from services.seat_service import get_seats_for_flight, get_seat_recommendations

# Create a router for all seat-related requests
router = APIRouter()

# This route gets all seats for a specific flight
@router.get("/{flight_id}", response_model=List[Seat])
async def list_seats(flight_id: int):
    """
    GET all seats for a specific flight
    
    Think of this as getting a seating chart for a specific movie showing
    
    Example: GET /api/seats/123
    """
    # Use our service to get all seats for this flight
    seats = await get_seats_for_flight(flight_id)
    
    # If no seats were found, send back an error
    if not seats:
        raise HTTPException(status_code=404, detail="No seats found for this flight")
    
    # Return the list of seats
    return seats

# This route gets seat recommendations based on preferences
# The Body(...) means the preferences will come from the request body (as JSON)
@router.post("/{flight_id}/recommendations", response_model=List[Dict])
async def recommend_seats(
    flight_id: int, 
    preferences: SeatPreference = Body(...)
):
    """
    POST passenger preferences to get seat recommendations
    
    This is like telling a waiter what kind of table you prefer at a restaurant
    
    Example: POST /api/seats/123/recommendations
    With body: {
      "window_preference": 0.8,
      "legroom_preference": 0.6,
      "exit_proximity_preference": 0.3,
      "passenger_count": 2,
      "adjacent_seats": true
    }
    """
    # Use our service to get recommendations based on these preferences
    recommendations = await get_seat_recommendations(flight_id, preferences)
    
    # If we couldn't generate recommendations, send back an error
    if not recommendations:
        raise HTTPException(status_code=404, detail="Could not generate recommendations")
    
    # Return the recommendations
    return recommendations
