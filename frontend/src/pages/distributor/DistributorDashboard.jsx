import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDistributorStats, getDistributorInventory } from '../../services/api';

export default function DistributorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    getDistributorStats().then(r => setStats(r.data)).catch(() => {});
    getDistributorInventory().then(r => setInventory(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const statItems = [
    { icon: '📦', value: stats?.totalInventory || 0, label: 'Inventory Items' },
    { icon: '🚛', value: stats?.inTransit || 0, label: 'In Transit' },
    { icon: '🔄', value: stats?.totalTransactions || 0, label: 'Transactions' },
    { icon: '💰', value: `₹${stats?.totalSpent || 0}`, label: 'Total Spent' },
  ];

  return (
    <div className="page-container animate-fade">
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p>{user?.businessName || 'Distributor Dashboard'}</p>
      </div>

      <div className="stats-grid">
        {statItems.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <Link to="/distributor/market" className="btn btn-primary">🛒 Browse Market</Link>
        <Link to="/distributor/inventory" className="btn btn-secondary">📦 My Inventory</Link>
      </div>

      {/* Recent inventory */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>Recent Inventory</h2>
          <Link to="/distributor/inventory" style={{ fontSize: '0.85rem' }}>View all →</Link>
        </div>
        {inventory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No inventory yet. <Link to="/distributor/market">Browse the market →</Link></p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>ID</th><th>Crop</th><th>Farmer</th><th>Quantity</th><th>Status</th></tr>
              </thead>
              <tbody>
                {inventory.map(p => (
                  <tr key={p._id}>
                    <td><code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '3px 6px', borderRadius: '4px' }}>{p.produceId}</code></td>
                    <td><strong>{p.cropType}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.farmer?.name || 'N/A'}</td>
                    <td>{p.quantity} {p.unit}</td>
                    <td><span className={`badge ${p.status === 'in_transit' ? 'badge-amber' : 'badge-blue'}`}>{p.status.replace(/_/g, ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
