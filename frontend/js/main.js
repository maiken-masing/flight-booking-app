// Base URL for our API
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const searchForm = document.getElementById('search-form');
const flightResults = document.getElementById('flight-results');
const flightsContainer = document.getElementById('flights-container');
const seatSelection = document.getElementById('seat-selection');
const preferencesForm = document.getElementById('preferences-form');
const seatingMap = document.getElementById('seating-map');
const cabin = document.querySelector('.cabin');
const seatOptions = document.getElementById('seat-options');
const seatsContainer = document.getElementById('seats-container');
const destinationSelect = document.getElementById('destination');

// Current state
let currentFlightId = null;
let allSeats = [];
let allFlights = [];
let selectedFlight = null;
let recommendedSeats = [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize range input displays
    document.querySelectorAll('input[type="range"]').forEach(range => {
        const valueDisplay = range.nextElementSibling;
        valueDisplay.textContent = `${Math.round(range.value * 100)}%`;
        
        range.addEventListener('input', () => {
            valueDisplay.textContent = `${Math.round(range.value * 100)}%`;
        });
    });
    
    // Load all flights when the page loads
    loadAllFlights();
    
    // Search form submission
    searchForm.addEventListener('submit', handleSearchSubmit);
    
    // Preferences form submission
    preferencesForm.addEventListener('submit', handlePreferencesSubmit);
});

// Function to load all flights when the page loads
async function loadAllFlights() {
    try {
        // Fetch all flights from API
        const response = await fetch(`${API_BASE_URL}/flights`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        allFlights = await response.json();
        
        // Populate destination dropdown
        populateDestinationDropdown(allFlights);
        
        // Display all flights
        displayFlights(allFlights);
    } catch (error) {
        console.error('Error fetching flights:', error);
        flightsContainer.innerHTML = '<p>Failed to load flights. Please try again later.</p>';
    }
}

// Function to populate the destination dropdown
function populateDestinationDropdown(flights) {
    // Get unique destinations
    const destinations = [...new Set(flights.map(flight => flight.destination))].sort();
    
    // Add options to the dropdown
    destinations.forEach(destination => {
        const option = document.createElement('option');
        option.value = destination;
        option.textContent = destination;
        destinationSelect.appendChild(option);
    });
}

// Handle flight search form submission
async function handleSearchSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const destination = document.getElementById('destination').value;
    const departureDate = document.getElementById('departure-date').value;
    const maxPrice = document.getElementById('max-price').value;
    
    // Build query parameters
    let queryParams = [];
    if (destination) queryParams.push(`destination=${encodeURIComponent(destination)}`);
    if (departureDate) queryParams.push(`departure_date=${encodeURIComponent(departureDate)}`);
    if (maxPrice) queryParams.push(`max_price=${encodeURIComponent(maxPrice)}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
    try {
        // Fetch flights from API
        const response = await fetch(`${API_BASE_URL}/flights${queryString}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const flights = await response.json();
        displayFlights(flights);
    } catch (error) {
        console.error('Error fetching flights:', error);
        alert('Failed to fetch flights. Please try again later.');
    }
}

// Display flights in the UI
function displayFlights(flights) {
    // Clear previous results
    flightsContainer.innerHTML = '';
    
    if (flights.length === 0) {
        flightsContainer.innerHTML = '<p>No flights found matching your criteria.</p>';
    } else {
        flights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.className = 'flight-card';
            
            // Format dates and times
            const departureDate = new Date(flight.departure_date + 'T' + flight.departure_time);
            const arrivalDate = new Date(flight.arrival_date + 'T' + flight.arrival_time);
            
            flightCard.innerHTML = `
                <h3>${flight.origin} to ${flight.destination}</h3>
                <div class="flight-details">
                    <p><strong>Flight:</strong> ${flight.flight_number}</p>
                    <p><strong>Departure:</strong> ${departureDate.toLocaleString()}</p>
                    <p><strong>Arrival:</strong> ${arrivalDate.toLocaleString()}</p>
                    <p><strong>Aircraft:</strong> ${flight.aircraft_type}</p>
                    <p><strong>Available Seats:</strong> ${flight.available_seats}</p>
                </div>
                <div class="flight-price">€${flight.price.toFixed(2)}</div>
                <button class="select-flight-btn" data-flight-id="${flight.id}">Select Flight</button>
            `;
            
            flightsContainer.appendChild(flightCard);
            
            // Add event listener to the select button
            const selectButton = flightCard.querySelector('.select-flight-btn');
            selectButton.addEventListener('click', () => selectFlight(flight.id));
        });
    }
    
    // Show the results section
    flightResults.classList.remove('hidden');
}

