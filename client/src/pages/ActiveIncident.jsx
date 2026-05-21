import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { updateResponseStatus } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Shield, MapPin, User, Navigation, CheckCircle } from 'lucide-react';

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
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const ActiveIncident = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const initialAlert = location.state?.alert;
  
  const [alertData, setAlertData] = useState(initialAlert);
  const [userLocation, setUserLocation] = useState(
    initialAlert ? [initialAlert.location.lat, initialAlert.location.lng] : null
  );
  const [status, setStatus] = useState('en_route'); // en_route or arrived

  useEffect(() => {
    if (!alertData) {
      navigate('/volunteer-dashboard');
      return;
    }

    // Listen for real-time location updates from the user
    socket.on('location_updated', (data) => {
      // Assuming data contains userId. We should only update if it matches the alert's userId
      const alertUserId = alertData.userId._id || alertData.userId;
      if (data.userId === alertUserId) {
        setUserLocation([data.lat, data.lng]);
      }
    });

    return () => {
      socket.off('location_updated');
    };
  }, [alertData, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateResponseStatus(id, newStatus);
      setStatus(newStatus);
      if (newStatus === 'arrived') {
        // You might want to stay on page or navigate away after a while
      }
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  if (!alertData || !userLocation) return <div>Loading incident...</div>;

  return (
    <div className="container fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* Map View */}
        <div className="glass-card" style={{ padding: '1rem', height: '70vh', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin color="var(--danger)" /> Target Location
          </h2>
          <div style={{ flex: 1, borderRadius: '1rem', overflow: 'hidden' }}>
            <MapContainer center={userLocation} zoom={16} style={{ height: '100%', width: '100%' }}>
              <RecenterMap center={userLocation} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <Marker position={userLocation}>
                <Popup>User is here</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Incident Details & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              Incident Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}><User size={14} /> User Name</label>
                <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{alertData.userId.name || 'Unknown'}</p>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}><Shield size={14} /> Status</label>
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.875rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)'
                  }}>
                    ACTIVE EMERGENCY
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Your Response</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn glass" 
                style={{ 
                  background: status === 'en_route' ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)',
                  border: status === 'en_route' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  color: status === 'en_route' ? 'var(--primary)' : 'white'
                }}
                disabled={status === 'en_route'}
              >
                <Navigation size={18} /> En Route
              </button>
              
              <button 
                className="btn btn-success" 
                style={{ 
                  background: status === 'arrived' ? 'var(--success)' : 'var(--glass-bg)',
                  border: status === 'arrived' ? 'none' : '1px solid var(--success)',
                  color: status === 'arrived' ? 'white' : 'var(--success)'
                }}
                onClick={() => handleStatusUpdate('arrived')}
                disabled={status === 'arrived'}
              >
                <CheckCircle size={18} /> Mark as Arrived
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ActiveIncident;
