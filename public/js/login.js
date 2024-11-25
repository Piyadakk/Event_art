window.onload = pageLoad;

function pageLoad(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.get("error")==1){
		document.getElementById('errordisplay').innerHTML = "Username or password does not match.";
	}	
}

function handleLoginSuccess(username) {
    localStorage.setItem('username', username); 
    window.location.href = 'feed.html'; 
}
function handleLogin(event) {
    event.preventDefault(); //หยุดการ submit ฟอร์ม
    var username = document.getElementById("usernameInput").value;
    var email = document.getElementById("emailInput").value;

    // ตั้งค่า cookie หลังจากที่ผู้ใช้ล็อกอิน
    setUserCookies(email, username);
    window.location.href = "profile.html"; 
}

function setUserCookies(email, username) {
    document.cookie = "email=" + encodeURIComponent(email) + "; path=/";
    document.cookie = "username=" + encodeURIComponent(username) + "; path=/";
}

