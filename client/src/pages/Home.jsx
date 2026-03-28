import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const cardStyle = {
  background: '#1a1a2e',
  border: '1px solid #2d2d44',
  borderRadius: '16px',
  padding: '24px'
};

const riskConfig = {
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  emoji: '✅' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',  emoji: '⚠️' },
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',   emoji: '❌' }
};

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [latestReports, setLatestReports] = useState({});
  const [scanning, setScanning] = useState({});

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      r.data.forEach(p => {
        api.get(`/reports/project/${p._id}`).then(rr => {
          setLatestReports(prev => ({ ...prev, [p._id]: rr.data[0] }));
        });
      });
    });
    api.get('/reports/stats/overview').then(r => setStats(r.data));
  }, []);

  const triggerScan = async projectId => {
    setScanning(prev => ({ ...prev, [projectId]: true }));
    try {
      const { data } = await api.post(`/projects/${projectId}/scan`);
      setLatestReports(prev => ({ ...prev, [projectId]: data }));
    } catch (e) {
      alert(e.response?.data?.message || 'Scan failed');
    }
    setScanning(prev => ({ ...prev, [projectId]: false }));
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Monitor your repositories for security risks</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Scans', value: stats.totalScans, icon: '🔍', color: '#667eea' },
            { label: 'Blocked', value: stats.blocked, icon: '🚫', color: '#ef4444' },
            { label: 'Top Issue', value: stats.mostCommonIssue?.replace(/_/g, ' ') || 'None', icon: '⚠️', color: '#f59e0b' }
          ].map(s => (
            <div key={s.label} style={cardStyle}>
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</p>
                  <p style={{ color: s.color, fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>{s.value}</p>
                </div>
                <span style={{ fontSize: '28px' }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Repos */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Connected Repositories</h2>
        <Link to="/settings" style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500'
        }}>+ Connect Repo</Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
          <span style={{ fontSize: '48px' }}>🔗</span>
          <p style={{ color: '#64748b', marginTop: '12px' }}>No repos connected yet</p>
          <Link to="/settings" style={{ color: '#667eea', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>
            Connect your first repo →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => {
            const report = latestReports[p._id];
            const risk = report ? riskConfig[report.riskLevel] : null;
            return (
              <div key={p._id} style={{
                ...cardStyle,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 0.2s',
                borderColor: risk ? risk.border : '#2d2d44'
              }}>
                <div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '20px' }}>📦</span>
                    <p style={{ color: 'white', fontWeight: '600' }}>{p.repoName}</p>
                  </div>
                  <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px', marginLeft: '32px' }}>{p.repoUrl}</p>
                  {report && risk && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: risk.bg, border: `1px solid ${risk.border}`,
                      borderRadius: '20px', padding: '4px 12px', marginTop: '10px', marginLeft: '32px'
                    }}>
                      <span style={{ fontSize: '12px' }}>{risk.emoji}</span>
                      <span style={{ color: risk.color, fontSize: '12px', fontWeight: '500' }}>
                        {report.riskLevel} Risk — Score: {report.riskScore}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => triggerScan(p._id)} disabled={scanning[p._id]} style={{
                    background: scanning[p._id] ? '#2d2d44' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white', padding: '8px 18px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer'
                  }}>
                    {scanning[p._id] ? '⏳ Scanning...' : '🔍 Scan Now'}
                  </button>
                  <Link to={`/history/${p._id}`} style={{
                    background: '#0f0f1a', color: '#94a3b8', padding: '8px 18px',
                    borderRadius: '8px', fontSize: '13px', border: '1px solid #2d2d44'
                  }}>History</Link>
                  {report && (
                    <Link to={`/reports/${report._id}`} style={{
                      background: '#0f0f1a', color: '#667eea', padding: '8px 18px',
                      borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(102,126,234,0.3)'
                    }}>Report</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}