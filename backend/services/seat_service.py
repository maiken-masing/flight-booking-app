from typing import List, Optional, Dict, Tuple
import json
import os
import random
from models.seat import Seat, SeatType, SeatStatus, SeatLocation, SeatPreference

# Path to seat data storage
SEATS_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                               "data", "seats")

async def get_seats_for_flight(flight_id: int) -> List[Seat]:
    os.makedirs(SEATS_DATA_PATH, exist_ok=True)
    
    flight_seats_path = os.path.join(SEATS_DATA_PATH, f"flight_{flight_id}_seats.json")
    
    if not os.path.exists(flight_seats_path):
        seats = generate_seats_for_flight(flight_id)
        
        with open(flight_seats_path, 'w') as f:
            seat_dicts = [seat.dict() for seat in seats]
            json.dump(seat_dicts, f, indent=2)
    else:
        with open(flight_seats_path, 'r') as f:
            seat_dicts = json.load(f)
            seats = [Seat(**seat_dict) for seat_dict in seat_dicts]
    
    return seats

async def get_seat_recommendations(flight_id: int, preferences: SeatPreference) -> List[Dict]:
    all_seats = await get_seats_for_flight(flight_id)
    
    available_seats = [seat for seat in all_seats if seat.status == SeatStatus.AVAILABLE]
    
    if not available_seats:
        return []
    
    seat_scores = []
    for seat in available_seats:
        score = calculate_seat_score(seat, preferences)
        seat_scores.append((seat, score))
    
    seat_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Handle group bookings with adjacent seats requirement
    if preferences.passenger_count > 1 and preferences.adjacent_seats:
        adjacent_recommendations = find_adjacent_seats(all_seats, seat_scores, preferences)
        if hasattr(preferences, 'limit') and preferences.limit > 3:
            return adjacent_recommendations[:preferences.limit]
        return adjacent_recommendations
    
    recommendations = []
    
    limit = preferences.limit if hasattr(preferences, 'limit') else 3
    
    for i in range(min(limit, len(seat_scores))):
        seat, score = seat_scores[i]
        reason = generate_recommendation_reason(seat, score, preferences)
        
        recommendations.append({
            "seats": [seat],
            "score": score,
            "reason": reason
        })
    
    return recommendations

def calculate_seat_score(seat: Seat, preferences: SeatPreference) -> float:
    score = 0.0
    
    if SeatType.WINDOW in seat.type:
        score += preferences.window_preference
    
    if SeatType.EXIT_ROW in seat.type or SeatType.EXTRA_LEGROOM in seat.type:
        score += preferences.legroom_preference
    
    exit_score = 1.0 / (1.0 + seat.exit_proximity)
    score += exit_score * preferences.exit_proximity_preference
    
    return score

def find_adjacent_seats(all_seats: List[Seat], scored_seats: List[Tuple[Seat, float]], 
                        preferences: SeatPreference) -> List[Dict]:
    seat_map = {}
    for seat in all_seats:
        seat_map[(seat.location.row, seat.location.column)] = seat
    
    seat_groups = []
    
    available_seats = [seat for seat, _ in scored_seats]
    available_seats.sort(key=lambda s: (s.location.row, s.location.column))
    
    # Group adjacent seats by row
    current_row = None
    current_group = []
    
    for seat in available_seats:
        if current_row != seat.location.row:
            if len(current_group) >= preferences.passenger_count:
                seat_groups.append(current_group.copy())
            
            current_row = seat.location.row
            current_group = [seat]
        else:
            last_seat = current_group[-1]
            if ord(seat.location.column) == ord(last_seat.location.column) + 1:
                current_group.append(seat)
            else:
                if len(current_group) >= preferences.passenger_count:
                    seat_groups.append(current_group.copy())
                
                current_group = [seat]
    
    if len(current_group) >= preferences.passenger_count:
        seat_groups.append(current_group)
    
    # Score the seat groups
    group_scores = []
    for group in seat_groups:
        selected_group = group[:preferences.passenger_count]
        
        total_score = sum(calculate_seat_score(seat, preferences) for seat in selected_group)
        avg_score = total_score / len(selected_group)
        
        group_scores.append((selected_group, avg_score))
    
    group_scores.sort(key=lambda x: x[1], reverse=True)
    
    recommendations = []
    
    for i in range(min(3, len(group_scores))):
        group, score = group_scores[i]
        
        if len(group) > 1:
            reason = f"These {len(group)} seats are adjacent in row {group[0].location.row}, "
            reason += generate_group_recommendation_reason(group, score, preferences)
        else:
            reason = generate_recommendation_reason(group[0], score, preferences)
        
        recommendations.append({
            "seats": group,
            "score": score,
            "reason": reason
        })
    
    return recommendations

