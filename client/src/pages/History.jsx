import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a1a2e', border: '1px solid #2d2d44',
        borderRadius: '10px', padding: '12px'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</p>
        <p style={{ color: '#667eea', fontWeight: '600' }}>Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function History() {
  const { projectId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reports/project/${projectId}`)
      .then(r => { setReports(r.data); setLoading(false); });
  }, [projectId]);

  const chartData = [...reports].reverse().map(r => ({
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: r.riskScore
  }));

  const blocked = reports.filter(r => r.status === 'blocked').length;
  const avgScore = reports.length
    ? Math.round(reports.reduce((a, r) => a + r.riskScore, 0) / reports.length)
    : 0;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" style={{
          background: '#1a1a2e', border: '1px solid #2d2d44',
          color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '13px'
        }}>← Back</Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Scan History</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>{reports.length} scans recorded</p>
        </div>
      </div>

      {/* Mini Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Scans', value: reports.length, icon: '🔍', color: '#667eea' },
            { label: 'Blocked', value: blocked, icon: '🚫', color: '#ef4444' },
            { label: 'Avg Score', value: avgScore, icon: '📊', color: '#f59e0b' }
          ].map(s => (
            <div key={s.label} style={cardStyle}>
              <div className="flex justify-between items-center">
                <div>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</p>
                  <p style={{ color: s.color, fontSize: '26px', fontWeight: '700' }}>{s.value}</p>
                </div>
                <span style={{ fontSize: '26px' }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '20px' }}>
            📈 Risk Score Over Time
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="score" stroke="#667eea"
                strokeWidth={2.5} dot={{ fill: '#667eea', r: 4 }}
                activeDot={{ r: 6, fill: '#764ba2' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          ⏳ Loading history...
        </div>
      ) : reports.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
          <span style={{ fontSize: '48px' }}>📭</span>
          <p style={{ color: '#475569', marginTop: '12px' }}>No scans yet for this repository</p>
        </div>
      ) : (
        <div style={cardStyle}>
          <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '16px' }}>All Scans</h2>
          <div className="space-y-3">
            {reports.map(r => {
              const risk = riskConfig[r.riskLevel] || riskConfig.Low;
              return (
                <div key={r._id} style={{
                  background: '#0f0f1a',
                  border: `1px solid ${risk.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div className="flex items-center gap-4">
                    <div style={{
                      background: risk.bg, border: `1px solid ${risk.border}`,
                      borderRadius: '10px', padding: '10px', fontSize: '20px'
                    }}>{risk.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>
                          {r.branch}
                        </p>
                        <code style={{
                          background: '#1a1a2e', color: '#667eea',
                          padding: '2px 8px', borderRadius: '6px', fontSize: '12px'
                        }}>{r.commitSha?.slice(0, 8)}</code>
                        <span style={{
                          background: r.status === 'blocked' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          color: r.status === 'blocked' ? '#ef4444' : '#10b981',
                          border: `1px solid ${r.status === 'blocked' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500'
                        }}>
                          {r.status === 'blocked' ? '❌ BLOCKED' : '✅ ALLOWED'}
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
                        {new Date(r.createdAt).toLocaleString()} · {r.findings.length} findings · {r.filesScanned} files
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: risk.color, fontSize: '22px', fontWeight: '700' }}>{r.riskScore}</p>
                      <p style={{ color: '#475569', fontSize: '11px' }}>{r.riskLevel} Risk</p>
                    </div>
                    <Link to={`/reports/${r._id}`} style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white', padding: '8px 16px',
                      borderRadius: '8px', fontSize: '13px', fontWeight: '500'
                    }}>View →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}