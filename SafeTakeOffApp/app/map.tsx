import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';

const RADIUS_NM = 25; // nautical miles
const NM_TO_METERS = 1852;
const RADIUS_METERS = RADIUS_NM * NM_TO_METERS;

type Aircraft = {
  hex: string;
  lat: number;
  lon: number;
  alt: number;
  callsign?: string;
};

type LocationCoords = {
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get user location
  useEffect(() => {
    let isMounted = true;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (isMounted) {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
        }
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      if (isMounted) {
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Fetch aircraft data
  useEffect(() => {
    if (!location) return;
    function toString(val: any) { return val != null ? String(val) : ''; }
    async function loadAircraft() {
      try {
        const q = new URLSearchParams({ lat: toString(location.latitude), lon: toString(location.longitude), dist: toString(RADIUS_NM) });
        const r = await fetch(`http://localhost:4000/api/aircraft?${q.toString()}`);
        if (!r.ok) {
          let errorData;
          try { errorData = await r.json(); } catch { errorData = {}; }
          throw new Error(errorData.details || `HTTP error! status: ${r.status}`);
        }
        const data = await r.json();
        if (!data.aircraft) throw new Error('Invalid response format: missing aircraft data');
        setAircraft(data.aircraft);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load aircraft data. Please try again later.');
        setAircraft([]);
      }
    }
    loadAircraft();
    intervalRef.current = setInterval(loadAircraft, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location]);

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color="#2563eb" /><Text>Loading map...</Text></View>
    );
  }
  if (errorMsg) {
    return (
      <View style={styles.centered}><Text style={{ color: 'red' }}>{errorMsg}</Text></View>
    );
  }
  if (!location) {
    return (
      <View style={styles.centered}><Text>Location not available.</Text></View>
    );
  }

  const initialRegion: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {/* User radius circle */}
        <Circle
          center={{ latitude: location.latitude, longitude: location.longitude }}
          radius={RADIUS_METERS}
          strokeColor="#3388ff"
          fillColor="rgba(51,136,255,0.1)"
        />
        {/* Aircraft markers */}
        {aircraft.map(bird => (
          <Marker
            key={bird.hex}
            coordinate={{ latitude: bird.lat, longitude: bird.lon }}
            title={bird.callsign || 'Aircraft'}
            description={`Alt: ${Math.round(bird.alt)} ft\nICAO: ${bird.hex}`}
          />
        ))}
      </MapView>
      <View style={styles.stats}>
        <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>
          Aircraft within {(RADIUS_NM * 1.15078).toFixed(1)} miles: {aircraft.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stats: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}); 