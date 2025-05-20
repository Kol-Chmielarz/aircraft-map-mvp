import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import AddDrone from './pages/AddDrone'
import ViewDrones from './pages/ViewDrones'
import AircraftMap from './AircraftMap'
import './App.css'

function MapWithNav({ center, radiusNm, setRadiusNm }) {
  const navigate = useNavigate()
  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <div className='app-container'>
      <nav style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '0.5rem 1rem', borderBottom: '1px solid #dee2e6' }}>
        <Link to="/add-drone" style={{ marginRight: 16 }}>Add Drone</Link>
        <Link to="/view-drones" style={{ marginRight: 16 }}>View Drones</Link>
        <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Log Out</button>
      </nav>
      <div className='controls'>
        <label>
          Search Radius:&nbsp;
          <input
            type='number'
            min='1'
            max='100'
            value={radiusNm}
            onChange={e => setRadiusNm(Number(e.target.value))}
            className='radius-input'
          />
          &nbsp;NM
        </label>
      </div>
      <div className='map-container'>
        <AircraftMap center={center} radiusNm={radiusNm} />
      </div>
    </div>
  )
}

export default function App() {
  const [center, setCenter] = useState(null)
  const [radiusNm, setRadiusNm] = useState(25)
  const [error, setError] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setError(null)
      },
      err => {
        console.error('Geolocation error:', err)
        setError('Location access is required for this app. Please enable location services and refresh the page.')
      },
      { enableHighAccuracy: true }
    )
  }, [])

  // Simple auth check: is there a token?
  const isLoggedIn = !!localStorage.getItem('token')

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    )
  }

  if (!center) {
    return (
      <div className="loading-container">
        <p>Requesting location...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-drone" element={isLoggedIn ? <AddDrone /> : <Navigate to="/login" />} />
        <Route path="/view-drones" element={isLoggedIn ? <ViewDrones /> : <Navigate to="/login" />} />
        <Route
          path="/map"
          element={isLoggedIn ? (
            <MapWithNav center={center} radiusNm={radiusNm} setRadiusNm={setRadiusNm} />
          ) : (
            <Navigate to="/login" />
          )}
        />
      </Routes>
    </Router>
  )
}
