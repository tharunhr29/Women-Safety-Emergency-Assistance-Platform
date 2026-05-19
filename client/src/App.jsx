import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AlertHistory from './pages/AlertHistory';
import NearbySupport from './pages/NearbySupport';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ActiveIncident from './pages/ActiveIncident';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/history" element={
              <PrivateRoute>
                <AlertHistory />
              </PrivateRoute>
            } />

            <Route path="/nearby" element={
              <PrivateRoute>
                <NearbySupport />
              </PrivateRoute>
            } />

            <Route path="/volunteer-dashboard" element={
              <PrivateRoute>
                <VolunteerDashboard />
              </PrivateRoute>
            } />

            <Route path="/incident/:id" element={
              <PrivateRoute>
                <ActiveIncident />
              </PrivateRoute>
            } />

            <Route path="/admin-dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
        
        <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          &copy; 2026 SafeGuard - Women Safety & Emergency Assistance Platform <br/>
          <Link to="/admin-login" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-block' }}>Admin Access</Link>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
