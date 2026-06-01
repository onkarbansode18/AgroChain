import { useState, useEffect } from 'react';
import { getRetailerInventory } from '../../services/api';

export default function RetailerInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => { getRetailerInventory().then(r => { setInventory(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container animate-fade">
      <div className="page-header"><h1>📦 Retail Inventory</h1><p>{inventory.length} products in store</p></div>
      {inventory.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">🏪</div><p>No inventory yet. Purchase from distributors first.</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {inventory.map(p => (
            <div key={p._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div><h3>{p.cropType}{p.variety && ` — ${p.variety}`}</h3><code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.produceId}</code></div>
                <span className="badge badge-green">{p.qualityGrade}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <p>📦 {p.quantity} {p.unit} • 👨‍🌾 {p.farmer?.name}</p>
                <p>📍 {p.farmLocation}</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Price Chain:</p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {p.priceHistory?.map((ph, i) => (
                    <span key={i} className={`badge ${ph.role === 'farmer' ? 'badge-green' : ph.role === 'distributor' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '0.7rem' }}>
                      {ph.role}: ₹{ph.price}
                    </span>
                  ))}
                </div>
              </div>
              {p.certifications?.length > 0 && (
                <div style={{ marginBottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {p.certifications.map(c => <span key={c} className="badge badge-amber" style={{ fontSize: '0.7rem' }}>✓ {c}</span>)}
                </div>
              )}
              <button className="btn btn-primary btn-full" onClick={() => setQrModal(p)}>📱 Show QR Code</button>
            </div>
          ))}
        </div>
      )}

      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h2>📱 QR Code for Consumer</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 16px' }}>{qrModal.cropType} — {qrModal.produceId}</p>
            {qrModal.qrCode ? (
              <div>
                <img src={qrModal.qrCode} alt="QR Code" style={{ width: '200px', borderRadius: '12px', marginBottom: '16px' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consumer scans this QR to view full product journey</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Trace URL: <code>/trace/{qrModal.produceId}</code></p>
              </div>
            ) : <p>QR code not available</p>}
            <button className="btn btn-secondary btn-full" style={{ marginTop: '16px' }} onClick={() => setQrModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
