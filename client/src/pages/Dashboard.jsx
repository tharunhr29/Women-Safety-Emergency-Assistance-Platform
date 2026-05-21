import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { AlertCircle, MapPin, ShieldAlert, PhoneCall, CheckCircle, Navigation, HeartHandshake, Clock } from 'lucide-react';
import { createAlert, getAlertHistory, resolveAlert } from '../services/api';
import { useNavigate } from 'react-router-dom';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const Dashboard = () => {
  const { user } = useAuth();
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [activeResponders, setActiveResponders] = useState([]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Restore active SOS state and existing responders on mount
  useEffect(() => {
    const checkActiveSOS = async () => {
      if (user && user.role !== 'volunteer') {
        try {
          const { data } = await getAlertHistory();
          if (data && data.length > 0) {
            const latestAlert = data[0];
            if (latestAlert.status === 'active') {
              setIsAlertActive(true);
              setActiveAlertId(latestAlert._id);
              
              if (latestAlert.responders && latestAlert.responders.length > 0) {
                const formatted = latestAlert.responders.map(r => ({
                  volunteerId: r.volunteerId?._id || r.volunteerId,
                  volunteerName: r.volunteerId?.name || 'Volunteer Helper',
                  volunteerPhone: r.volunteerId?.phone || 'N/A',
                  status: r.status || 'en_route',
                  respondedAt: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setActiveResponders(formatted);
              }
            }
          }
        } catch (err) {
          console.error("Error restoring active SOS session:", err);
        }
      }
    };
    checkActiveSOS();
  }, [user]);

  useEffect(() => {
    if (user) {
      if (user.role === 'volunteer') {
        navigate('/volunteer-dashboard');
      } else {
        socket.emit('join_room', user._id);
        
        socket.on('volunteer_responding', (data) => {
          // Add responder if not already in list
          setActiveResponders(prev => {
            if (prev.some(r => r.volunteerId === data.volunteerId)) {
              return prev;
            }
            return [...prev, {
              volunteerId: data.volunteerId,
              volunteerName: data.volunteerName,
              volunteerPhone: data.volunteerPhone || 'N/A',
              status: 'en_route',
              respondedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
          });
        });

        socket.on('responder_status_updated', (data) => {
          // Update status dynamically (e.g. from 'en_route' to 'arrived')
          setActiveResponders(prev => 
            prev.map(r => r.volunteerId === data.volunteerId ? { ...r, status: data.status } : r)
          );
        });
      }
    }
    
    return () => {
      socket.off('volunteer_responding');
      socket.off('responder_status_updated');
    };
  }, [user, navigate]);

  // Handle periodic real-time location updates when an SOS alert is active
  useEffect(() => {
    let interval;
    if (isAlertActive && user) {
      interval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              socket.emit('update_location', {
                userId: user._id,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
            },
            (err) => {
              console.error("SOS tracking GPS query failed:", err);
            },
            { enableHighAccuracy: true }
          );
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAlertActive, user]);

  const handleSOS = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setIsAlertActive(true);
          setError(null);

          try {
            const alertData = {
              lat: latitude,
              lng: longitude,
              address: 'Current Location', // Could use reverse geocoding here
            };
            
            const response = await createAlert(alertData);
            setActiveAlertId(response.data._id);
            socket.emit('send_alert', { ...response.data, userName: user.name });

          } catch (err) {
            console.error('Alert creation failed', err);
            setError('Failed to trigger alert. Please try again.');
            setIsAlertActive(false);
          }
        },
        (err) => {
          setError('Location access denied. SOS requires location services.');
        }
      );
    } else {
      setError('Geolocation not supported by this browser.');
    }
  };

  const handleResolveAlert = async () => {
    if (!activeAlertId) return;
    try {
      await resolveAlert(activeAlertId);
      setIsAlertActive(false);
      setActiveAlertId(null);
      setActiveResponders([]);
      setError(null);
    } catch (err) {
      console.error("Failed to resolve alert:", err);
      setError("Failed to cancel SOS. Please try again.");
    }
  };

  return (
    <div className="fade-in" style={{ 
      minHeight: 'calc(100vh - 80px)', 
      padding: '2rem', 
      background: 'radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.05) 0%, transparent 70%), radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
              Safety Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              Welcome back, <span style={{ color: 'white', fontWeight: 600 }}>{user?.name || 'User'}</span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '2rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
            <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>System Online</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1.2fr 1fr' : '1fr', gap: '2.5rem' }}>
          
          {/* Left Side: SOS Button Card */}
          <div className="glass-card" style={{ 
            padding: '3.5rem 2rem', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
          }}>
            {/* Subtle Grid Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }}></div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              {user?.sosBanUntil && new Date(user.sosBanUntil) > Date.now() ? (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', fontWeight: 'bold' }}>
                  <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                  SOS Feature Disabled until {new Date(user.sosBanUntil).toLocaleDateString()} due to multiple false alarms.
                </div>
              ) : user?.falseAlarmCount > 0 ? (
                <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center', fontWeight: 'bold' }}>
                  <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                  Warning: You have {user.falseAlarmCount} false SOS alerts. Misusing this feature leads to a 15-day suspension.
                </div>
              ) : null}

              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>Emergency SOS</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '3.5rem', maxWidth: '350px', margin: '0 auto 3.5rem auto', lineHeight: 1.6 }}>
                Hold the button below to instantly alert emergency contacts and nearby support teams.
              </p>

              {/* Pulsing Button Wrapper */}
              <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                
                {/* Decorative pulsing rings */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: isAlertActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.05)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', width: '120%', height: '120%', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.1)', animation: 'spin 10s linear infinite', pointerEvents: 'none' }}></div>

                <button 
                  onClick={handleSOS}
                  disabled={user?.sosBanUntil && new Date(user.sosBanUntil) > Date.now()}
                  style={{ 
                    width: '220px', 
                    height: '220px', 
                    borderRadius: '50%', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    cursor: (user?.sosBanUntil && new Date(user.sosBanUntil) > Date.now()) ? 'not-allowed' : 'pointer',
                    background: (user?.sosBanUntil && new Date(user.sosBanUntil) > Date.now()) ? 'radial-gradient(circle at 30% 30%, #4b5563, #1f2937)' : (isAlertActive ? 'radial-gradient(circle at 30% 30%, #ef4444, #b91c1c)' : 'radial-gradient(circle at 30% 30%, #f87171, #ef4444 60%, #991b1b)'),
                    boxShadow: (user?.sosBanUntil && new Date(user.sosBanUntil) > Date.now()) ? 'none' : (isAlertActive ? '0 0 60px rgba(239, 68, 68, 0.8), inset 0 0 20px rgba(0,0,0,0.5)' : '0 20px 40px rgba(239, 68, 68, 0.3), inset 0 5px 15px rgba(255,255,255,0.4), inset 0 -10px 20px rgba(0,0,0,0.4)'),
                    color: (user?.sosBanUntil && new Date(user.sosBanUntil) > Date.now()) ? '#9ca3af' : 'white',
                    transition: 'all 0.2s ease',
                    transform: isAlertActive ? 'scale(0.95)' : 'scale(1)'
                  }}
                  onMouseOver={(e) => { if(!isAlertActive) e.currentTarget.style.transform = 'scale(1.05)' }}
                  onMouseOut={(e) => { if(!isAlertActive) e.currentTarget.style.transform = 'scale(1)' }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => { if(!isAlertActive) e.currentTarget.style.transform = 'scale(1.05)' }}
                >
                  <ShieldAlert size={64} style={{ marginBottom: '0.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                  <span style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {isAlertActive ? 'ACTIVE' : 'SOS'}
                  </span>
                </button>
              </div>

              {error && (
                <div className="fade-in" style={{ marginTop: '2.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <p style={{ color: '#fca5a5', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} /> {error}
                  </p>
                </div>
              )}
              
              {isAlertActive && (
                <div className="fade-in" style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <p style={{ color: '#34d399', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span className="sos-pulse" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', marginRight: '0.5rem' }}></span>
                      <MapPin size={18} /> Signal broadcasting. Help is on the way.
                    </p>
                  </div>
                  <button 
                    onClick={handleResolveAlert}
                    className="btn btn-danger"
                    style={{ 
                      width: '100%', 
                      fontWeight: '700', 
                      padding: '1rem', 
                      fontSize: '1.1rem',
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    I Am Safe Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Quick Info & Active Responders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Active Responders Card */}
            {isAlertActive && activeResponders.length > 0 && (
              <div className="glass-card fade-in" style={{ 
                padding: '2rem', 
                border: '1px solid rgba(99, 102, 241, 0.2)', 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.15)'
              }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'white', fontSize: '1.25rem' }}>
                  <div className="sos-pulse" style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <HeartHandshake size={22} color="#818cf8" />
                  </div>
                  Active Responders
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {activeResponders.map((responder, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1rem', 
                      padding: '1.25rem', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '1rem', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Status indicator glow strip */}
                      <div style={{ 
                        position: 'absolute', 
                        left: 0, 
                        top: 0, 
                        bottom: 0, 
                        width: '4px', 
                        background: responder.status === 'arrived' ? '#10b981' : '#6366f1' 
                      }}></div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>{responder.volunteerName}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                            <Clock size={12} /> Accepted at {responder.respondedAt}
                          </p>
                        </div>
                        
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          padding: '0.35rem 0.85rem', 
                          borderRadius: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: responder.status === 'arrived' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: responder.status === 'arrived' ? '#10b981' : '#818cf8',
                          border: responder.status === 'arrived' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {responder.status === 'arrived' ? (
                            <>
                              <CheckCircle size={12} /> Arrived
                            </>
                          ) : (
                            <>
                              <Navigation size={12} /> En Route
                            </>
                          )}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          Need to coordinate?
                        </span>
                        
                        <a href={`tel:${responder.volunteerPhone}`} style={{ 
                          padding: '0.5rem 1.25rem', 
                          background: 'rgba(16, 185, 129, 0.15)', 
                          color: '#10b981', 
                          borderRadius: '0.75rem', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          textDecoration: 'none', 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >
                          <PhoneCall size={14} /> Call Rescuer
                        </a>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist Card */}
            <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'white', fontSize: '1.25rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <AlertCircle size={20} color="#fbbf24" />
                </div>
                Safety Checklist
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>✓</div>
                  <span style={{ color: 'var(--text-muted)' }}>Emergency contacts verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>✓</div>
                  <span style={{ color: 'var(--text-muted)' }}>Real-time location active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>✓</div>
                  <span style={{ color: 'var(--text-muted)' }}>Personal profile updated</span>
                </div>
              </div>
            </div>

            {/* Contacts Card */}
            <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'white', fontSize: '1.25rem', margin: 0 }}>Trusted Contacts</h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 600 }}>
                  {user?.emergencyContacts?.length || 0} Saved
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {user?.emergencyContacts?.length > 0 ? (
                  user.emergencyContacts.map((contact, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.02)', transition: 'all 0.2s ease' }} className="contact-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'white', margin: '0 0 0.25rem 0' }}>{contact.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{contact.relation}</p>
                        </div>
                      </div>
                      <a href={`tel:${contact.phone}`} style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', transition: 'all 0.2s ease' }}>
                        <PhoneCall size={18} />
                      </a>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No contacts added yet. <br/>Add them in your profile to enable automatic SOS alerts.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
