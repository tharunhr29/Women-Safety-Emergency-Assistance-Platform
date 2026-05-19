import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, LogOut, History, MapPin } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="glass" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 1000 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>
        <Shield size={32} color="#f43f5e" />
        <span>SafeGuard</span>
      </Link>

      {user ? (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user.role === 'admin' && (
            <Link to="/admin-dashboard" style={{ color: 'var(--warning)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }} className="nav-link">
              <Shield size={18} /> Admin Panel
            </Link>
          )}
          {location.pathname !== '/admin-dashboard' && (
            <>
              {user.role === 'volunteer' ? (
                <Link to="/volunteer-dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-link">
                  <MapPin size={18} /> Vol. Dashboard
                </Link>
              ) : (
                <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-link">
                  <MapPin size={18} /> Dashboard
                </Link>
              )}
              <Link to="/history" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-link">
                <History size={18} /> History
              </Link>
              <Link to="/nearby" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-link">
                <Shield size={18} /> Safe Zones
              </Link>
              <Link to="/profile" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-link">
                <User size={18} /> Profile
              </Link>
            </>
          )}
          <button onClick={logout} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      ) : (
        location.pathname !== '/admin-dashboard' && location.pathname !== '/admin-login' && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" className="btn glass" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register</Link>
          </div>
        )
      )}
    </nav>
  );
};

export default Navbar;
