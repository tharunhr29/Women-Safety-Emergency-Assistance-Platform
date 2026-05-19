import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { adminLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await adminLogin(formData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#0f172a' }}>
      
      {/* Left Column: Premium Branding (Hidden on mobile) */}
      <div className="fade-in" style={{ 
        flex: 1, 
        position: 'relative', 
        overflow: 'hidden', 
        display: window.innerWidth > 768 ? 'flex' : 'none', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '4rem', 
        background: 'linear-gradient(135deg, #0f172a 0%, #3f3f46 50%, #171717 100%)',
      }}>
        {/* Abstract Glowing Orbs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <ShieldCheck size={72} color="#eab308" style={{ marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(234,179,8,0.4))' }} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            System <br/>
            <span style={{ background: 'linear-gradient(to right, #eab308, #facc15)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Administration
            </span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Authorized personnel only. Monitor active incidents, verify responders, and manage platform resources securely.
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="fade-in" style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Admin Access</h2>
            <p style={{ color: 'var(--text-muted)' }}>Enter your master credentials</p>
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
              <Mail size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <input type="email" name="email" placeholder="Admin Email" required value={formData.email} onChange={handleChange} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
              <Lock size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <input type="password" name="password" placeholder="Master Password" required value={formData.password} onChange={handleChange} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
            </div>

            <button type="submit" className="btn" style={{ 
              width: '100%', 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'linear-gradient(135deg, #ca8a04, #eab308)', 
              color: '#000', 
              fontSize: '1.125rem', 
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(202,138,4,0.4)'
            }}>
              Secure Login <ArrowRight size={20} />
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '1rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <button 
              type="button" 
              style={{ background: 'transparent', border: 'none', color: '#eab308', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
              onClick={() => setFormData({ email: 'admin@safeguard.com', password: 'admin123' })}
            >
              Auto-Fill Demo Credentials
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
