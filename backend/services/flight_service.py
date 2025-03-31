from typing import List, Optional
from datetime import date, time, datetime
import json
import os
from models.flight import Flight, FlightFilter

# This is where we'll store our sample flights data
FLIGHTS_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
"data", "sample_flights.json")

async def get_all_flights() -> List[Flight]:
    """
    Gets all available flights

    It's like asking 'show me all the flights you have'
    """
    # Read flights from our data file
    # 'with' ensures the file is properly closed
    # This is like opening a book, reading it, and making sure to close it afterward
    with open(FLIGHTS_DATA_PATH, 'r') as f:
        # json.load converts the JSON text into Python dictionaries and lists
        # It's like translating from one language (JSON) to another (Python)
        flights_data = json.load(f)
    
    # Convert the data into Flight objects
    # We'll create Flight objects step by step:
    
    # Initialize an empty list to store our Flight objects
    flights = []
    
    # Loop/iterate through each flight dictionary in the data
    for flight_dict in flights_data:
        # Create a Flight object from each dictionary
        # The ** operator unpacks the dictionary into keyword arguments
        
        flight_object = Flight(**flight_dict)
        
        # Add the newly created Flight object to our list
        flights.append(flight_object)
    
    return flights

async def get_flight_by_id(flight_id: int) -> Optional[Flight]:
    """
    Find a specific flight by its ID
    
    Like finding one specific book on a bookshelf by its code
    """
    flights = await get_all_flights()
    for flight in flights:
        if flight.id == flight_id:
            return flight
    return None

async def filter_flights(filters: FlightFilter) -> List[Flight]:
    """
    Find flights that match what the user is looking for
    
    Like filtering products when shopping online
    """
    all_flights = await get_all_flights()
    filtered_flights = []
    
    for flight in all_flights:
        # Check if this flight matches all the filters
        matches = True
        
        # Filter by destination if specified
        if filters.destination and filters.destination.lower() != flight.destination.lower():
            matches = False
        
        # Filter by departure date if specified
        if filters.departure_date and filters.departure_date != flight.departure_date:
            matches = False
        
        # Filter by price if specified
        if filters.max_price and flight.price > filters.max_price:
            matches = False
        
        # Filter by departure time range if specified
        if filters.min_departure_time and flight.departure_time < filters.min_departure_time:
            matches = False
        if filters.max_departure_time and flight.departure_time > filters.max_departure_time:
            matches = False
        
        # If the flight matches all filters, add it to our results
        if matches:
            filtered_flights.append(flight)
    
    return filtered_flights
