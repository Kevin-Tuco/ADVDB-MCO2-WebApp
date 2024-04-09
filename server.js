const express = require('express');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();

// MySQL Connection Configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'try',
    password: 'EDCft0118!',
    database: 'seriousmd_appointment'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set Handlebars as the view engine
app.engine('hbs', exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views')
}).engine);

app.set('view engine', 'hbs');

// Set the path to the views folder
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    // Query your database to fetch the first 50 appointments
    connection.query('SELECT * FROM appointments LIMIT 50', (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            res.status(500).send('Error fetching appointments');
            return;
        }
        
        // Render the main.hbs view with appointments data
        res.render('main', { appointments: results });
    });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
