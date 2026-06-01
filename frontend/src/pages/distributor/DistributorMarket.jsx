import { useState, useEffect } from 'react';
import { getAvailableProduce, purchaseFromFarmer } from '../../services/api';

export default function DistributorMarket() {
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState(null);

  const load = () => { getAvailableProduce().then(r => { setProduce(r.data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const handlePurchase = async () => {
    if (!price) return;
    try {
      const { data } = await purchaseFromFarmer({ produceId: buying.produceId, purchasePrice: Number(price) });
      setMsg({ type: 'success', text: `Purchased! Block #${data.blockchain.blockIndex} — Hash: ${data.blockchain.blockHash.substring(0, 20)}...` });
      setBuying(null); setPrice(''); load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Purchase failed' });
    }
  };

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container animate-fade">
      <div className="page-header"><h1>🛒 Farmer Market</h1><p>Purchase produce directly from farmers</p></div>
      {msg && <div className={`toast toast-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}
      {produce.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">🌿</div><p>No produce available right now</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {produce.map(p => (
            <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div><h3>{p.cropType}{p.variety && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}> — {p.variety}</span>}</h3>
                  <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.produceId}</code></div>
                <span className="badge badge-green">{p.qualityGrade}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>📦 {p.quantity} {p.unit}</span>
                <span>💰 ₹{p.price}/{p.unit}</span>
                <span>📍 {p.farmLocation}</span>
                <span>👨‍🌾 {p.farmer?.name}</span>
              </div>
              {p.certifications?.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{p.certifications.map(c => <span key={c} className="badge badge-green" style={{ fontSize: '0.7rem' }}>{c}</span>)}</div>
              )}
              <button className="btn btn-primary btn-full" onClick={() => { setBuying(p); setPrice(String(Math.round(p.price * 1.15))); }}>Purchase from Farmer</button>
            </div>
          ))}
        </div>
      )}

      {buying && (
        <div className="modal-overlay" onClick={() => setBuying(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>🤝 Purchase {buying.cropType}</h2>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
              <p><strong>From:</strong> {buying.farmer?.name}</p>
              <p><strong>Farmer Price:</strong> ₹{buying.price}/{buying.unit}</p>
              <p><strong>Quantity:</strong> {buying.quantity} {buying.unit}</p>
            </div>
            <div className="form-group">
              <label>Your Purchase Price (₹/{buying.unit})</label>
              <input className="form-input" type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Total: ₹{(Number(price) * buying.quantity).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePurchase}>⛓️ Confirm on Blockchain</button>
              <button className="btn btn-secondary" onClick={() => setBuying(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
