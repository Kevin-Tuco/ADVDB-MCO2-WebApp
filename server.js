const express = require('express');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const app = express();

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies
app.use(bodyParser.json());

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

// Route to get distinct values for a filter
app.get('/getDistinctValues', (req, res) => {
    const filter = req.query.filter;
    const sql = `SELECT DISTINCT ${filter} FROM appointments LIMIT 50`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching distinct values:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const values = results.map(result => result[filter]);
        res.json(values);
    });
});

// Route to filter appointments
app.get('/filterAppointments', (req, res) => {
    const filter = req.query.filter;
    const value = req.query.value;
    const sql = `SELECT * FROM appointments WHERE ${filter} = ? LIMIT 50`;
    connection.query(sql, [value], (err, results) => {
        if (err) {
            console.error('Error fetching filtered appointments:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

// Endpoint to check if pxid exists
app.get('/checkPxid', (req, res) => {
    const pxid = req.query.pxid.toUpperCase(); // Convert to uppercase

    // Query to check if pxid exists
    const query = `SELECT COUNT(*) AS count FROM px WHERE pxid = ?`;
    connection.query(query, [pxid], (error, results) => {
        if (error) {
            console.error('Error checking pxid:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Check if pxid exists
        const pxidExists = results[0].count > 0;
        res.json({ exists: pxidExists });
    });
});

// Endpoint to check if clinicid exists
app.get('/checkClinicid', (req, res) => {
    const clinicid = req.query.clinicid.toUpperCase(); // Convert to uppercase

    // Query to check if clinicid exists
    const query = `SELECT COUNT(*) AS count FROM clinics WHERE clinicid = ?`;
    connection.query(query, [clinicid], (error, results) => {
        if (error) {
            console.error('Error checking clinicid:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Check if clinicid exists
        const clinicidExists = results[0].count > 0;
        res.json({ exists: clinicidExists });
    });
});
// Endpoint to check if clinicid exists
app.get('/checkDoctorid', (req, res) => {
    const doctorid = req.query.doctorid.toUpperCase(); // Convert to uppercase

    // Query to check if clinicid exists
    const query = `SELECT COUNT(*) AS count FROM doctors WHERE doctorid = ?`;
    connection.query(query, [doctorid], (error, results) => {
        if (error) {
            console.error('Error checking clinicid:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Check if clinicid exists
        const doctoridExists = results[0].count > 0;
        res.json({ exists: doctoridExists });
    });
});

// Endpoint to add appointment data to the database
app.post('/addAppointment', async (req, res) => {
    const { add_pxid, add_clinicid, add_doctorid, add_status, add_QueueDate, add_app_type, add_is_Virtual } = req.body;

    try {
        // Generate apptid
        const apptid = await generateApptId();
        //console.log("Apptid:" + apptid);

        // Insert the appointment data into the database
        const query = 'INSERT INTO appointments (pxid, clinicid, doctorid, apptid, status, TimeQueued, QueueDate, StartTime, EndTime, app_type, is_Virtual) VALUES (?, ?, ?, ?, ?, NULL, ?, NULL, NULL, ?, ?)';
        const values = [add_pxid, add_clinicid, add_doctorid, apptid, add_status, add_QueueDate, add_app_type, add_is_Virtual];
        //console.log('Values before adding: ' + values);
        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error adding appointment:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Respond with success message or inserted ID
            res.json({ success: true, insertedId: results.insertId });
        });
    } catch (error) {
        console.error('Error generating apptid:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to generate apptid with the specified pattern
function generateApptId() {
    return new Promise((resolve, reject) => {
        const prefix = '000CAFE';
        const hexRegex = /[0-9A-F]+/g;

        // Find the biggest apptid with the specified pattern
        const query = 'SELECT MAX(apptid) AS maxApptid FROM appointments WHERE apptid LIKE ?';
        const pattern = prefix + '%';

        connection.query(query, [pattern], (error, results) => {
            if (error) {
                console.error('Error fetching max apptid:', error);
                reject(error); // Reject the Promise on error
                return;
            }

            let nextHexValue = '00'; // Default value if no existing apptid found
            let newApptId = prefix + nextHexValue;
            if (results[0].maxApptid) {
                // Extract the hex part from the max apptid
                const match = results[0].maxApptid.match(hexRegex);
                if (match) {
                    // Increment the hex part by 1
                    const maxHex = match[0]; // Use the first match
                    const newHexValue = (parseInt(maxHex, 16) + 1).toString(16).toUpperCase().padStart(2, '0');
                    nextHexValue = newHexValue;
                    newApptId = '000'+nextHexValue;
                }
            }
            // Construct the new apptid
            //console.log('newApptId = ' + newApptId);
            resolve(newApptId); // Resolve the Promise with the new apptid
        });
    });
}



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
