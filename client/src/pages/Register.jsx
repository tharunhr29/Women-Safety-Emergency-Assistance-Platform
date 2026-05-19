import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const { register, loading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
    if (!passwordRegex.test(formData.password)) {
      alert("Password must contain at least one alphabet, one number, and one special character.");
      return;
    }

    register(formData);
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%)',
      }}>
        {/* Abstract Glowing Orbs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <Shield size={64} color="#ec4899" style={{ marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.5))' }} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Empowering <br/>
            <span style={{ background: 'linear-gradient(to right, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Safety
            </span> Together.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Join a network of verified responders and proactive citizens dedicated to creating a secure environment for everyone.
          </p>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="fade-in" style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ width: '100%', maxWidth: '450px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)' }}>Get started with your free safety profile</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem', transition: 'all 0.3s ease' }}>
              <User size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
              <Mail size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
              <Phone size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
                <Lock size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
                <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
                <Lock size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
                <input type="password" placeholder="Confirm" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '0.75rem' }}>
              <User size={18} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
              <select value={formData.role || "user"} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem', appearance: 'none' }}>
                <option value="user" style={{ color: "black" }}>Normal User (Safety Needs)</option>
                <option value="volunteer" style={{ color: "black" }}>Volunteer Responder</option>
              </select>
            </div>

            <button type="submit" className="btn" style={{ 
              width: '100%', 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', 
              color: 'white', 
              fontSize: '1.125rem', 
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(236,72,153,0.4)'
            }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Join Now'} <ArrowRight size={20} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: '#ec4899', textDecoration: 'none', fontWeight: 600, marginLeft: '0.5rem' }}>Log in</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;
