from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class SeatType(str, Enum):
    """
    These are the different types of seats on a plane
    
    Just like how movie theaters have regular seats and special seats
    """
    WINDOW = "window"  # Seats next to the window
    MIDDLE = "middle"  # Seats in the middle
    AISLE = "aisle"  # Seats next to the aisle
    EXIT_ROW = "exit_row"  # Seats in the emergency exit row (more legroom)
    EXTRA_LEGROOM = "extra_legroom"  # Seats with extra space for legs
    STANDARD = "standard"  # Regular seats


class SeatStatus(str, Enum):
    """
    This tells us if a seat is already taken or not
    
    Like when you go to a concert, some seats are already sold
    """
    AVAILABLE = "available"  # Nobody has this seat yet
    OCCUPIED = "occupied"  # Someone already has this seat


class SeatLocation(BaseModel):
    """
    This tells us exactly where a seat is in the airplane
    
    Like giving the address of a house
    """
    row: int  # Which row (like 15)
    column: str  # Which column (like A, B, C)


class Seat(BaseModel):
    """
    This is all the information about a single airplane seat
    
    Think of it like a detailed description of one chair
    """
    id: int  # A unique number for each seat
    flight_id: int  # Which flight this seat belongs to
    location: SeatLocation  # Where the seat is located
    type: List[SeatType]  # What kind of seat it is (could be multiple types)
    status: SeatStatus = SeatStatus.AVAILABLE  # Whether it's taken or not
    exit_proximity: int = 0  # How close it is to an exit (0 = at exit, higher = further)


class SeatPreference(BaseModel):
    """
    This is what the passenger wants in a seat
    
    Like telling a restaurant host what kind of table you prefer
    """
    window_preference: float = 0.0  # How much they want a window seat (0-1)
    legroom_preference: float = 0.0  # How much they want extra legroom (0-1)
    exit_proximity_preference: float = 0.0  # How close they want to be to an exit (0-1)
    passenger_count: int = 1  # How many people are traveling together
    adjacent_seats: bool = True  # Whether the seats need to be next to each other
    limit: int = 3  # How many recommendations to return (default 3)
