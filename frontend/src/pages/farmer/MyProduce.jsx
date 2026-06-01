import { useState, useEffect } from 'react';
import { getFarmerProduce } from '../../services/api';

export default function MyProduce() {
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { getFarmerProduce().then(r => { setProduce(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container animate-fade">
      <div className="page-header"><h1>📦 My Produce</h1><p>{produce.length} produce items registered</p></div>
      {produce.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">🌿</div><p>No produce registered yet</p></div></div>
      ) : (
        <div className="table-container"><table>
          <thead><tr><th>Produce ID</th><th>Crop</th><th>Quantity</th><th>Grade</th><th>Price</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
          <tbody>{produce.map(p => (
            <tr key={p._id}>
              <td><code style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>{p.produceId}</code></td>
              <td><strong>{p.cropType}</strong>{p.variety && <span style={{ color: 'var(--text-muted)' }}> ({p.variety})</span>}</td>
              <td>{p.quantity} {p.unit}</td>
              <td><span className="badge badge-green">{p.qualityGrade}</span></td>
              <td>₹{p.price}/{p.unit}</td>
              <td><span className={`badge ${p.status === 'registered' ? 'badge-blue' : p.status === 'with_retailer' ? 'badge-purple' : 'badge-amber'}`}>{p.status.replace(/_/g, ' ')}</span></td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td><button className="btn btn-secondary btn-sm" onClick={() => setSelected(selected?._id === p._id ? null : p)}>Details</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>📦 {selected.cropType} Details</h2>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
              <p><strong>ID:</strong> <code style={{ color: 'var(--primary)' }}>{selected.produceId}</code></p>
              <p><strong>Variety:</strong> {selected.variety || 'N/A'}</p>
              <p><strong>Quantity:</strong> {selected.quantity} {selected.unit}</p>
              <p><strong>Quality:</strong> {selected.qualityGrade}</p>
              <p><strong>Harvest:</strong> {new Date(selected.harvestDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {selected.farmLocation}</p>
              <p><strong>Certifications:</strong> {selected.certifications?.join(', ') || 'None'}</p>
              <p><strong>Description:</strong> {selected.description || 'N/A'}</p>
              {selected.priceHistory && <div>
                <strong>Price History:</strong>
                {selected.priceHistory.map((ph, i) => <div key={i} style={{ padding: '4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{ph.price}/{selected.unit} — {ph.role} ({new Date(ph.timestamp).toLocaleDateString()})</div>)}
              </div>}
              {selected.qrCode && <div style={{ textAlign: 'center', marginTop: '12px' }}><img src={selected.qrCode} alt="QR" style={{ width: '120px' }} /></div>}
            </div>
            <button className="btn btn-secondary btn-full" style={{ marginTop: '16px' }} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