def generate_recommendation_reason(seat: Seat, score: float, preferences: SeatPreference) -> str:
    reasons = []
    
    if SeatType.WINDOW in seat.type and preferences.window_preference > 0.5:
        reasons.append("it's a window seat")
    elif SeatType.AISLE in seat.type:
        reasons.append("it's an aisle seat with easy access")
    
    if SeatType.EXIT_ROW in seat.type and preferences.legroom_preference > 0.5:
        reasons.append("it's in an exit row with extra legroom")
    elif SeatType.EXTRA_LEGROOM in seat.type and preferences.legroom_preference > 0.5:
        reasons.append("it has extra legroom")
    
    if preferences.exit_proximity_preference > 0.5 and seat.exit_proximity < 3:
        reasons.append("it's close to an exit")
    
    if not reasons:
        return "This seat is a good match for your preferences."
    
    if len(reasons) == 1:
        return f"This seat is recommended because {reasons[0]}."
    else:
        last_reason = reasons.pop()
        return f"This seat is recommended because {', '.join(reasons)} and {last_reason}."

def generate_group_recommendation_reason(seats: List[Seat], score: float, preferences: SeatPreference) -> str:
    reasons = []
    
    if any(SeatType.WINDOW in seat.type for seat in seats) and preferences.window_preference > 0.5:
        reasons.append("includes a window seat")
    
    if any(SeatType.EXIT_ROW in seat.type or SeatType.EXTRA_LEGROOM in seat.type for seat in seats) and preferences.legroom_preference > 0.5:
        reasons.append("offers extra legroom")
    
    if preferences.exit_proximity_preference > 0.5 and any(seat.exit_proximity < 3 for seat in seats):
        reasons.append("close to an exit")
    
    if not reasons:
        return "These seats are a good match for your group."
    
    if len(reasons) == 1:
        return f"and {reasons[0]}."
    else:
        last_reason = reasons.pop()
        return f"and {', '.join(reasons)} and {last_reason}."

def generate_seats_for_flight(flight_id: int) -> List[Seat]:
    seats = []
    
    aircraft_types = ["A320", "B737", "A330", "B777", "E190"]
    aircraft_type = aircraft_types[flight_id % len(aircraft_types)]
    
    if aircraft_type in ["A320", "B737"]:
        rows = range(1, 31)
        columns = ["A", "B", "C", "D", "E", "F"]
        exit_rows = [1, 16]
    elif aircraft_type in ["A330", "B777"]:
        rows = range(1, 41)
        columns = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"]
        exit_rows = [1, 15, 30]
    else:  
        rows = range(1, 21)
        columns = ["A", "B", "C", "D"]
        exit_rows = [1, 10]
    
    seat_id = 1
    
    for row in rows:
        for col in columns:
            seat_types = []
            
            if col in ["A", "F"] or (aircraft_type in ["A330", "B777"] and col in ["A", "J"]) or (columns == ["A", "B", "C", "D"] and col in ["A", "D"]):
                seat_types.append(SeatType.WINDOW)
            elif col in ["C", "D"] or (aircraft_type in ["A330", "B777"] and col in ["C", "G"]) or (columns == ["A", "B", "C", "D"] and col in ["B", "C"]):
                seat_types.append(SeatType.MIDDLE)
            else:
                seat_types.append(SeatType.AISLE)
            
            if row in exit_rows:
                seat_types.append(SeatType.EXIT_ROW)
                
            if row <= 3:  
                seat_types.append(SeatType.EXTRA_LEGROOM)
                
            exit_proximity = min([abs(row - exit_row) for exit_row in exit_rows])
            
            seat = Seat(
                id=seat_id,
                flight_id=flight_id,
                location=SeatLocation(row=row, column=col),
                type=seat_types,
                status=SeatStatus.AVAILABLE,
                exit_proximity=exit_proximity
            )
            
            seats.append(seat)
            seat_id += 1
    
    # Randomly mark ~10% of seats as occupied
    occupied_count = len(seats) // 10
    for _ in range(occupied_count):
        random_index = random.randint(0, len(seats) - 1)
        seats[random_index].status = SeatStatus.OCCUPIED
    
    return seats
