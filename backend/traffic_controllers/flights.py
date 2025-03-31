from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import date, time
import logging

from models.flight import Flight, FlightFilter
from services.flight_service import get_all_flights, get_flight_by_id, filter_flights

router = APIRouter()

@router.get("/", response_model=List[Flight])
async def list_flights(
    destination: Optional[str] = None,
    departure_date: Optional[date] = None,
    max_price: Optional[float] = None,
    min_departure_time: Optional[time] = None,
    max_departure_time: Optional[time] = None
):
    filters = FlightFilter(
        destination=destination,
        departure_date=departure_date,
        max_price=max_price,
        min_departure_time=min_departure_time,
        max_departure_time=max_departure_time
    )
    
    flights = await filter_flights(filters)
    return flights

@router.get("/{flight_id}", response_model=Flight)
async def get_flight(flight_id: int):
    flight = await get_flight_by_id(flight_id)
    
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    return flight
