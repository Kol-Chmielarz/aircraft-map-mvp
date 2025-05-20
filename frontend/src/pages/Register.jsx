import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../FormStyles.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setMessage('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setSuccess(true);
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (err) {
      setMessage('Registration failed: ' + err.message);
    }
  }

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label className="form-label">Username</label>
        <input
          type="text"
          className="form-input"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="form-button">Register</button>
      </form>
      {message && <p className={`form-message${success ? ' success' : ' error'}`}>{message}</p>}
    </div>
  );
} 