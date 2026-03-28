import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const cardStyle = {
  background: '#1a1a2e',
  border: '1px solid #2d2d44',
  borderRadius: '16px',
  padding: '24px'
};

const inputStyle = {
  width: '100%',
  background: '#0f0f1a',
  border: '1px solid #2d2d44',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#e2e8f0',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle = {
  color: '#94a3b8',
  fontSize: '13px',
  display: 'block',
  marginBottom: '6px'
};

export default function Settings() {
  const [form, setForm] = useState({ repoName: '', repoUrl: '', githubToken: '' });
  const [projects, setProjects] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data));
  }, []);

  const connect = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.post('/projects/connect', form);
      setProjects(prev => [...prev, data]);
      setMsg('Repository connected successfully!');
      setMsgType('success');
      setForm({ repoName: '', repoUrl: '', githubToken: '' });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Connection failed');
      setMsgType('error');
    }
    setLoading(false);
  };

  const removeProject = async id => {
    if (!window.confirm('Remove this repository?')) return;
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Manage your connected repositories</p>
      </div>

      {/* Connect Form */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div className="flex items-center gap-3 mb-6">
          <span style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '10px', padding: '8px', fontSize: '18px'
          }}>🔗</span>
          <div>
            <h2 style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>Connect a GitHub Repository</h2>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Link your repo to start scanning on every push</p>
          </div>
        </div>

        <form onSubmit={connect} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Repo Name (owner/repo)</label>
              <input
                type="text"
                placeholder="octocat/hello-world"
                value={form.repoName}
                onChange={e => setForm({ ...form, repoName: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Repo URL</label>
              <input
                type="url"
                placeholder="https://github.com/octocat/hello-world"
                value={form.repoUrl}
                onChange={e => setForm({ ...form, repoUrl: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>GitHub Personal Access Token</label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={form.githubToken}
              onChange={e => setForm({ ...form, githubToken: e.target.value })}
              style={inputStyle}
              required
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              marginTop: '8px'
            }}>
              <span style={{ fontSize: '12px' }}>ℹ️</span>
              <p style={{ color: '#475569', fontSize: '12px' }}>
                Needs <code style={{ color: '#667eea', background: 'rgba(102,126,234,0.1)', padding: '1px 6px', borderRadius: '4px' }}>repo</code> and <code style={{ color: '#667eea', background: 'rgba(102,126,234,0.1)', padding: '1px 6px', borderRadius: '4px' }}>admin:repo_hook</code> scopes. {' '}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer"
                  style={{ color: '#667eea' }}>Create one here →</a>
              </p>
            </div>
          </div>

          {msg && (
            <div style={{
              background: msgType === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '10px', padding: '12px'
            }}>
              <p style={{ color: msgType === 'success' ? '#10b981' : '#f87171', fontSize: '14px' }}>
                {msgType === 'success' ? '✅' : '❌'} {msg}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? '#2d2d44' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', padding: '12px 28px', borderRadius: '10px',
            fontSize: '14px', fontWeight: '600', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? '⏳ Connecting...' : '🔗 Connect Repository'}
          </button>
        </form>
      </div>

      {/* Connected Repos */}
      <div style={cardStyle}>
        <div className="flex items-center gap-3 mb-6">
          <span style={{
            background: 'rgba(102,126,234,0.1)',
            border: '1px solid rgba(102,126,234,0.2)',
            borderRadius: '10px', padding: '8px', fontSize: '18px'
          }}>📦</span>
          <div>
            <h2 style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>Connected Repositories</h2>
            <p style={{ color: '#64748b', fontSize: '13px' }}>{projects.length} repo{projects.length !== 1 ? 's' : ''} connected</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px',
            border: '1px dashed #2d2d44', borderRadius: '12px'
          }}>
            <span style={{ fontSize: '36px' }}>🔍</span>
            <p style={{ color: '#475569', marginTop: '8px', fontSize: '14px' }}>No repositories connected yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p, i) => (
              <div key={p._id} style={{
                background: '#0f0f1a',
                border: '1px solid #2d2d44',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '8px', width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0
                  }}>
                    {String.fromCodePoint(0x1F4E6)}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>{p.repoName}</p>
                    <a href={p.repoUrl} target="_blank" rel="noreferrer"
                      style={{ color: '#475569', fontSize: '12px' }}>{p.repoUrl}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#10b981', fontSize: '12px',
                    padding: '4px 10px', borderRadius: '20px'
                  }}>● Active</span>
                  <button onClick={() => removeProject(p._id)} style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171', padding: '6px 14px',
                    borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
                  }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}