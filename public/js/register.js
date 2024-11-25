async function registerUser(event) {
    event.preventDefault(); 

    //ดึงข้อมูลจากฟอร์ม
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!username || !password || !confirmPassword) {
        displayError('Please fill in all required fields');
        return;
    }

    if (password !== confirmPassword) {
        displayError('Passwords do not match');
        return;
    }
    try {
        // ส่งข้อมูลไปยังเซิร์ฟเวอร์
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'การลงทะเบียนล้มเหลว');
        }

        alert(result.message || 'Registration successful!');
        window.location.href = '/login.html'; 
    } catch (error) {
        console.error('Error registering user:', error);
        displayError(error.message || 'error');
    }
}

function displayError(message) {
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
}
document.getElementById('registerForm').addEventListener('submit', registerUser);
