from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class SeatType(str, Enum):
    WINDOW = "window"
    MIDDLE = "middle"
    AISLE = "aisle"
    EXIT_ROW = "exit_row"
    EXTRA_LEGROOM = "extra_legroom"
    STANDARD = "standard"


class SeatStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"


class SeatLocation(BaseModel):
    row: int
    column: str


class Seat(BaseModel):
    id: int
    flight_id: int
    location: SeatLocation
    type: List[SeatType]
    status: SeatStatus = SeatStatus.AVAILABLE
    exit_proximity: int = 0


class SeatPreference(BaseModel):
    window_preference: float = 0.0
    legroom_preference: float = 0.0
    exit_proximity_preference: float = 0.0
    passenger_count: int = 1
    adjacent_seats: bool = True
    limit: int = 3
