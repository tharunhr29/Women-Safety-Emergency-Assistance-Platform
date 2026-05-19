import React, { useState, useEffect } from 'react';
import { getAlertHistory, resolveAlert } from '../services/api';
import { Clock, CheckCircle, MapPin, ChevronRight } from 'lucide-react';

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await getAlertHistory();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id);
      fetchHistory();
    } catch (error) {
      alert('Failed to resolve alert');
    }
  };

  return (
    <div className="fade-in" style={{ 
      minHeight: 'calc(100vh - 80px)', 
      padding: '2rem', 
      background: 'radial-gradient(circle at 0% 0%, rgba(236, 72, 153, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'
    }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)' }}>
            <Clock size={32} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
              Incident Archive
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.25rem', margin: 0 }}>
              Complete history of your SOS activations and emergency events.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div className="sos-pulse" style={{ width: '50px', height: '50px', border: '3px solid #818cf8', borderRadius: '50%', margin: '0 auto 1rem auto', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
            <p>Loading your history...</p>
          </div>
        ) : alerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {alerts.map((alert) => (
              <div key={alert._id} className="fade-in" style={{ 
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', 
                borderRadius: '1rem', 
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px -10px rgba(0,0,0,0.7)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)'; }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '1.25rem', 
                    borderRadius: '1rem', 
                    background: alert.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: alert.status === 'active' ? '#f87171' : '#34d399',
                    boxShadow: alert.status === 'active' ? 'inset 0 0 20px rgba(239, 68, 68, 0.2)' : 'inset 0 0 20px rgba(16, 185, 129, 0.2)'
                  }}>
                    {alert.status === 'active' ? <Clock size={28} /> : <CheckCircle size={28} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {new Date(alert.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}</span>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.35rem 1rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 800,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      background: alert.status === 'active' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      boxShadow: alert.status === 'active' ? '0 4px 15px rgba(239, 68, 68, 0.4)' : '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}>
                      {alert.status}
                    </span>
                    {alert.status === 'active' && (
                      <button 
                        onClick={() => handleResolve(alert._id)} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: '#818cf8', 
                          fontWeight: 600, 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline'
                        }}>
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '6rem 2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem auto' }}>
              <Clock size={40} color="rgba(255,255,255,0.2)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>No Archive Records</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Your emergency alert history is currently empty. Any future SOS activations will be permanently recorded here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertHistory;
