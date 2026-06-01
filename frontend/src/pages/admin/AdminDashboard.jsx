import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner" /></div></div>;

  const userStats = [
    { icon: '👥', value: stats?.users?.total || 0, label: 'Total Users' },
    { icon: '🌾', value: stats?.users?.farmers || 0, label: 'Farmers' },
    { icon: '🏭', value: stats?.users?.distributors || 0, label: 'Distributors' },
    { icon: '🏪', value: stats?.users?.retailers || 0, label: 'Retailers' },
  ];

  const platformStats = [
    { icon: '📦', value: stats?.produce?.total || 0, label: 'Total Produce' },
    { icon: '🔄', value: stats?.transactions?.total || 0, label: 'Transactions' },
    { icon: '⛓️', value: stats?.blockchain?.totalBlocks || 0, label: 'Blocks Mined' },
    { icon: stats?.blockchain?.chainValid ? '✅' : '❌', value: stats?.blockchain?.chainValid ? 'Valid' : 'Invalid', label: 'Chain Integrity' },
  ];

  return (
    <div className="page-container animate-fade">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>AgroChain platform overview and blockchain statistics</p>
      </div>

      <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>Users</p>
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {userStats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>Platform</p>
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {platformStats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {stats?.blockchain && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>⛓️ Blockchain Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {[
              { label: 'Total Transactions', value: stats.blockchain.totalTransactions },
              { label: 'Mining Difficulty', value: stats.blockchain.difficulty },
            ].map(r => (
              <div key={r.label}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{r.label}</div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Latest Block Hash</div>
            <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem', color: 'var(--primary-dark)', wordBreak: 'break-all', background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'block' }}>
              {stats.blockchain.latestBlockHash}
            </code>
          </div>
          {stats.blockchain.transactionTypes && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Transaction Types</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(stats.blockchain.transactionTypes).map(([type, count]) => (
                  <span key={type} className="badge badge-blue">{type}: {count}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
