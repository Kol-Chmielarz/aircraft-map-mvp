import { useState } from 'react';
import '../FormStyles.css';

export default function AddDrone() {
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleAddDrone(e) {
    e.preventDefault();
    setMessage('');
    setSuccess(false);
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
        setSuccess(true);
        setModel(''); setSerial(''); setNickname(''); setDescription('');
      } else {
        setMessage(data.error || 'Failed to add drone');
      }
    } catch (err) {
      setMessage('Failed to add drone: ' + err.message);
    }
  }

  return (
    <div className="form-container">
      <h2>Add DJI Drone</h2>
      <form onSubmit={handleAddDrone}>
        <label className="form-label">Model</label>
        <input
          type="text"
          className="form-input"
          placeholder="Model (e.g. DJI Mini 3 Pro)"
          value={model}
          onChange={e => setModel(e.target.value)}
          required
        />
        <label className="form-label">Serial Number</label>
        <input
          type="text"
          className="form-input"
          placeholder="Serial Number"
          value={serial}
          onChange={e => setSerial(e.target.value)}
          required
        />
        <label className="form-label">Nickname (optional)</label>
        <input
          type="text"
          className="form-input"
          placeholder="Nickname (optional)"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        <label className="form-label">Description (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button type="submit" className="form-button">Add Drone</button>
      </form>
      {message && <p className={`form-message${success ? ' success' : ' error'}`}>{message}</p>}
    </div>
  );
} 