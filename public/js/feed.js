function checkCookie(){
	var username = "";
	if(getCookie("username")==false){
		window.location = "index.html";
	}
}

checkCookie();
window.onload = pageLoad;

function getCookie(name){
	var value = "";
	try{
		value = document.cookie.split("; ").find(row => row.startsWith(name)).split('=')[1]
		return value
	}catch(err){
		return false
	} 
}

function pageLoad(){
    var username = getCookie('username');
    if (username) {
        document.getElementById("username").innerHTML = "Hello, " + username; // แสดงชื่อผู้ใช้
    } else {
        document.getElementById("username").innerHTML = "Hello, Guest"; // ถ้าไม่พบชื่อผู้ใช้ในคุกกี้
    }
	document.getElementById("username").innerHTML = username;

}

function getData(){
	var msg = document.getElementById("textmsg").value;
	document.getElementById("textmsg").value = "";
	writePost(msg);
}

async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        alert('ไม่สามารถโหลดข้อมูลอีเวนต์ได้');
    }
}

//แสดงข้อมูลอีเวนต์
function displayEvents(events) {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = ''; // ล้างข้อมูลเก่าออกก่อน

    if (events.length === 0) {
        eventList.innerHTML = '<p>ไม่มีอีเวนต์ที่จะแสดง</p>';
        return;
    }

    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <h2>${event.name}</h2>
            <p>${event.description}</p>
            <p><strong>วันที่:</strong> ${event.date}</p>
            <button onclick="bookEvent(${event.id})">จองบัตร</button>
        `;
        eventList.appendChild(eventItem);
    });
}

async function bookEvent(eventId) {
    try {
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId })
        });
        if (!response.ok) {
            throw new Error('Failed to book event');
        }
        const result = await response.json();
        alert(result.message || 'จองสำเร็จ');
    } catch (error) {
        console.error('Error booking event:', error);
        alert('ไม่สามารถจองบัตรได้');
    }
}

let currentIndex = 0;

function moveSlide(step) {
    const slides = document.querySelectorAll('.slider img');
    const totalSlides = slides.length;

    currentIndex += step;

    if (currentIndex >= totalSlides) {
        currentIndex = 0; 
    }
    if (currentIndex < 0) {
        currentIndex = totalSlides - 1;
    }

    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    slides[currentIndex].classList.add('active');
}

// เรียกใช้ฟังก์ชันเพื่อแสดงภาพแรกเมื่อหน้าโหลด
document.addEventListener('DOMContentLoaded', () => {
    moveSlide(0);
        const username = localStorage.getItem('username'); 
        const usernameSpan = document.getElementById('username'); 
    
        if (username) {
            usernameSpan.textContent = username; 
        } else {
            usernameSpan.textContent = 'Guest'; 
        }
    });
    
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
    



