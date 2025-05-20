import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './auth/router.js';
import { protect } from './auth/protect.js';
import pool from './db.js';

dotenv.config();
const app = express();
const PORT = 4000;
const KEY = process.env.ADSBX_API_KEY;     // put yours in .env
const DRONETAG_API_KEY = process.env.DRONETAG_API_KEY;

// Debug logging
console.log('API Key present:', !!KEY);
console.log('API Key length:', KEY ? KEY.length : 0);
console.log('API Key first 4 chars:', KEY ? KEY.substring(0, 4) + '...' : 'none');

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both default and alternative Vite ports
  methods: ['GET'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);

// Protected test route
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'JWT is valid!', user: req.user });
});

// Haversine formula to calculate distance in meters
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

app.get('/api/aircraft', async (req, res) => {
  const { lat, lon, dist } = req.query;
  const url = `https://adsbexchange-com1.p.rapidapi.com/v2/lat/${lat}/lon/${lon}/dist/${dist}/`;
  
  console.log('API Key present:', !!KEY);
  console.log('API Key length:', KEY ? KEY.length : 0);
  console.log('API Key first 4 chars:', KEY ? KEY.substring(0, 4) + '...' : 'none');
  console.log('Fetching from:', url);
  console.log('Using API Key:', KEY ? 'Present' : 'Missing');

  try {
    const r = await fetch(url, {
      headers: {
        'x-rapidapi-host': 'adsbexchange-com1.p.rapidapi.com',
        'x-rapidapi-key': KEY,
        'Accept': 'application/json'
      }
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error('API Error Response:', {
        status: r.status,
        statusText: r.statusText,
        body: errorText,
        headers: Object.fromEntries(r.headers.entries())
      });
      return res.status(r.status).json({ error: 'Failed to fetch aircraft data', details: errorText });
    }

    const text = await r.text();
    console.log('Raw API Response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      console.error('Raw text that failed to parse:', text);
      return res.status(500).json({ error: 'Invalid JSON response from API', details: e.message });
    }

    console.log('Parsed API Response:', JSON.stringify(data, null, 2));
    
    if (!data.ac) {
      console.error('No aircraft data in response:', data);
      return res.status(500).json({ error: 'No aircraft data in response' });
    }

    if (data.ac.length === 0) {
      console.warn('Aircraft array is empty!');
    } else {
      console.log('Full aircraft array:', JSON.stringify(data.ac, null, 2));
    }

    console.log('Received aircraft count:', data.ac.length);
    console.log('First aircraft data:', data.ac[0]);

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const aircraft = data.ac
      .filter(ac => {
        // Filter out aircraft with invalid coordinates
        const hasValidCoords = typeof ac.lat === 'number' && typeof ac.lon === 'number';
        return hasValidCoords;
      })
      .map(ac => {
        const distanceMeters = haversine(userLat, userLon, ac.lat, ac.lon);
        const distanceFeet = distanceMeters * 3.28084;
        return {
          hex: ac.hex,
          callsign: ac.flight ? ac.flight.trim() : 'Unknown',
          lat: ac.lat,
          lon: ac.lon,
          alt: ac.alt_geom || ac.alt_baro || 0,
          speed: ac.gs || 0,
          heading: ac.track || 0,
          type: ac.t || 'Unknown',
          registration: ac.r || 'Unknown',
          country: ac.category || 'Unknown',
          distance_feet: Math.round(distanceFeet)
        };
      });

    console.log('Processed aircraft data:', aircraft);
    console.log('Number of processed aircraft:', aircraft.length);
    console.log('Filtered out test aircraft:', data.ac.length - aircraft.length);

    res.json({ aircraft });
  } catch (err) {
    console.error('Error fetching aircraft:', err);
    res.status(500).json({ error: 'Failed to fetch aircraft data', details: err.message });
  }
});

app.post('/api/drones', protect, async (req, res) => {
  const { model, serial_number, nickname, description } = req.body;
  if (!model || !serial_number) {
    return res.status(400).json({ error: 'Model and serial number are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO drones (user_id, model, serial_number, nickname, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, model, serial_number, nickname, description, created_at`,
      [req.user.id, model, serial_number, nickname || null, description || null]
    );
    res.json({ drone: result.rows[0] });
  } catch (e) {
    console.error('Add drone error:', e);
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/drone-position/:device_id', protect, async (req, res) => {
  const { device_id } = req.params;
  if (!DRONETAG_API_KEY) return res.status(500).json({ error: 'No Dronetag API key configured' });
  try {
    const r = await fetch(`https://api.dronetag.app/v1/devices/${device_id}/telemetry/live`, {
      headers: {
        'X-API-Key': DRONETAG_API_KEY
      }
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || 'Failed to fetch from Dronetag' });
    // Normalize output
    const { lat, lon, alt, heading, velocity, timestamp } = data;
    res.json({ lat, lon, alt, heading, velocity, timestamp });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/drones', protect, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, model, serial_number, nickname, description, created_at FROM drones WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ drones: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`)); 