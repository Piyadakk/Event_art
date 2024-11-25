function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/getEvents')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.events)) {
                const eventContainer = document.getElementById('events-container');
                eventContainer.innerHTML = '';

                data.events.forEach(event => {
                    const imageUrl = event.event_images 
                        ? event.event_images.replace(/^public\//, '').replace(/\\/g, '/') 
                        : 'img/default-image.jpg';

                    const eventItem = document.createElement('div');
                    eventItem.classList.add('col');

                    eventItem.innerHTML = `
                        <div class="event-item">
                            <a class="box-img" href="#">
                                <img src="/${imageUrl}" alt="${event.event_name}" />
                            </a>
                            <div class="box-txt">
                                <a class="title" href="#">${event.event_name}</a>
                                <span class="datetime">${new Date(event.event_date).toLocaleString()}</span>
                                <a class="venue" href="#">${event.event_location}</a>
                            </div>
                            <div class="box-btn">
                                <a href="#" class="btn-buynow" onclick="buyTicket(${event.event_id}, '${event.event_name}')">
                                    <small>Booking Now</small>
                                </a>
                            </div>
                        </div>
                    `;
                    eventContainer.appendChild(eventItem);
                });
            }
        })
        .catch(error => console.error('Error fetching events:', error));
});

function buyTicket(eventId, eventName) {
    // ดึงข้อมูลจากคุกกี้
    const username = getCookie('username'); 
    const email = getCookie('email'); 

    if (!username || !email) {
        alert('Please log in first.');
        return;
    }
    const bookingData = {
        event_id: eventId,
        event_name: eventName,
        username: username,  
        email: email,        
        quantity: 1,        
    };

    fetch('/bookEvent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Booking Successful!');
            } else {
                alert('Booking Failed: ' + data.error);
            }
        })
        .catch(error => alert('Error: ' + error.message));
}

const menuToggle = document.querySelector('.menu-toggle');
const navbarMenu = document.querySelector('.navbar ul');
const body = document.querySelector('body');

menuToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
});

body.addEventListener('click', (event) => {
    if (!navbarMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        navbarMenu.classList.remove('active');
    }
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const offset = 80;
        const targetPosition = target.offsetTop - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});