from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict
import logging

from models.seat import Seat, SeatPreference
from services.seat_service import get_seats_for_flight, get_seat_recommendations

# Create a router for all seat-related requests
router = APIRouter()

@router.get("/{flight_id}", response_model=List[Seat])
async def list_seats(flight_id: int):
    seats = await get_seats_for_flight(flight_id)
    
    if not seats:
        raise HTTPException(status_code=404, detail="No seats found for this flight")
    
    return seats

@router.post("/{flight_id}/recommendations", response_model=List[Dict])
async def recommend_seats(
    flight_id: int, 
    preferences: SeatPreference = Body(...)
):
    # Get seat recommendations based on the passenger's preferences
    recommendations = await get_seat_recommendations(flight_id, preferences)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail="Could not generate recommendations for this flight")
    
    return recommendations