// Handle flight selection
async function selectFlight(flightId) {
    currentFlightId = flightId;
    
    try {
        // Fetch seats for this flight
        const response = await fetch(`${API_BASE_URL}/seats/${flightId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        allSeats = await response.json();
        
        // Store the selected flight in our state
        selectedFlight = allFlights.find(flight => flight.id === flightId);
        
        // Change the heading from "Available Flights" to "Chosen Flight"
        const flightResultsHeading = document.querySelector('#flight-results h2');
        flightResultsHeading.textContent = 'Chosen Flight';
        
        // Hide all other flights and show only the selected one
        const allFlightCards = document.querySelectorAll('.flight-card');
        allFlightCards.forEach(card => {
            const cardFlightId = parseInt(card.querySelector('.select-flight-btn').dataset.flightId);
            if (cardFlightId !== flightId) {
                card.style.display = 'none';
            } else {
                // Update the selected flight card
                const selectButton = card.querySelector('.select-flight-btn');
                selectButton.textContent = 'Selected';
                selectButton.classList.add('selected');
                selectButton.disabled = true;
                
                // Add a "Change Flight" button next to "Selected"
                const changeFlightButton = document.createElement('button');
                changeFlightButton.textContent = 'Change Flight';
                changeFlightButton.className = 'change-flight-btn';
                changeFlightButton.addEventListener('click', resetFlightSelection);
                
                // Insert the change flight button after the select button
                selectButton.parentNode.insertBefore(changeFlightButton, selectButton.nextSibling);
            }
        });
        
        // Show seat selection section
        seatSelection.classList.remove('hidden');
        
        // Scroll to seat selection
        seatSelection.scrollIntoView({ behavior: 'smooth' });
        
        // Hide recommendations and seating map until preferences are submitted
        seatOptions.classList.add('hidden');
        seatingMap.classList.add('hidden');
    } catch (error) {
        console.error('Error fetching seats:', error);
        alert('Failed to fetch seat information. Please try again later.');
    }
}

// Reset flight selection to show all flights again
function resetFlightSelection() {
    // Change the heading back to "Available Flights"
    const flightResultsHeading = document.querySelector('#flight-results h2');
    flightResultsHeading.textContent = 'Available Flights';
    
    // Show all flight cards again
    const allFlightCards = document.querySelectorAll('.flight-card');
    allFlightCards.forEach(card => {
        card.style.display = 'block';
        const selectButton = card.querySelector('.select-flight-btn');
        selectButton.textContent = 'Select Flight';
        selectButton.classList.remove('selected');
        selectButton.disabled = false;
        
        // Remove the change flight button
        const changeFlightButton = card.querySelector('.change-flight-btn');
        if (changeFlightButton) {
            changeFlightButton.remove();
        }
    });
    
    // Hide seat selection and related sections
    seatSelection.classList.add('hidden');
    seatOptions.classList.add('hidden');
    seatingMap.classList.add('hidden');
    
    // Reset current flight id and selected flight
    currentFlightId = null;
    selectedFlight = null;
}

// Handle seat preferences form submission
async function handlePreferencesSubmit(event) {
    event.preventDefault();
    
    if (!currentFlightId) {
        alert('Please select a flight first.');
        return;
    }
    
    // Get form values
    const windowPreference = parseFloat(document.getElementById('window-preference').value);
    const legroomPreference = parseFloat(document.getElementById('legroom-preference').value);
    const exitProximityPreference = parseFloat(document.getElementById('exit-proximity-preference').value);
    const passengerCount = parseInt(document.getElementById('passenger-count').value);
    const adjacentSeats = document.getElementById('adjacent-seats').checked;
    
    // Create preferences object
    const preferences = {
        window_preference: windowPreference,
        legroom_preference: legroomPreference,
        exit_proximity_preference: exitProximityPreference,
        passenger_count: passengerCount,
        adjacent_seats: adjacentSeats,
        // Request 10 recommendations instead of 5
        limit: 10
    };
    
    try {
        // Fetch seat recommendations
        const response = await fetch(`${API_BASE_URL}/seats/${currentFlightId}/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const recommendations = await response.json();
        displayRecommendations(recommendations);
        displaySeatingMap(recommendations);
    } catch (error) {
        console.error('Error fetching seat options:', error);
        alert('Failed to get seat options. Please try again later.');
    }
}

// Display seat options
function displayRecommendations(recommendations) {
    // Clear previous seat options
    seatsContainer.innerHTML = '';
    
    if (recommendations.length === 0) {
        seatsContainer.innerHTML = '<p>No suitable seats found based on your preferences.</p>';
    } else {
        // Create and append seat option cards directly to the container
        recommendations.sort((a, b) => b.score - a.score);
        
        recommendations.forEach((recommendation, index) => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            
            // Get seat IDs and labels
            const seatLabels = recommendation.seats.map(seat => 
                `${seat.location.row}${seat.location.column}`
            ).join(', ');
            
            // Calculate score as percentage
            const scorePercent = Math.round(recommendation.score * 100);
            
            // Determine if these are adjacent seats
            const adjacentSeatsText = recommendation.seats.length > 1 && 
                recommendation.seats.every(seat => seat.location.row === recommendation.seats[0].location.row) ? 
                '<span class="adjacent-tag">Adjacent Seats</span>' : '';
            
            card.innerHTML = `
                <h4>Option ${index + 1}</h4>
                <div class="recommendation-details">
                    <p><strong>Seats:</strong> ${seatLabels} ${adjacentSeatsText}</p>
                    <p><strong>Match Score:</strong> ${scorePercent}%</p>
                    <p><strong>Features:</strong></p>
                    <ul>
                        ${recommendation.seats.some(s => s.type.includes('window')) ? '<li>Window seat(s)</li>' : ''}
                        ${recommendation.seats.some(s => s.type.includes('exit_row')) ? '<li>Exit row access</li>' : ''}
                        ${recommendation.seats.some(s => s.type.includes('extra_legroom')) ? '<li>Extra legroom</li>' : ''}
                        ${recommendation.seats.length > 1 ? '<li>Multiple seats</li>' : ''}
                    </ul>
                    <button class="select-seats-btn">Select Seat(s)</button>
                </div>
            `;
            
            // Add event listener for selecting seats
            const selectButton = card.querySelector('.select-seats-btn');
            selectButton.addEventListener('click', () => {
                // Just use the original seats data without conversion
                recommendedSeats = recommendation.seats;
                highlightRecommendedSeats(recommendation.seats);
                
                // Make sure seating map is visible
                seatingMap.classList.remove('hidden');
                
                // Scroll to the seating map
                seatingMap.scrollIntoView({ behavior: 'smooth' });
            });
            
            seatsContainer.appendChild(card);
        });
    }
    
    // Show the seat options section
    seatOptions.classList.remove('hidden');
    
    // Scroll to seat options section
    seatOptions.scrollIntoView({ behavior: 'smooth' });
}

