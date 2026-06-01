import { useState, useEffect } from 'react';
import { getRetailerAvailable, purchaseFromDistributor } from '../../services/api';

export default function RetailerMarket() {
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState(null);

  const load = () => { getRetailerAvailable().then(r => { setProduce(r.data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const handlePurchase = async () => {
    if (!price) return;
    try {
      const { data } = await purchaseFromDistributor({ produceId: buying.produceId, retailPrice: Number(price) });
      setMsg({ type: 'success', text: `Purchased! Block #${data.blockchain.blockIndex}` });
      setBuying(null); setPrice(''); load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Purchase failed' });
    }
  };

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container animate-fade">
      <div className="page-header"><h1>🛒 Distributor Market</h1><p>Purchase produce from distributors</p></div>
      {msg && <div className={`toast toast-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}
      {produce.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📦</div><p>No produce available from distributors</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {produce.map(p => (
            <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><h3>{p.cropType}</h3><code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.produceId}</code></div>
                <span className="badge badge-green">{p.qualityGrade}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <span>📦 {p.quantity} {p.unit}</span>
                <span>💰 ₹{p.priceHistory?.[p.priceHistory.length-1]?.price || p.price}/{p.unit}</span>
                <span>👨‍🌾 {p.farmer?.name}</span>
                <span>🏭 {p.currentOwner?.name}</span>
              </div>
              <div className="price-chain" style={{ fontSize: '0.8rem' }}>
                {p.priceHistory?.map((ph, i) => (
                  <span key={i}><span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{ph.role}: ₹{ph.price}</span>{i < p.priceHistory.length - 1 && <span style={{ margin: '0 2px', color: 'var(--text-muted)' }}>→</span>}</span>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { setBuying(p); setPrice(String(Math.round((p.priceHistory?.[p.priceHistory.length-1]?.price || p.price) * 1.25))); }}>Purchase for Retail</button>
            </div>
          ))}
        </div>
      )}

      {buying && (
        <div className="modal-overlay" onClick={() => setBuying(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>🏪 Set Retail Price</h2>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
              <p><strong>Product:</strong> {buying.cropType} ({buying.produceId})</p>
              <p><strong>Current Price:</strong> ₹{buying.priceHistory?.[buying.priceHistory.length-1]?.price || buying.price}/{buying.unit}</p>
            </div>
            <div className="form-group">
              <label>Retail Price (₹/{buying.unit})</label>
              <input className="form-input" type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePurchase}>⛓️ Confirm Purchase</button>
              <button className="btn btn-secondary" onClick={() => setBuying(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
