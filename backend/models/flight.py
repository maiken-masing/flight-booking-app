from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class Flight(BaseModel):
    """
    This is our Flight model - it describes what information a flight has
    
    Think of it like a form that must be filled out for each flight
    """
    id: int  # A unique number for each flight
    flight_number: str  # Like "FL123"
    origin: str  # Where the flight starts (like "Tallinn")
    destination: str  # Where the flight goes (like "London")
    departure_date: date  # When the flight leaves (like "2025-04-15")
    departure_time: time  # What time the flight leaves (like "08:30:00")
    arrival_date: date  # When the flight arrives (like "2025-04-15") 
    arrival_time: time  # What time the flight arrives (like "10:45:00")
    price: float  # How much the flight costs (like 199.99)
    aircraft_type: str  # What kind of airplane (like "A320")
    available_seats: int  # How many seats are still free

class FlightFilter(BaseModel):
    """
    This helps us search for flights
    
    It's like the filters you use when shopping online
    """
    destination: Optional[str] = None  # Where you want to go
    departure_date: Optional[date] = None  # When you want to leave
    max_price: Optional[float] = None  # The most you want to pay
    min_departure_time: Optional[time] = None  # The earliest time you want to leave
    max_departure_time: Optional[time] = None  # The latest time you want to leave
