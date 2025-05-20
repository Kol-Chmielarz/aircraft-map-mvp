import { useState, useEffect } from 'react';
import '../FormStyles.css';

export default function ViewDrones() {
  const [drones, setDrones] = useState([]);
  const [positions, setPositions] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user's drones from backend (assume /api/drones returns user's drones)
    async function fetchDrones() {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/drones', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) setDrones(data.drones || []);
      else setMessage(data.error || 'Failed to load drones');
    }
    fetchDrones();
  }, []);

  async function fetchPosition(device_id) {
    setMessage('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:4000/api/drone-position/${device_id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) {
        setPositions(p => ({ ...p, [device_id]: data }));
      } else {
        setMessage(data.error || 'Failed to fetch position');
      }
    } catch (err) {
      setMessage('Failed to fetch position: ' + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <h2>View Drones</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      {drones.length === 0 ? <p>No drones registered.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {drones.map(drone => (
            <li key={drone.id} style={{ marginBottom: 24, border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
              <div><strong>Model:</strong> {drone.model}</div>
              <div><strong>Serial:</strong> {drone.serial_number}</div>
              <div><strong>Nickname:</strong> {drone.nickname}</div>
              <button className="form-button" onClick={() => fetchPosition(drone.serial_number)} style={{ marginTop: 8, width: 180 }}>Get Live Position</button>
              {positions[drone.serial_number] && (
                <div style={{ marginTop: 8 }}>
                  <strong>Live Position:</strong>
                  <div>Lat: {positions[drone.serial_number].lat}</div>
                  <div>Lon: {positions[drone.serial_number].lon}</div>
                  <div>Alt: {positions[drone.serial_number].alt} m</div>
                  <div>Heading: {positions[drone.serial_number].heading}</div>
                  <div>Velocity: {positions[drone.serial_number].velocity}</div>
                  <div>Timestamp: {positions[drone.serial_number].timestamp}</div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 