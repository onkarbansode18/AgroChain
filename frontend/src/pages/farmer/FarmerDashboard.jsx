import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFarmerStats, getFarmerProduce } from '../../services/api';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getFarmerStats().then(r => setStats(r.data)).catch(() => {});
    getFarmerProduce().then(r => setRecent(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const statItems = [
    { icon: '📦', value: stats?.totalProduce || 0, label: 'Total Produce' },
    { icon: '✅', value: stats?.activeProduce || 0, label: 'Active Listings' },
    { icon: '🤝', value: stats?.soldProduce || 0, label: 'Sold' },
    { icon: '💰', value: `₹${stats?.totalRevenue || 0}`, label: 'Total Revenue' },
  ];

  return (
    <div className="page-container animate-fade">
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p>
          {user?.farmName && <><strong>{user.farmName}</strong> · </>}
          {user?.farmLocation || 'Your farm dashboard'}
        </p>
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
        <Link to="/farmer/add" className="btn btn-primary">+ Add Produce</Link>
        <Link to="/farmer/produce" className="btn btn-secondary">View All Produce</Link>
      </div>

      {/* Recent produce */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>Recent Produce</h2>
          <Link to="/farmer/produce" style={{ fontSize: '0.85rem' }}>View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌿</div>
            <p>No produce registered yet. <Link to="/farmer/add">Add your first crop →</Link></p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>ID</th><th>Crop</th><th>Quantity</th><th>Grade</th><th>Price</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map(p => (
                  <tr key={p._id}>
                    <td><code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '3px 6px', borderRadius: '4px' }}>{p.produceId}</code></td>
                    <td><strong>{p.cropType}</strong>{p.variety && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> ({p.variety})</span>}</td>
                    <td>{p.quantity} {p.unit}</td>
                    <td><span className="badge badge-green">{p.qualityGrade}</span></td>
                    <td style={{ fontWeight: '600' }}>₹{p.price}/{p.unit}</td>
                    <td><span className={`badge ${p.status === 'registered' ? 'badge-blue' : p.status === 'with_distributor' ? 'badge-amber' : 'badge-green'}`}>{p.status.replace(/_/g, ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blockchain address */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-secondary)' }}>Your Blockchain Address</h3>
        <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: 'var(--primary-dark)', wordBreak: 'break-all', display: 'block', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          {user?.blockchainAddress}
        </code>
      </div>
    </div>
  );
}