// Display seating map
function displaySeatingMap(recommendations) {
    // Clear previous seating map
    cabin.innerHTML = '';
    
    // Find all unique rows
    const rows = [...new Set(allSeats.map(seat => seat.location.row))].sort((a, b) => a - b);
    
    // Find all unique columns
    const columns = [...new Set(allSeats.map(seat => seat.location.column))].sort();
    
    // Create a map of recommended seats for easy lookup
    const recommendedSeats = new Map();
    recommendations.forEach(rec => {
        rec.seats.forEach(seat => {
            const key = `${seat.location.row}${seat.location.column}`;
            recommendedSeats.set(key, seat);
        });
    });
    
    // Create an array to store our selected seats
    let userSelectedSeats = [];
    
    // Create rows
    rows.forEach(rowNum => {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        
        // Add row number
        const rowNumberElement = document.createElement('div');
        rowNumberElement.className = 'row-number';
        rowNumberElement.textContent = rowNum;
        rowElement.appendChild(rowNumberElement);
        
        // Add seats container
        const seatsElement = document.createElement('div');
        seatsElement.className = 'seats';
        
        // Add seats for this row
        columns.forEach(col => {
            // Find the seat in our data
            const seat = allSeats.find(s => 
                s.location.row === rowNum && s.location.column === col
            );
            
            // If seat exists, add it
            if (seat) {
                const seatElement = document.createElement('div');
                seatElement.className = `seat ${seat.status.toLowerCase()}`;
                seatElement.textContent = col;
                
                // Add data attributes for row and column
                seatElement.dataset.row = rowNum;
                seatElement.dataset.column = col;
                seatElement.dataset.seatId = `${rowNum}${col}`;
                
                // Check if this is a recommended seat
                const seatKey = `${rowNum}${col}`;
                if (recommendedSeats.has(seatKey)) {
                    seatElement.classList.add('recommended');
                }
                
                // Add seat types as data attributes
                seat.type.forEach(type => {
                    seatElement.dataset[type] = true;
                });
                
                // Make available seats clickable
                if (seat.status.toLowerCase() === 'available') {
                    seatElement.classList.add('clickable');
                    
                    // Add click event listener
                    seatElement.addEventListener('click', () => {
                        // Toggle selection
                        if (seatElement.classList.contains('selected')) {
                            seatElement.classList.remove('selected');
                            // Remove from selected seats
                            userSelectedSeats = userSelectedSeats.filter(s => 
                                !(s.location.row === rowNum && s.location.column === col)
                            );
                        } else {
                            // Check if we've reached the passenger count limit
                            const passengerCount = parseInt(document.getElementById('passenger-count').value);
                            
                            // If we already have enough seats selected, deselect the oldest one
                            if (userSelectedSeats.length >= passengerCount) {
                                // Find the oldest selected seat element and deselect it
                                const oldestSeat = userSelectedSeats[0];
                                const oldestSeatElement = document.querySelector(`.seat[data-row="${oldestSeat.location.row}"][data-column="${oldestSeat.location.column}"]`);
                                if (oldestSeatElement) {
                                    oldestSeatElement.classList.remove('selected');
                                }
                                
                                // Remove the oldest seat from our array
                                userSelectedSeats.shift();
                            }
                            
                            // Add the new seat
                            seatElement.classList.add('selected');
                            userSelectedSeats.push({...seat}); // Create a deep copy of the seat object
                        }
                        
                        // Log the current state of selected seats for debugging
                        console.log('Current user selected seats:', JSON.stringify(userSelectedSeats));
                        
                        // Store the selected seats in localStorage
                        const flight = allFlights.find(f => f.id === currentFlightId);
                        if (flight) {
                            const passengerCount = parseInt(document.getElementById('passenger-count').value);
                            
                            // Make sure we only store the most recent selections up to the passenger count
                            const selectedSeats = userSelectedSeats.slice(-passengerCount);  // Get only the most recent selections
                            
                            const bookingData = {
                                flight: flight,
                                seats: selectedSeats,
                                timestamp: new Date().toISOString()
                            };
                            
                            localStorage.setItem('bookingData', JSON.stringify(bookingData));
                            console.log('Booking data updated with user-selected seats:', JSON.stringify(selectedSeats));
                        }
                    });
                }
                
                // Add seat to row
                seatsElement.appendChild(seatElement);
                
                // Add aisle spacing based on aircraft configuration
                if ((col === 'C' && columns.includes('D')) || 
                    (col === 'F' && columns.includes('G'))) {
                    const aisleElement = document.createElement('div');
                    aisleElement.className = 'aisle';
                    seatsElement.appendChild(aisleElement);
                }
            }
        });
        
        rowElement.appendChild(seatsElement);
        cabin.appendChild(rowElement);
    });
    
    // Show the seating map
    seatingMap.classList.remove('hidden');
}

