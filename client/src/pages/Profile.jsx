import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Droplet, Activity, Plus, ShieldCheck } from 'lucide-react';
import * as api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || '',
    medicalConditions: user?.medicalConditions || ''
  });
  const [contacts, setContacts] = useState(user?.emergencyContacts || []);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile(profile);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.addContact(newContact);
      setContacts(data);
      setNewContact({ name: '', phone: '', relation: '' });
      alert('Contact added!');
    } catch (error) {
      alert('Failed to add contact');
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
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.2))', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(56, 189, 248, 0.1)' }}>
            <User size={32} color="#38bdf8" />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
              Personal Profile
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.25rem', margin: 0 }}>
              Manage your personal safety details and emergency contacts.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          
          {/* Profile Info Card */}
          <div className="glass-card" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', fontSize: '1.5rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Activity size={20} color="#818cf8" />
              </div>
              Identity & Health
            </h2>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                  <User size={16} color="#94a3b8" style={{ marginRight: '0.75rem' }} />
                  <input 
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                    value={profile.name} 
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                  <Phone size={16} color="#94a3b8" style={{ marginRight: '0.75rem' }} />
                  <input 
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                    value={profile.phone} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Blood Group</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                    <Droplet size={16} color="#ef4444" style={{ marginRight: '0.75rem' }} />
                    <input 
                      style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                      placeholder="e.g. O+"
                      value={profile.bloodGroup} 
                      onChange={(e) => setProfile({...profile, bloodGroup: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Medical Info</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                    <Activity size={16} color="#10b981" style={{ marginRight: '0.75rem' }} />
                    <input 
                      style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                      placeholder="Conditions/Allergies"
                      value={profile.medicalConditions} 
                      onChange={(e) => setProfile({...profile, medicalConditions: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn" style={{ 
                width: '100%', 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                color: 'white', 
                fontWeight: 700,
                border: 'none',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
              }} disabled={loading}>
                {loading ? 'Saving Changes...' : 'Update Details'}
              </button>
            </form>
          </div>

          {/* Emergency Contacts Card */}
          <div className="glass-card" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', fontSize: '1.5rem' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <ShieldCheck size={20} color="#f43f5e" />
              </div>
              Trusted Contacts
            </h2>
            
            <div style={{ flex: 1, maxHeight: '250px', overflowY: 'auto', marginBottom: '2rem', paddingRight: '0.5rem' }} className="custom-scrollbar">
              {contacts.map((contact, index) => (
                <div key={index} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'white', margin: '0 0 0.25rem 0' }}>{contact.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{contact.relation} • {contact.phone}</p>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>No contacts added yet.</p>
                </div>
              )}
            </div>

            {/* Add Contact Form */}
            <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'white', fontSize: '1rem' }}>Add New Connection</h4>
              <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', outline: 'none' }}
                  placeholder="Contact Name" 
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  required
                />
                <input 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', outline: 'none' }}
                  placeholder="Phone Number" 
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  required
                />
                <input 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', outline: 'none' }}
                  placeholder="Relation (e.g. Father)" 
                  value={newContact.relation}
                  onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                  required
                />
                <button type="submit" className="btn" style={{ 
                  width: '100%', 
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '0.5rem'
                }}>
                  <Plus size={18} /> Add Contact
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
