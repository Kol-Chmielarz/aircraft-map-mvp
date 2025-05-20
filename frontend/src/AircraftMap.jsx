import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom aircraft icon
const aircraftIcon = L.divIcon({
  className: 'aircraft-marker',
  html: '✈️',
  iconSize: [24, 24]
});

// User location icon
const userIcon = L.divIcon({
  className: 'user-marker',
  html: '📍',
  iconSize: [32, 32]
});

export default function AircraftMap({ center, radiusNm }) {
  const [aircraft, setAircraft] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [distanceUnit, setDistanceUnit] = useState('feet'); // 'feet', 'meters', 'miles'
  const intervalRef = useRef();

  // Convert NM to miles (1 NM = 1.15078 miles)
  const radiusMiles = radiusNm * 1.15078;

  // Helper to convert feet to selected unit
  function formatDistance(feet) {
    if (distanceUnit === 'feet') return `${feet.toLocaleString()} ft`;
    if (distanceUnit === 'meters') return `${(feet / 3.28084).toLocaleString(undefined, {maximumFractionDigits: 0})} m`;
    if (distanceUnit === 'miles') return `${(feet / 5280).toLocaleString(undefined, {maximumFractionDigits: 2})} mi`;
    return `${feet} ft`;
  }

  // fetch loop
  useEffect(() => {
    async function load() {
      try {
        const q = new URLSearchParams({ lat: center.lat, lon: center.lon, dist: radiusNm });
        const r = await fetch(`http://localhost:4000/api/aircraft?${q.toString()}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!r.ok) {
          const errorData = await r.json();
          throw new Error(errorData.details || `HTTP error! status: ${r.status}`);
        }
        
        const data = await r.json();
        if (!data.aircraft) {
          throw new Error('Invalid response format: missing aircraft data');
        }
        
        setAircraft(data.aircraft);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch aircraft:', err);
        setError(err.message || 'Failed to load aircraft data. Please try again later.');
        setAircraft([]); // Clear aircraft data on error
      }
    }
    load();                                // first call
    intervalRef.current = setInterval(load, 15000); // refresh every 15 s
    return () => clearInterval(intervalRef.current);
  }, [center, radiusNm]);

  return (
    <div className="map-wrapper">
      <div className="map-stats">
        <span>Aircraft within {radiusMiles.toFixed(1)} miles: {aircraft.length}</span>
        <div style={{ marginTop: 8 }}>
          <label htmlFor="distance-unit-select">Distance unit: </label>
          <select
            id="distance-unit-select"
            value={distanceUnit}
            onChange={e => setDistanceUnit(e.target.value)}
            style={{ marginLeft: 4 }}
          >
            <option value="feet">Feet</option>
            <option value="meters">Meters</option>
            <option value="miles">Miles</option>
          </select>
        </div>
      </div>
      <MapContainer 
        center={[center.lat, center.lon]} 
        zoom={9} 
        style={{ height: '100%', width: '100%' }}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        
        {/* User location marker */}
        <Marker 
          position={[center.lat, center.lon]}
          icon={userIcon}
        >
          <Tooltip permanent>Your Location</Tooltip>
        </Marker>

        {/* user range ring */}
        <Circle 
          center={[center.lat, center.lon]} 
          radius={radiusNm * 1852}
          pathOptions={{ color: '#3388ff', fillColor: '#3388ff', fillOpacity: 0.1 }}
        >
          <Tooltip permanent>
            {radiusMiles.toFixed(1)} mile radius
          </Tooltip>
        </Circle>

        {error && (
          <div className="error-overlay">
            <p>Error loading aircraft data:</p>
            <p className="error-details">{error}</p>
          </div>
        )}

        {aircraft.map(bird => (
          <Marker 
            key={bird.hex} 
            position={[bird.lat, bird.lon]}
            icon={aircraftIcon}
            eventHandlers={{
              click: () => setSelectedAircraft(bird)
            }}
          >
            <Tooltip 
              direction='top' 
              offset={[0, -10]} 
              permanent
              className="aircraft-tooltip"
            >
              {bird.callsign} • {Math.round(bird.alt)} ft
            </Tooltip>
            <Popup>
              <div className="aircraft-details">
                <h3>Aircraft Details</h3>
                <p><strong>Callsign:</strong> {bird.callsign}</p>
                <p><strong>Altitude:</strong> {Math.round(bird.alt)} ft</p>
                <p><strong>ICAO:</strong> {bird.hex}</p>
                <p><strong>Location:</strong> {bird.lat.toFixed(4)}, {bird.lon.toFixed(4)}</p>
                <p><strong>Distance from you:</strong> {formatDistance(bird.distance_feet)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 