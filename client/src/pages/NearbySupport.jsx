import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Home, Users } from 'lucide-react';
import { getSafeZones } from '../services/api';

// Fix for default marker icons in Leaflet with React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to dynamically re-center the map when the position changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const NearbySupport = () => {
  const [position, setPosition] = useState([51.505, -0.09]); // Default to London
  const [safeZones, setSafeZones] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });

    const fetchZones = async () => {
      try {
        const { data } = await getSafeZones();
        setSafeZones(data);
      } catch (error) {
        console.error("Failed to fetch safe zones", error);
      }
    };
    fetchZones();
  }, []);

  return (
    <div className="fade-in" style={{ 
      minHeight: 'calc(100vh - 80px)', 
      padding: '2rem', 
      background: 'radial-gradient(circle at 0% 0%, rgba(236, 72, 153, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)' }}>
            <Shield size={32} color="#34d399" />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
              Safety Network Map
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.25rem', margin: 0 }}>
              Live tracking of verified safe zones and active volunteer communities.
            </p>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="glass-card fade-in" style={{ 
          height: '65vh',
          minHeight: '500px',
          borderRadius: '1.5rem', 
          overflow: 'hidden', 
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
          position: 'relative',
          marginTop: '1rem',
          zIndex: 1
        }}>
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <RecenterMap center={position} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>
                <div style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>You are here</div>
              </Popup>
            </Marker>

            {safeZones.map(zone => (
              <React.Fragment key={zone.id}>
                <Marker position={[zone.lat, zone.lng]}>
                  <Popup>
                    <div style={{ color: 'black' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#059669' }}>{zone.name}</strong><br/>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>{zone.type}</span>
                    </div>
                  </Popup>
                </Marker>
                <Circle 
                  center={[zone.lat, zone.lng]} 
                  radius={500} 
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, weight: 2 }} 
                />
              </React.Fragment>
            ))}
          </MapContainer>
          
          {/* Floating Legend Overlay */}
          <div style={{ 
            position: 'absolute', 
            bottom: '2rem', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1000, 
            display: 'flex', 
            gap: '1.5rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '1rem 2rem',
            borderRadius: '2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%' }}>
                <Home size={16} color="#34d399" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>Official Safe Zones</span>
            </div>
            
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%' }}>
                <Users size={16} color="#818cf8" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>Volunteer Network</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NearbySupport;
