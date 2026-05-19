import React, { useState } from 'react';
import { Shield, Mail, Lock, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', phone: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.phone) {
      setError("Please provide both email and phone number.");
      return;
    }
    setError(null);
    setStep(2); // Move to password reset step
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError("Password must contain at least one alphabet, one number, and one special character.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ 
        email: formData.email, 
        phone: formData.phone, 
        newPassword: formData.newPassword 
      });
      setSuccess("Password reset successfully! You can now login.");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Check your email and phone.");
      setStep(1); // Back to verification step
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} color="#ec4899" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {step === 1 ? "Verify your identity" : "Create a new secure password"}
          </p>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleVerify}>
            <div className="input-group">
              <label><Mail size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Email Address</label>
              <input 
                type="email" 
                className="input-control" 
                placeholder="jane@example.com"
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label><Phone size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Phone Number</label>
              <input 
                type="tel" 
                className="input-control" 
                placeholder="Registered phone number"
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Verify Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label><Lock size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> New Password</label>
              <input 
                type="password" 
                className="input-control" 
                placeholder="••••••••"
                required 
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label><Lock size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Confirm New Password</label>
              <input 
                type="password" 
                className="input-control" 
                placeholder="••••••••"
                required 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
