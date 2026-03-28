import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const cardStyle = {
  background: '#1a1a2e',
  border: '1px solid #2d2d44',
  borderRadius: '16px',
  padding: '24px'
};

const severityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: '🔴 Critical' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', label: '🟠 High' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: '🟡 Medium' },
  low:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', label: '🔵 Low' }
};

const riskConfig = {
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  emoji: '✅' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',  emoji: '⚠️' },
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',   emoji: '❌' }
};

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/reports/${id}`).then(r => setReport(r.data));
  }, [id]);

  if (!report) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>
        <span style={{ fontSize: '48px' }}>⏳</span>
        <p style={{ marginTop: '12px' }}>Loading report...</p>
      </div>
    </Layout>
  );

  const risk = riskConfig[report.riskLevel] || riskConfig.Low;
  const badge = `[![InternShield](https://img.shields.io/badge/InternShield-${report.riskLevel}%20Risk-${report.riskLevel === 'Low' ? 'green' : report.riskLevel === 'Medium' ? 'yellow' : 'red'})](${window.location.href})`;

  const severities = ['all', 'critical', 'high', 'medium', 'low'];
  const filtered = filter === 'all'
    ? report.findings
    : report.findings.filter(f => f.severity === filter);

  const counts = {
    critical: report.findings.filter(f => f.severity === 'critical').length,
    high:     report.findings.filter(f => f.severity === 'high').length,
    medium:   report.findings.filter(f => f.severity === 'medium').length,
    low:      report.findings.filter(f => f.severity === 'low').length,
  };

  const copyBadge = () => {
    navigator.clipboard.writeText(badge);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      {/* Back */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" style={{
          background: '#1a1a2e', border: '1px solid #2d2d44',
          color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '13px'
        }}>← Back</Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Scan Report</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Hero Risk Card */}
      <div style={{
        ...cardStyle,
        background: `linear-gradient(135deg, #1a1a2e, ${risk.bg})`,
        border: `1px solid ${risk.border}`,
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: '36px' }}>{risk.emoji}</span>
              <div>
                <p style={{ color: risk.color, fontSize: '28px', fontWeight: '800' }}>
                  {report.riskLevel} Risk
                </p>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Score: <span style={{ color: risk.color, fontWeight: '700' }}>{report.riskScore} pts</span>
                </p>
              </div>
              <span style={{
                background: report.status === 'blocked' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                border: `1px solid ${report.status === 'blocked' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
                color: report.status === 'blocked' ? '#ef4444' : '#10b981',
                padding: '6px 16px', borderRadius: '20px',
                fontSize: '13px', fontWeight: '600', marginLeft: '8px'
              }}>
                {report.status === 'blocked' ? '❌ BLOCKED' : '✅ ALLOWED'}
              </span>
            </div>

            {/* Meta info */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
              {[
                { label: 'Branch', value: report.branch, icon: '🌿' },
                { label: 'Commit', value: report.commitSha?.slice(0, 8), icon: '📌' },
                { label: 'Files Scanned', value: report.filesScanned, icon: '📁' },
                { label: 'Total Findings', value: report.findings.length, icon: '🔍' }
              ].map(m => (
                <div key={m.label}>
                  <p style={{ color: '#475569', fontSize: '11px' }}>{m.icon} {m.label}</p>
                  <p style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* GPT Summary */}
            {report.gptSummary && (
              <div style={{
                background: 'rgba(102,126,234,0.08)',
                border: '1px solid rgba(102,126,234,0.2)',
                borderRadius: '10px', padding: '14px'
              }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>🤖 AI Summary</p>
                <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>{report.gptSummary}</p>
              </div>
            )}
          </div>

          {/* Score Circle */}
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: risk.bg, border: `3px solid ${risk.color}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            marginLeft: '24px', flexShrink: 0
          }}>
            <p style={{ color: risk.color, fontSize: '28px', fontWeight: '800' }}>{report.riskScore}</p>
            <p style={{ color: '#64748b', fontSize: '10px' }}>SCORE</p>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(counts).map(([sev, count]) => {
          const cfg = severityConfig[sev];
          return (
            <div key={sev} style={{
              ...cardStyle, padding: '16px', cursor: 'pointer',
              border: filter === sev ? `1px solid ${cfg.color}` : '1px solid #2d2d44',
              opacity: count === 0 ? 0.4 : 1
            }} onClick={() => setFilter(filter === sev ? 'all' : sev)}>
              <p style={{ color: cfg.color, fontSize: '22px', fontWeight: '700' }}>{count}</p>
              <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>{sev}</p>
            </div>
          );
        })}
      </div>

      {/* Findings */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: 'white', fontWeight: '600' }}>
            Findings ({filtered.length}{filter !== 'all' ? ` ${filter}` : ''})
          </h2>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {severities.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                background: filter === s ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#0f0f1a',
                color: filter === s ? 'white' : '#64748b',
                border: '1px solid #2d2d44',
                padding: '4px 12px', borderRadius: '20px',
                fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize'
              }}>{s}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px',
            border: '1px dashed #2d2d44', borderRadius: '12px'
          }}>
            <span style={{ fontSize: '36px' }}>✅</span>
            <p style={{ color: '#475569', marginTop: '8px' }}>
              {filter === 'all' ? 'No issues found — clean deployment!' : `No ${filter} severity issues`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f, i) => {
              const sev = severityConfig[f.severity] || severityConfig.low;
              return (
                <div key={i} style={{
                  background: '#0f0f1a',
                  border: `1px solid ${sev.border}`,
                  borderRadius: '12px', padding: '16px'
                }}>
                  {/* Finding Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: sev.bg, border: `1px solid ${sev.border}`,
                        color: sev.color, padding: '3px 10px',
                        borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                      }}>{sev.label}</span>
                      <span style={{
                        background: '#1a1a2e', color: '#94a3b8',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px'
                      }}>{f.type?.replace(/_/g, ' ')}</span>
                    </div>
                    <code style={{
                      background: '#1a1a2e', color: '#667eea',
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px'
                    }}>
                      {f.file}{f.line ? `:${f.line}` : ''}
                    </code>
                  </div>

                  {/* Message */}
                  <p style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500', marginBottom: '10px' }}>
                    {f.message}
                  </p>

                  {/* GPT Explanation */}
                  {f.gptExplanation && (
                    <div style={{
                      background: 'rgba(102,126,234,0.06)',
                      border: '1px solid rgba(102,126,234,0.15)',
                      borderRadius: '8px', padding: '12px', marginBottom: '8px'
                    }}>
                      <p style={{ color: '#667eea', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                        🤖 AI Explanation
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{f.gptExplanation}</p>
                    </div>
                  )}

                  {/* Fix Suggestion */}
                  {f.gptFix && (
                    <div style={{
                      background: 'rgba(16,185,129,0.06)',
                      border: '1px solid rgba(16,185,129,0.15)',
                      borderRadius: '8px', padding: '12px'
                    }}>
                      <p style={{ color: '#10b981', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                        💡 Suggested Fix
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{f.gptFix}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badge Generator */}
      <div style={cardStyle}>
        <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '12px' }}>
          🏷️ README Badge
        </h3>
        <div style={{
          background: '#0f0f1a', border: '1px solid #2d2d44',
          borderRadius: '10px', padding: '14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
        }}>
          <code style={{ color: '#667eea', fontSize: '12px', wordBreak: 'break-all', flex: 1 }}>
            {badge}
          </code>
          <button onClick={copyBadge} style={{
            background: copied ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: copied ? '#10b981' : 'white',
            border: 'none', padding: '8px 16px',
            borderRadius: '8px', fontSize: '13px',
            cursor: 'pointer', flexShrink: 0, fontWeight: '500'
          }}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
