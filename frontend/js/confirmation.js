// DOM Elements
const flightNumber = document.getElementById('flight-number');
const flightOrigin = document.getElementById('flight-origin');
const flightDestination = document.getElementById('flight-destination');
const flightDeparture = document.getElementById('flight-departure');
const flightArrival = document.getElementById('flight-arrival');
const flightAircraft = document.getElementById('flight-aircraft');
const seatList = document.getElementById('seat-list');
const totalPrice = document.getElementById('total-price');
const printButton = document.getElementById('print-button');
const homeButton = document.getElementById('home-button');

document.addEventListener('DOMContentLoaded', () => {
    loadBookingDetails();
    
    printButton.addEventListener('click', printConfirmation);
    homeButton.addEventListener('click', returnToHome);
});

function loadBookingDetails() {
    const bookingData = JSON.parse(localStorage.getItem('bookingData'));
    
    console.log('Booking data loaded from localStorage:', bookingData);
    
    if (!bookingData) {
        window.location.href = 'index.html';
        return;
    }
    
    flightNumber.textContent = bookingData.flight.flight_number;
    flightOrigin.textContent = bookingData.flight.origin;
    flightDestination.textContent = bookingData.flight.destination;
    
    const departureDate = new Date(bookingData.flight.departure_date + 'T' + bookingData.flight.departure_time);
    const arrivalDate = new Date(bookingData.flight.arrival_date + 'T' + bookingData.flight.arrival_time);
    
    flightDeparture.textContent = departureDate.toLocaleString();
    flightArrival.textContent = arrivalDate.toLocaleString();
    flightAircraft.textContent = bookingData.flight.aircraft_type;
    
    populateSeatList(bookingData.seats);
    
    const seatPrice = bookingData.flight.price;
    const totalPriceValue = seatPrice * bookingData.seats.length;
    totalPrice.textContent = `€${totalPriceValue.toFixed(2)}`;
}

function populateSeatList(seats) {
    seatList.innerHTML = '';
    
    if (!seats || seats.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No seats selected';
        seatList.appendChild(listItem);
        return;
    }
    
    console.log('Seats data received:', seats);
    
    seats.forEach(seat => {
        if (!seat || !seat.location) {
            console.error('Invalid seat data:', seat);
            return;
        }
        
        const listItem = document.createElement('li');
        
        const seatLabel = `${seat.location.row}${seat.location.column}`;
        
        let seatFeatures = '';
        if (Array.isArray(seat.type)) {
            const features = [];
            if (seat.type.includes('window')) features.push('Window');
            if (seat.type.includes('aisle')) features.push('Aisle');
            if (seat.type.includes('exit_row')) features.push('Exit Row');
            if (seat.type.includes('extra_legroom')) features.push('Extra Legroom');
            seatFeatures = features.length > 0 ? features.join(', ') : 'Standard';
        } else {
            seatFeatures = getSeatTypeLabel(seat.type);
        }
        
        listItem.innerHTML = `
            <span>Seat ${seatLabel}</span>
            <span>${seatFeatures}</span>
        `;
        seatList.appendChild(listItem);
    });
}

function getSeatTypeLabel(type) {
    switch (type) {
        case 'window':
            return 'Window Seat';
        case 'middle':
            return 'Middle Seat';
        case 'aisle':
            return 'Aisle Seat';
        case 'exit_row':
            return 'Exit Row Seat';
        case 'extra_legroom':
            return 'Extra Legroom Seat';
        default:
            return 'Standard Seat';
    }
}

function printConfirmation() {
    window.print();
}

function returnToHome() {
    localStorage.removeItem('bookingData');
    
    window.location.href = 'index.html';
}
