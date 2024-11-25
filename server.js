const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3000;
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, 'public/img/');
    },
    
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('event_image');

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true); 
};

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "event_art"
});

con.connect(err => {
    if(err) throw(err);
    else{
        console.log("MySQL connected");
    }
});

const queryDB = (sql) => {
    return new Promise((res, rej) => {
        con.query(sql, (err, result) => {
            if (err) rej(err);
            else res(result);
        });
    });
};

//สร้างฐานข้อมูลและตารางถ้ายังไม่มี
con.query('CREATE DATABASE IF NOT EXISTS event_art', (err, _result) => {
    if (err) {
        console.error('Error creating database:', err);
        return;
    }
    console.log('Database created or already exists');
    con.query('USE event_art', (err, _result) => {
        if (err) {
            console.error('Error using database:', err);
            return;
        }
        console.log('Using event_art database');

        let createTableQuery = `
            CREATE TABLE IF NOT EXISTS Event_database (
                event_id INT AUTO_INCREMENT PRIMARY KEY,
                event_name VARCHAR(255) NOT NULL,
                event_date DATE NOT NULL,
                event_location VARCHAR(255),
                event_seats INT,
                event_price DECIMAL(10, 2),
                event_description TEXT,
                event_link VARCHAR(255),
                event_images TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        con.query(createTableQuery, (err, _result) => {
            if (err) {
                console.error('Error creating Event_database table:', err);
                return;
            }
            console.log('Event_database table created successfully');
        });
    });
});

app.post('/regisDB', async (req, res) => {
    let now_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    //สร้างตาราง userinfo ถ้ายังไม่มี
    let query = `CREATE TABLE IF NOT EXISTS userinfo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL, 
        username VARCHAR(255) NOT NULL, 
        password VARCHAR(255) NOT NULL, 
        date VARCHAR(255), 
        profilepic VARCHAR(255) DEFAULT 'avatar.png'
    )`;
    await queryDB(query);

    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let query2 = `INSERT INTO userinfo (email,username, password, date) VALUES ('${email}','${username}', '${password}', '${now_date}')`;
    
    //รันคำสั่ง SQL โดยการส่งค่าผ่าน parameters
    await queryDB(query2, [email,username, password, now_date]);  
    return res.redirect('login.html');
});

app.post('/profilepic', (req, res) => {
    let upload = multer({
        storage: storage,
        fileFilter: imageFilter,
    }).single('avatar');

    upload(req, res, async (err) => {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send("Please send an image to upload!");
        }
        res.cookie('img', req.file.filename);
        await updateImg(req.cookies.username, req.file.filename);
        return res.redirect('profile.html');
    });
});

const updateImg = async (username, filen) => {
    let query = `UPDATE userinfo SET profilepic = '${filen}' WHERE username = '${username}'`
    await queryDB(query);
}

app.post('/checkLogin', async (req, res) => {
    //ค้นหาข้อมูลผู้ใช้จากฐานข้อมูล
    let query = `SELECT username, email, password, profilepic FROM userinfo`;
    let queryResponse = await queryDB(query);

    let username = req.body.username;
    let password = req.body.password;
    let userData = Object.assign({}, queryResponse)

    let keys = Object.keys(userData);
    let userFound = false;

    for (let user of keys) {
        if (userData[user].username == username && userData[user].password == password) {
            res.cookie('email', userData[user].email);
            res.cookie('username', username);
            res.cookie('img', userData[user].profilepic);
            userFound = true;
            break;
        }
    }
    if (userFound) {
        return res.redirect('feed.html');
    } else {
        return res.redirect('login.html?error=1');
    }
});

app.post('/createEvent', upload, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded!' });
    }
    const event_name = req.body.event_name;
    const event_date = req.body.event_date;
    const event_location = req.body.event_location;
    const event_seats = req.body.event_seats;
    const event_price = req.body.event_price;
    const event_description = req.body.event_description;
    const event_link = req.body.event_link;
    const event_image = req.file.path.replace(/\\/g, '/'); 

    if (!event_name || !event_date || !event_location || !event_seats || !event_price || !event_description || !event_link) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    //แก้ไขชื่อฟิลด์ในSQL query ให้ตรง
    let insertEventQuery = `
        INSERT INTO Event_database (event_name, event_date, event_location, event_seats, event_price, event_description, event_link, event_images)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    //ใช้ query เพื่อเพิ่มข้อมูล
    con.query(insertEventQuery, [event_name, event_date, event_location, event_seats, event_price, event_description, event_link, event_image], (err, result) => {
        if (err) {
            console.error('Error inserting event:', err);  
            return res.status(500).json({ error: 'Error inserting event' });
        }
        console.log('Event created successfully');
        res.status(200).json({ message: 'Event created successfully', eventId: result.insertId });
    });
});

app.get('/getEvents', (req, res) => {
    const selectEventsQuery = 'SELECT * FROM Event_database'; 
    con.query(selectEventsQuery, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).json({ error: 'Error fetching events' });
        }
        res.status(200).json({ events: results });
    });
});

const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        event_name VARCHAR(255) NOT NULL, 
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_database(event_id) ON DELETE CASCADE
    );
`;
con.query(createBookingsTable, (err, _result) => {
    if (err) {
        console.error('Error creating bookings table:', err);
        return;
    }
});

app.post('/bookEvent', (req, res) => {
    let { event_id, event_name, username, email, quantity } = req.body;
    email = decodeURIComponent(email);
    //SQL query สำหรับบันทึกข้อมูลการจอง
    const insertBookingQuery = `
        INSERT INTO bookings (event_id, event_name, username, email, quantity, booking_date)
        VALUES (?, ?, ?, ?, ?, NOW());
    `;
    // บันทึกข้อมูลลงในฐานข้อมูล
    con.query(insertBookingQuery, [event_id, event_name, username, email, quantity], (err, result) => {
        if (err) {
            console.error('Error booking:', err);
            return res.json({ success: false, error: 'Booking failed. Please try again.' });
        }
        res.json({ success: true });
    });
});

app.get('/getBookings', (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    const query = 'SELECT * FROM bookings WHERE username = ?';
    con.query(query, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ bookings: results });
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.clearCookie('img');
    res.clearCookie('email');
    return res.redirect('index.html');
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
