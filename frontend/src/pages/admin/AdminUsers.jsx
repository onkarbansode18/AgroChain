import { useState, useEffect } from 'react';
import { getAdminUsers, verifyUser } from '../../services/api';

const ROLE_BADGE = {
  farmer: 'badge-green',
  distributor: 'badge-blue',
  retailer: 'badge-purple',
  consumer: 'badge-amber',
  admin: 'badge-red',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const load = () => {
    getAdminUsers()
      .then(r => { setUsers(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleVerify = async (userId) => {
    try { await verifyUser(userId); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to verify'); }
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-container animate-fade">
      <div className="page-header">
        <h1>User Management</h1>
        <p>{users.length} registered users across all roles</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '280px', height: '40px' }}
        />
        <select
          className="form-select"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ maxWidth: '160px', height: '40px' }}
        >
          <option value="all">All Roles</option>
          <option value="farmer">Farmers</option>
          <option value="distributor">Distributors</option>
          <option value="retailer">Retailers</option>
          <option value="consumer">Consumers</option>
          <option value="admin">Admins</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontWeight: '500' }}>
          {filtered.length} results
        </span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Email Verified</th>
              <th>Blockchain Address</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{u.name}</div>
                      {u.farmName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.farmName}</div>}
                      {u.businessName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.businessName}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                <td>{u.isEmailVerified ? <span className="badge badge-green">✓ Verified</span> : <span className="badge badge-amber">Pending</span>}</td>
                <td>
                  <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '3px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {u.blockchainAddress?.substring(0, 16)}…
                  </code>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {!u.isVerified && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleVerify(u._id)}>Verify</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
