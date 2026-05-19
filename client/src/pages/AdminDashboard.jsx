import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  adminGetUsers, adminVerifyVolunteer, adminUpdateUserRole, adminDeleteUser, adminGetAllAlerts, 
  adminCreateSafeZone, adminDeleteSafeZone, getSafeZones, adminMarkFalseAlarm 
} from '../services/api';
import { ShieldCheck, Users, Map, FileText, CheckCircle, Trash2, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  
  // Data States
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  
  // Form State
  const [newZone, setNewZone] = useState({ name: '', type: 'Safe Zone', lat: '', lng: '', contactNumber: '' });
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      socket.emit('join_admin');
      fetchData();

      socket.on('receive_alert_admin', (newAlert) => {
        setAlerts((prev) => [newAlert, ...prev]);
      });

      socket.on('admin_data_updated', () => {
        fetchData();
      });

      return () => {
        socket.off('receive_alert_admin');
        socket.off('admin_data_updated');
      };
    } else {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, alertsRes, zonesRes] = await Promise.all([
        adminGetUsers(),
        adminGetAllAlerts(),
        getSafeZones()
      ]);
      setUsers(usersRes.data);
      setAlerts(alertsRes.data);
      setSafeZones(zonesRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminVerifyVolunteer(id);
      fetchData(); // Refresh list
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser({ ...selectedUser, isVerified: true });
      }
    } catch (error) {
      alert('Failed to verify volunteer');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await adminUpdateUserRole(id, newRole);
      fetchData();
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (id) => {
    // Prevent self-deletion
    if (user && user._id === id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await adminDeleteUser(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleMarkFalseAlarm = async (id) => {
    if (window.confirm("Are you sure you want to mark this alert as a false alarm? The user will be penalized.")) {
      try {
        await adminMarkFalseAlarm(id);
        fetchData();
      } catch (error) {
        alert('Failed to mark false alarm');
      }
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      await adminCreateSafeZone(newZone);
      setNewZone({ name: '', type: 'Safe Zone', lat: '', lng: '', contactNumber: '' });
      fetchData();
    } catch (error) {
      alert('Failed to add safe zone');
    }
  };

  const handleDeleteZone = async (id) => {
    try {
      await adminDeleteSafeZone(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete safe zone');
    }
  };

  // --- KPI Calculations ---
  const totalAlerts = alerts.length;
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
  const successfulAssistanceRate = totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0;
  
  const alertsWithResponders = alerts.filter(a => a.responders && a.responders.length > 0);
  const volunteerResponseRate = totalAlerts > 0 ? Math.round((alertsWithResponders.length / totalAlerts) * 100) : 0;

  let totalResponseTimeMs = 0;
  let responseCount = 0;
  
  alertsWithResponders.forEach(a => {
    if (a.responders[0]?.timestamp && a.timestamp) {
      const creationTime = new Date(a.timestamp).getTime();
      const firstResponderTime = new Date(a.responders[0].timestamp).getTime();
      const diff = firstResponderTime - creationTime;
      if (diff > 0 && diff < 86400000) { // sanity check (less than 24 hours)
        totalResponseTimeMs += diff;
        responseCount++;
      }
    }
  });

  const avgResponseTimeMs = responseCount > 0 ? totalResponseTimeMs / responseCount : 0;
  const avgResponseMins = Math.floor(avgResponseTimeMs / 60000);
  const avgResponseSecs = Math.floor((avgResponseTimeMs % 60000) / 1000);
  const avgResponseString = responseCount > 0 
    ? `${avgResponseMins}m ${avgResponseSecs}s` 
    : "N/A";
  // -------------------------

  return (
    <div className="container fade-in" style={{ padding: '2rem 0' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldCheck color="var(--primary)" size={32} /> Admin Control Panel
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'glass'}`} 
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Manage Users
          </button>
          <button 
            className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'glass'}`} 
            onClick={() => setActiveTab('alerts')}
          >
            <FileText size={18} /> Monitor Alerts
          </button>
          <button 
            className={`btn ${activeTab === 'zones' ? 'btn-primary' : 'glass'}`} 
            onClick={() => setActiveTab('zones')}
          >
            <Map size={18} /> Safe Zones
          </button>
          <button 
            className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'glass'}`} 
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={18} /> Reports
          </button>
        </div>

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <h3>Volunteers & Users</h3>
            <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{u.name}</td>
                      <td style={{ padding: '1rem' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          className="input-control" 
                          style={{ padding: '0.25rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', width: 'auto' }}
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                          disabled={user && user._id === u._id} // Prevent changing own role
                        >
                          <option value="user">User</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u.role === 'volunteer' ? (
                          u.isVerified ? 
                            <span style={{ color: 'var(--success)' }}>Verified</span> : 
                            <span style={{ color: 'var(--warning)' }}>Pending</span>
                        ) : 'N/A'}
                        {u.sosBanUntil && new Date(u.sosBanUntil) > Date.now() && (
                          <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>SOS Banned</div>
                        )}
                        {u.falseAlarmCount > 0 && !(u.sosBanUntil && new Date(u.sosBanUntil) > Date.now()) && (
                          <div style={{ color: 'var(--warning)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{u.falseAlarmCount} False Alarms</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          onClick={() => setSelectedUser(u)} 
                          className="btn glass" 
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--primary)' }}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        {u.role === 'volunteer' && !u.isVerified && (
                          <button onClick={() => handleVerify(u._id)} className="btn btn-success" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                            Verify
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(u._id)} 
                          className="btn glass" 
                          style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          disabled={user && user._id === u._id} // Prevent self-deletion
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Alerts */}
        {activeTab === 'alerts' && (
          <div className="fade-in">
            <h3>Emergency Alerts Log</h3>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.map(alert => (
                <div key={alert._id} className="glass" style={{ padding: '1rem', borderLeft: `4px solid ${alert.status === 'active' ? 'var(--danger)' : 'var(--success)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>User:</strong> {alert.userId?.name || 'Unknown'} <br/>
                      <small style={{ color: 'var(--text-muted)' }}>{new Date(alert.timestamp).toLocaleString()}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        background: alert.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : (alert.status === 'false_alarm' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                        color: alert.status === 'active' ? 'var(--danger)' : (alert.status === 'false_alarm' ? '#eab308' : 'var(--success)')
                      }}>
                        {alert.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {(alert.status === 'active' || alert.status === 'resolved') && (
                        <button 
                          onClick={() => handleMarkFalseAlarm(alert._id)}
                          className="btn glass"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#eab308' }}
                        >
                          Mark False Alarm
                        </button>
                      )}
                    </div>
                  </div>
                  {alert.responders && alert.responders.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                      <strong>Responders:</strong> {alert.responders.map(r => r.volunteerId?.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Safe Zones */}
        {activeTab === 'zones' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div>
              <h3>Add Safe Zone</h3>
              <form onSubmit={handleAddZone} style={{ marginTop: '1rem' }}>
                <input className="input-control" placeholder="Name (e.g. City Hospital)" required value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} style={{ marginBottom: '1rem' }} />
                <select className="input-control" value={newZone.type} onChange={e => setNewZone({...newZone, type: e.target.value})} style={{ marginBottom: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                  <option value="Police Station">Police Station</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Volunteer Hub">Volunteer Hub</option>
                  <option value="Safe Zone">Safe Zone</option>
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input className="input-control" placeholder="Latitude" type="number" step="any" required value={newZone.lat} onChange={e => setNewZone({...newZone, lat: e.target.value})} />
                  <input className="input-control" placeholder="Longitude" type="number" step="any" required value={newZone.lng} onChange={e => setNewZone({...newZone, lng: e.target.value})} />
                </div>
                <input className="input-control" placeholder="Contact Number (Optional)" value={newZone.contactNumber} onChange={e => setNewZone({...newZone, contactNumber: e.target.value})} style={{ marginBottom: '1rem' }} />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Zone</button>
              </form>
            </div>
            
            <div>
              <h3>Existing Zones</h3>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {safeZones.map(zone => (
                  <div key={zone._id} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{zone.name}</strong> ({zone.type})<br/>
                      <small style={{ color: 'var(--text-muted)' }}>Lat: {zone.location.lat.toFixed(4)}, Lng: {zone.location.lng.toFixed(4)}</small>
                    </div>
                    <button onClick={() => handleDeleteZone(zone._id)} className="btn glass" style={{ color: 'var(--danger)', padding: '0.5rem' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Reports */}
        {activeTab === 'reports' && (
          <div className="fade-in">
            <h3>Incident & Performance Reports</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Alerts</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{alerts.length}</div>
              </div>

              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--danger)' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Emergencies</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                  {alerts.filter(a => a.status === 'active').length}
                </div>
              </div>

              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--warning)' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Users</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                  {users.length}
                </div>
              </div>

              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--success)' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Verified Responders</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  {users.filter(u => u.role === 'volunteer' && u.isVerified).length}
                </div>
              </div>

            </div>

            <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Advanced Performance KPIs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid #8b5cf6' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Avg Response Time</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {avgResponseString}
                </div>
              </div>

              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--success)' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Successful Assistance</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  {successfulAssistanceRate}%
                </div>
              </div>

              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Volunteer Response Rate</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {volunteerResponseRate}%
                </div>
              </div>
            </div>
            
            <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Performance Summary</h4>
              <p style={{ color: 'var(--text-muted)' }}>
                The platform is currently tracking <strong>{alerts.length}</strong> total historical incidents. 
                There are <strong>{users.filter(u => u.role === 'volunteer' && u.isVerified).length}</strong> fully verified volunteers ready to respond across <strong>{safeZones.length}</strong> designated safe zones.
              </p>
              <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.print()}>
                Export Report as PDF
              </button>
            </div>
          </div>
        )}

      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-card fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setSelectedUser(null)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              User Profile Details
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Full Name</strong>
                <p>{selectedUser.name}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Email</strong>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Phone</strong>
                <p>{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Joined Date</strong>
                <p>{new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Blood Group</strong>
                <p style={{ color: 'var(--danger)' }}>{selectedUser.bloodGroup || 'Not Provided'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Medical Conditions</strong>
                <p>{selectedUser.medicalConditions || 'None'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ color: 'var(--text-muted)' }}>SOS Status</strong>
                <p>
                  {selectedUser.sosBanUntil && new Date(selectedUser.sosBanUntil) > Date.now() ? (
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                      Banned until {new Date(selectedUser.sosBanUntil).toLocaleDateString()}
                    </span>
                  ) : selectedUser.falseAlarmCount > 0 ? (
                    <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                      {selectedUser.falseAlarmCount} False Alarms Logged
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)' }}>Good Standing</span>
                  )}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Emergency Contacts</strong>
              {selectedUser.emergencyContacts && selectedUser.emergencyContacts.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {selectedUser.emergencyContacts.map((contact, idx) => (
                    <li key={idx} style={{ background: 'var(--glass-bg)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong>{contact.name}</strong> ({contact.relation}) - {contact.phone}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>No contacts provided.</p>
              )}
            </div>

            {selectedUser.role === 'volunteer' && !selectedUser.isVerified && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--warning)' }}>This user is requesting Volunteer status and requires your verification.</p>
                <button 
                  className="btn btn-success" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => handleVerify(selectedUser._id)}
                >
                  <CheckCircle /> Approve & Verify Volunteer
                </button>
              </div>
            )}
            
            {selectedUser.role === 'volunteer' && selectedUser.isVerified && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <ShieldCheck /> Verified Volunteer Account
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
