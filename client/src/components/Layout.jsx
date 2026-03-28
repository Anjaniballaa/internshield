import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = path => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      <nav style={{ background: '#1a1a2e', borderBottom: '1px solid #2d2d44' }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold" style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>InternShield</span>
          </Link>
          <div className="flex gap-2 items-center">
            {[{ path: '/', label: 'Dashboard' }, { path: '/settings', label: 'Settings' }].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                background: isActive(path) ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: isActive(path) ? 'white' : '#94a3b8',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>{label}</Link>
            ))}
            <button onClick={logout} style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid rgba(239,68,68,0.2)'
            }}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}