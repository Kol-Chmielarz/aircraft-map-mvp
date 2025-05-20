import { useState } from 'react';

export default function AddDrone() {
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  async function handleAddDrone(e) {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/drones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          model,
          serial_number: serial,
          nickname,
          description
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Drone registered!');
        setModel(''); setSerial(''); setNickname(''); setDescription('');
      } else {
        setMessage(data.error || 'Failed to add drone');
      }
    } catch (err) {
      setMessage('Failed to add drone: ' + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      <h2>Add DJI Drone</h2>
      <form onSubmit={handleAddDrone}>
        <input
          type="text"
          placeholder="Model (e.g. DJI Mini 3 Pro)"
          value={model}
          onChange={e => setModel(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="text"
          placeholder="Serial Number"
          value={serial}
          onChange={e => setSerial(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="text"
          placeholder="Nickname (optional)"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10 }}>Add Drone</button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
} 