// Highlight recommended seats on the map
function highlightRecommendedSeats(seats) {
    // Reset all seats
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    
    // Highlight the selected seats
    seats.forEach(seat => {
        // Find the seat element using the data attributes we added
        const seatElement = document.querySelector(
            `.seat[data-seat-id="${seat.location.row}${seat.location.column}"]`
        );
        
        if (seatElement) {
            seatElement.classList.add('selected');
        } else {
            console.log(`Could not find seat element for ${seat.location.row}${seat.location.column}`);
        }
    });
}

// Handle confirm booking
function handleConfirmBooking() {
    // Check if we have a selected flight and seats
    if (!currentFlightId) {
        alert('Please select a flight first.');
        return;
    }
    
    // Get the passenger count
    const passengerCount = parseInt(document.getElementById('passenger-count').value);
    
    // Check if we have enough selected seats
    if (userSelectedSeats.length < passengerCount) {
        alert(`Please select ${passengerCount} seats before confirming your booking.`);
        return;
    }
    
    // Make sure we only use the most recent selections up to the passenger count
    const selectedSeats = userSelectedSeats.slice(-passengerCount);
    
    // Find the selected flight details
    const flight = allFlights.find(f => f.id === currentFlightId);
    if (!flight) {
        alert('Flight information not found. Please try again.');
        return;
    }
    
    // Create booking data object with the user's selected seats from the seating map
    const bookingData = {
        flight: flight,
        seats: selectedSeats,
        timestamp: new Date().toISOString()
    };
    
    // Save booking data to localStorage
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    console.log('Booking data saved to localStorage for confirmation:', selectedSeats);
    
    // Redirect to confirmation page
    window.location.href = 'confirmation.html';
}
