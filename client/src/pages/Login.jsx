import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
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
        background: 'linear-gradient(135deg, #0f172a 0%, #172554 50%, #4338ca 100%)',
      }}>
        {/* Abstract Glowing Orbs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <Shield size={64} color="#818cf8" style={{ marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(129,140,248,0.5))' }} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Welcome <br/>
            <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Back
            </span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Access your secure dashboard to manage your safety profile and monitor active alerts.
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
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Sign In</h2>
            <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
              <Mail size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
              <Lock size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ color: '#818cf8', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn" style={{ 
              width: '100%', 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
              color: 'white', 
              fontSize: '1.125rem', 
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)'
            }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600, marginLeft: '0.5rem' }}>Register</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
