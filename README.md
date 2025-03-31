# Flight Booking Application

A web application for flight planning and seat recommendations.

## Features

- Search and filter flights by destination, date, time, price
- Get seat recommendations based on preferences (window seat, legroom, exit proximity, adjacent seats)
- View recommendations on an interactive airplane seating plan
- Book multiple seats at once

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python with FastAPI (with plans to migrate to Spring Boot with Java LTS)
- **Version Control**: Git

## Project Structure

- `/backend` - Python FastAPI backend
  - `/models` - Data models
  - `/services` - Business logic
  - `/traffic_controllers` - API endpoints
  - `/data` - Sample data
- `/frontend` - Web frontend (HTML, CSS, JS)

## Getting Started

1. Clone this repository
2. Install dependencies: `pip install -r requirements.txt`
3. Run the backend server: `uvicorn app:app --reload`
4. Open the frontend in your browser
