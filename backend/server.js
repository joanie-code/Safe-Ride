const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Root
app.get('/', (req, res) => res.send('Safe Ride API is Live'));

// Register User
app.post('/api/register', async (req, res) => {
  const { name, phone, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request Ride
app.post('/api/rides/request', async (req, res) => {
  const { rider_id, pickup_location, dropoff_location, fare } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO rides (rider_id, pickup_location, dropoff_location, fare, status) 
       VALUES ($1, $2, $3, $4, 'requested') RETURNING *`,
      [rider_id, pickup_location, dropoff_location, fare]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request Personal Driver
app.post('/api/driver-hire/request', async (req, res) => {
  const { user_id, driver_id, location, duration_days } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO driver_hires (user_id, driver_id, location, duration_days, status, payment_status) 
       VALUES ($1, $2, $3, $4, 'requested', 'pending') RETURNING *`,
      [user_id, driver_id, location, duration_days]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Safe Ride API running on port ' + PORT);
});
