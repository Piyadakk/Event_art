function checkCookie(){
    var username = "";
    if(getCookie("username") == false){
        window.location = "profile.html"; 
    }
}

checkCookie(); 
window.onload = pageLoad;

function getCookie(name){
    var value = "";
    try{
        value = document.cookie.split("; ").find(row => row.startsWith(name)).split('=')[1];
		return decodeURIComponent(value);
    } catch(err){
        return false;
    } 
}
function pageLoad() {
    document.getElementById("displayPic").onclick = fileUpload; 
    document.getElementById("fileField").onchange = fileSubmit;

    var username = getCookie("username");
    var email = getCookie("email");

	if (username && email) {
        document.getElementById("username").innerHTML = username;
        document.getElementById("email").innerHTML = email;
    } else {
        console.log("Username or email not found in cookies");
    }

	email = decodeURIComponent(email);
    showImg("img/" + getCookie("img"));
    loadBookingHistory();  // เรียกฟังก์ชันดึงประวัติการจอง
}
function loadBookingHistory() {
    const username = getCookie("username");

    if (username) {
        fetch('/getBookings?username=' + username, { 
            method: 'GET',
            credentials: 'same-origin'  //รวมคุกกี้ไปกับคำขอ
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const bookingHistoryDiv = document.getElementById("booking-history");
            if (data.bookings && data.bookings.length > 0) {
                // ถ้ามีข้อมูลการจองที่ตรงกับ username
                data.bookings.forEach(booking => {
                    const bookingDiv = document.createElement("div");
                    bookingDiv.classList.add("bookingItem");
                
                    const bookingDate = new Date(booking.booking_date);

                    const formattedDate = bookingDate.toLocaleString('en-US', {
                        month: 'numeric',   // เดือนในรูปแบบตัวเลข (เช่น 9)
                        day: 'numeric',     // วันในรูปแบบตัวเลข (เช่น 5)
                        year: 'numeric',    // ปี (เช่น 2024)
                        hour: '2-digit',    // ชั่วโมงในรูปแบบ 2 หลัก (เช่น 12)
                        minute: '2-digit',  // นาทีในรูปแบบ 2 หลัก (เช่น 00)
                        second: '2-digit',  // วินาทีในรูปแบบ 2 หลัก (เช่น 00)
                        hour12: true        // ใช้เวลาแบบ 12 ชั่วโมง (AM/PM)
                    });
                    
                    bookingDiv.innerHTML = `
                        <div class="bookingContent">
                            <h5 class="eventName">${booking.event_name}</h5>
                            <p class="bookingDate">Date: ${formattedDate}</p>
                            <p class="seatsBooked">Quantity: ${booking.quantity}</p>
                        </div>
                    `;
                
                    document.getElementById("booking-history").appendChild(bookingDiv);
                });
            } else {

                bookingHistoryDiv.innerHTML = "<p></p>";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching booking history');
        });
    } else {
        // ถ้าไม่มี username ในคุกกี้
        alert('User not logged in');
    }
}

function fileUpload() {
    document.getElementById("fileField").click(); 
}

function fileSubmit(){
	document.getElementById('formId').submit();
}

function showImg(filename){
	if (filename !==""){
		var showpic = document.getElementById('displayPic');
		showpic.innerHTML = "";
		var temp = document.createElement("img");
		temp.src = filename;
		showpic.appendChild(temp);
	}
}

function showCreateEventForm() {
	const form = document.getElementById("createEventForm");
	form.style.display = "block";
}

function cancelEventCreation() {
	const form = document.getElementById("createEventForm");
	form.style.display = "none"
}

document.getElementById('createEventButton').addEventListener('click', function() {
    const event_name = document.getElementById('eventName').value;
    const event_date = document.getElementById('eventDate').value;
    const event_image = document.getElementById('eventImage').files[0];  
    const event_location = document.getElementById('eventLocation').value;
    const event_seats = document.getElementById('eventSeats').value;
    const event_price = document.getElementById('eventPrice').value;
    const event_description = document.getElementById('eventDescription').value;
    const event_link = document.getElementById('eventLink').value;

    const formData = new FormData();
    formData.append('event_name', event_name);
    formData.append('event_date', event_date);
    formData.append('event_location', event_location);
    formData.append('event_seats', event_seats);
    formData.append('event_price', event_price);
    formData.append('event_description', event_description);
    formData.append('event_link', event_link);
    if (event_image) {
        formData.append('event_image', event_image); // ถ้ามีไฟล์อัพโหลด
    }

	fetch('/createEvent', {
		method: 'POST',
		body: formData,
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Server responded with an error');
		}
		return response.json(); 
	})
	.then(data => {
		if (data.message) {
			alert(data.message);  // แสดงข้อความจากเซิร์ฟเวอร์
			window.location.href = 'profile.html';  
		}
	})
	.catch(error => {
		console.error('Error:', error);
		alert('An error occurred while creating the event');
	});
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
		const offset = 80; // ระยะห่างที่ต้องการเลื่อน (px) หาก Navbar บัง
		const targetPosition = target.offsetTop - offset;

		window.scrollTo({
			top: targetPosition,
			behavior: 'smooth'
		});
	});
});