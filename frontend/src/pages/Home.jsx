import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>Welcome to Drone Tracker MVP</h1>
      <p>Track aircraft and register your drone!</p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/register" style={{ marginRight: '1rem' }}>
          <button>Register</button>
        </Link>
        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>
    </div>
  );
} 