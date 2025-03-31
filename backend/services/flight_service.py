from typing import List, Optional
from datetime import date, time, datetime
import json
import os
from models.flight import Flight, FlightFilter

# Path to sample flights data
FLIGHTS_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
"data", "sample_flights.json")

async def get_all_flights() -> List[Flight]:
    with open(FLIGHTS_DATA_PATH, 'r') as f:
        flights_data = json.load(f)
    
    flights = []
    
    for flight_dict in flights_data:
        flight_object = Flight(**flight_dict)
        flights.append(flight_object)
    
    return flights

async def get_flight_by_id(flight_id: int) -> Optional[Flight]:
    flights = await get_all_flights()
    for flight in flights:
        if flight.id == flight_id:
            return flight
    return None

async def filter_flights(filters: FlightFilter) -> List[Flight]:
    all_flights = await get_all_flights()
    filtered_flights = []
    
    for flight in all_flights:
        matches = True
        
        if filters.destination and filters.destination.lower() != flight.destination.lower():
            matches = False
        
        if filters.departure_date and filters.departure_date != flight.departure_date:
            matches = False
        
        if filters.max_price and flight.price > filters.max_price:
            matches = False
        
        if filters.min_departure_time and flight.departure_time < filters.min_departure_time:
            matches = False
        if filters.max_departure_time and flight.departure_time > filters.max_departure_time:
            matches = False
        
        if matches:
            filtered_flights.append(flight)
    
    return filtered_flights
