from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class Flight(BaseModel):
    id: int
    flight_number: str
    origin: str
    destination: str
    departure_date: date
    departure_time: time
    arrival_date: date
    arrival_time: time
    price: float
    aircraft_type: str
    available_seats: int

class FlightFilter(BaseModel):
    destination: Optional[str] = None
    departure_date: Optional[date] = None
    max_price: Optional[float] = None
    min_departure_time: Optional[time] = None
    max_departure_time: Optional[time] = None
