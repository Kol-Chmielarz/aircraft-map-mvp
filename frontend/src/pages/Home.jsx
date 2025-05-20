import { Link } from 'react-router-dom';
import '../FormStyles.css';

export default function Home() {
  return (
    <div className="form-container" style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      {/* Logo placeholder */}
      <div style={{ marginBottom: '2rem' }}>
        {/* You can replace this with an actual logo if available */}
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#f3f4f6', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#2563eb', border: '2px solid #2563eb' }}>
          <span role="img" aria-label="logo">🛩️</span>
        </div>
      </div>
      <h2 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 8 }}>Welcome to Safe2Fly</h2>
      <p style={{ marginBottom: '2.5rem', color: '#444', fontSize: 15 }}>
        Access online drone safety tools and view live aircraft nearby.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        <Link to="/map">
          <button className="form-button" style={{ width: '100%' }}>View Map</button>
        </Link>
        <Link to="/login">
          <button className="form-button" style={{ width: '100%' }}>Login</button>
        </Link>
        <Link to="/register">
          <button className="form-button" style={{ width: '100%' }}>Register</button>
        </Link>
      </div>
    </div>
  );
} 