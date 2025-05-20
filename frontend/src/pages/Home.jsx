import { Link } from 'react-router-dom';
import '../FormStyles.css';

export default function Home() {
  return (
    <div className="form-container">
      <h2>SafeTakeOff</h2>
      <p style={{ marginBottom: '2rem', color: '#444' }}>
        Track aircraft and register your drone with confidence.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/register" style={{ marginRight: '1rem' }}>
          <button className="form-button" style={{ width: 140 }}>Register</button>
        </Link>
        <Link to="/login">
          <button className="form-button" style={{ width: 140 }}>Login</button>
        </Link>
      </div>
    </div>
  );
} 