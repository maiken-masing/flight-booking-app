# Flight Booking Application Documentation

## Overview

This application is designed for flight searching and seat booking. The application allows users to search for flights by destination, date, time, and price, and receive seat recommendations according to preferences (window seat, legroom, evacuation route proximity, adjacent seats).

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python 3.12 with FastAPI framework
- **Version Control**: Git

## Running the Application

### Prerequisites
- Python 3.12 or newer
- Git

### Steps to Run the Application

1. Clone the repository:
   ```
   git clone <repository-URL>
   cd <project-folder>
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```
   uvicorn backend.app:app --reload
   ```
   
   The backend server will be available at: http://localhost:8000

4. Start the frontend server (in a separate terminal):
   ```
   python -m http.server 8080 -d frontend
   ```
   
   The frontend will be accessible at: http://localhost:8080

5. Open a web browser and navigate to `http://localhost:8080`

## Project Structure

- `/backend` - Python FastAPI backend
  - `/models` - Data models
  - `/services` - Business logic
  - `/traffic_controllers` - API endpoints
- `/data` - Sample data
- `/frontend` - Web user interface (HTML, CSS, JS)
  - `/css` - CSS files
  - `/js` - JavaScript files

## Development Process

### Development with Windsurf

This entire application was developed using Windsurf, the world's first agentic IDE, which utilizes AI Flow paradigm. Development was done exclusively through prompts, allowing for a conversational and intuitive approach to coding.

While Windsurf provides powerful AI assistance, successful development still required significant expertise in prompt engineering and technical understanding. The quality of the final application reflects both the tool's capabilities and the developer's skill. Effective development demanded well-crafted prompts, critical evaluation of generated code, and strategic problem decomposition.

### Challenges

During development, I encountered the following challenges:
1. **Creating the seat recommendation algorithm**: The algorithm had to consider multiple parameters simultaneously (window seat, legroom, evacuation route proximity, adjacent seating).
   * Solution: I created a prioritization strategy that considers all parameters and assigns a score to each seat.

2. **Frontend and backend integration**: Processing API requests in JavaScript and correctly displaying data in the user interface.
   * Solution: I used async/await functionality with the fetch API and created a clear data structure for both sides.
