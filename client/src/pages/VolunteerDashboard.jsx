import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { getActiveAlerts, respondToAlert } from '../services/api';
import { ShieldAlert, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const VolunteerDashboard = () => {
  const { user, refreshProfile } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (user && user.role === 'volunteer') {
      if (!user.isVerified) {
        setLoading(false);
        return;
      }
      socket.emit('join_volunteer');
      fetchActiveAlerts();

      socket.on('receive_alert', (newAlert) => {
        setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
        // Optionally play a sound or show a browser notification here
      });

      return () => {
        socket.off('receive_alert');
      };
    } else {
      navigate('/dashboard'); // Redirect non-volunteers
    }
  }, [user, navigate]);

  const fetchActiveAlerts = async () => {
    try {
      const { data } = await getActiveAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch active alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (alertId) => {
    try {
      const { data } = await respondToAlert(alertId);
      // Let the user know someone is responding
      socket.emit('volunteer_responding', {
        userId: data.userId._id || data.userId,
        volunteerId: user._id,
        volunteerName: user.name,
        volunteerPhone: user.phone || 'N/A'
      });
      
      navigate(`/incident/${alertId}`, { state: { alert: data } });
    } catch (error) {
      if (error.response?.data?.message === "Already responding to this alert") {
        // If already responding, proceed to tracking page directly
        const existingAlert = alerts.find(a => a._id === alertId);
        navigate(`/incident/${alertId}`, { state: { alert: existingAlert } });
        return;
      }
      alert(error.response?.data?.message || 'Failed to respond to alert');
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 0' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert color="var(--primary)" /> Volunteer Dashboard
        </h1>

        {user && !user.isVerified ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="sos-pulse" style={{ display: 'inline-block', padding: '1.5rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '1.5rem' }}>
              <ShieldAlert size={48} color="var(--danger)" />
            </div>
            <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Verification Pending</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
              Your volunteer account is currently pending administrative verification. For security and trust on our platform, you will gain access to active emergency alerts once an administrator reviews and verifies your details.
            </p>
            <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              If you have just registered, please allow some time for the review process.
            </div>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Monitoring for active emergency alerts...
            </p>

            {loading ? (
              <p>Loading active alerts...</p>
            ) : alerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {alerts.map((alert) => (
                  <div key={alert._id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ 
                        padding: '1rem', 
                        borderRadius: '0.75rem', 
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)'
                      }}>
                        <ShieldAlert size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                          Emergency Alert
                        </h4>
                        <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <MapPin size={14} /> Location Details Available
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      {alert.responders?.some(
                        r => (r.volunteerId?._id || r.volunteerId || '').toString() === (user?._id || '').toString()
                      ) ? (
                        <button 
                          onClick={() => navigate(`/incident/${alert._id}`, { state: { alert } })} 
                          className="btn" 
                          style={{ 
                            padding: '0.5rem 1.5rem', 
                            borderRadius: '2rem',
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)'
                          }}
                        >
                          VIEW INCIDENT
                        </button>
                      ) : (
                        <button onClick={() => handleRespond(alert._id)} className="btn btn-danger" style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem' }}>
                          RESPOND NOW
                        </button>
                      )}
                      <ChevronRight color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--glass-bg)', borderRadius: '1rem' }}>
                <div className="sos-pulse" style={{ display: 'inline-block', padding: '1.5rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', marginBottom: '1rem' }}>
                  <ShieldAlert size={48} color="var(--success)" />
                </div>
                <h3 style={{ color: 'var(--success)' }}>No Active Alerts</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Your area is currently safe. Stay alert.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
