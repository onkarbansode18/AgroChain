import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { traceProduce } from '../../services/api';
import './TraceProduce.css';

const TYPE_LABELS = {
  PRODUCE_REGISTER: '🌾 Registered',
  OWNERSHIP_TRANSFER: '🤝 Ownership Transfer',
  TRANSPORT_UPDATE: '🚛 Transport Update',
  PRICE_UPDATE: '💰 Price Update',
  QUALITY_CHECK: '✅ Quality Check',
};

export default function TraceProduce() {
  const { id } = useParams();
  const [produceId, setProduceId] = useState(id || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (id) handleTrace(id); }, [id]);

  const handleTrace = async (pid) => {
    const searchId = pid || produceId;
    if (!searchId.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await traceProduce(searchId.trim());
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found. Please check the Produce ID.');
    }
    setLoading(false);
  };

  return (
    <div className="trace-page animate-fade">
      <div className="trace-header">
        <h1>Trace Product Journey</h1>
        <p>Enter a Produce ID to view its complete blockchain supply chain history</p>
      </div>

      {/* Search */}
      <div className="trace-search">
        <input
          className="form-input trace-input"
          placeholder="Enter Produce ID (e.g. PRD-A1B2C3D4)"
          value={produceId}
          onChange={e => setProduceId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrace()}
        />
        <button className="btn btn-primary" onClick={() => handleTrace()} disabled={loading}>
          {loading ? 'Searching…' : 'Trace →'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>Not Found</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && !loading && (
        <div className="trace-empty">
          <div className="trace-empty-icon">📦</div>
          <h3>Enter a Produce ID to get started</h3>
          <p>You'll see the full farm-to-fork journey on the blockchain</p>
        </div>
      )}

      {result && (
        <div className="trace-result">

          {/* Verification banner */}
          <div className={`verify-banner ${result.verified ? 'verified' : 'unverified'}`}>
            <span className="verify-icon">{result.verified ? '✅' : '⚠️'}</span>
            <div>
              <strong>{result.verified ? 'Blockchain Verified' : 'Verification Warning'}</strong>
              <p>{result.verified ? 'This product journey is verified on an immutable blockchain.' : 'Chain integrity could not be fully verified.'}</p>
            </div>
          </div>

          {/* Product & Farmer */}
          <div className="trace-grid">
            <div className="card">
              <p className="section-head">📦 Product Information</p>
              <div className="info-grid">
                <div className="info-item"><span className="info-label">Produce ID</span><span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{result.produce.produceId}</span></div>
                <div className="info-item"><span className="info-label">Crop</span><span className="info-value">{result.produce.cropType}{result.produce.variety && ` (${result.produce.variety})`}</span></div>
                <div className="info-item"><span className="info-label">Quantity</span><span className="info-value">{result.produce.quantity} {result.produce.unit}</span></div>
                <div className="info-item"><span className="info-label">Grade</span><span className="info-value"><span className="badge badge-green">{result.produce.qualityGrade}</span></span></div>
                <div className="info-item"><span className="info-label">Harvest Date</span><span className="info-value">{new Date(result.produce.harvestDate).toLocaleDateString()}</span></div>
                <div className="info-item"><span className="info-label">Farm Location</span><span className="info-value">{result.produce.farmLocation}</span></div>
                <div className="info-item"><span className="info-label">Status</span><span className="info-value"><span className="badge badge-blue">{result.produce.status?.replace(/_/g, ' ')}</span></span></div>
              </div>
              {result.produce.certifications?.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <span className="info-label">Certifications</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {result.produce.certifications.map(c => <span key={c} className="badge badge-amber">✓ {c}</span>)}
                  </div>
                </div>
              )}
              {result.produce.description && <p style={{ marginTop: '14px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{result.produce.description}</p>}
            </div>

            <div className="card">
              <p className="section-head">👨‍🌾 Farmer Details</p>
              <div style={{ display: 'flex', flex: 'column', gap: '14px' }}>
                {[
                  { label: 'Farmer', value: result.farmer?.name },
                  { label: 'Farm', value: result.farmer?.farmName },
                  { label: 'Location', value: result.farmer?.farmLocation },
                ].map(r => (
                  <div key={r.label} className="info-item" style={{ marginBottom: '12px' }}>
                    <span className="info-label">{r.label}</span>
                    <span className="info-value">{r.value || '—'}</span>
                  </div>
                ))}
              </div>
              {result.qrCode && (
                <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <img src={result.qrCode} alt="QR Code" style={{ width: '120px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Scan to verify</p>
                </div>
              )}
            </div>
          </div>

          {/* Price transparency */}
          <div className="card">
            <p className="section-head">💰 Price Transparency</p>
            <div className="price-chain">
              {result.priceChain?.map((p, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  <div className="price-node">
                    <span className="role">{p.role}</span>
                    <span className="price">₹{p.price}</span>
                    <span className="role">per {result.produce.unit}</span>
                  </div>
                  {i < result.priceChain.length - 1 && <span className="price-arrow">→</span>}
                </span>
              ))}
            </div>
            {result.priceAnalysis && (
              <div style={{ marginTop: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                {[
                  { label: 'Farmer Price', value: `₹${result.priceAnalysis.farmerPrice}`, color: 'var(--success)' },
                  { label: 'Current Price', value: `₹${result.priceAnalysis.currentPrice}`, color: 'var(--primary)' },
                  { label: 'Total Markup', value: `${result.priceAnalysis.totalMarkup}%`, color: result.priceAnalysis.totalMarkup > 100 ? 'var(--danger)' : 'var(--accent)' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blockchain timeline */}
          <div className="card">
            <p className="section-head">⛓️ Blockchain Timeline — {result.blockchain?.totalSteps || 0} records</p>
            <div className="timeline">
              {result.blockchain?.timeline?.map((entry, i) => (
                <div key={i} className="timeline-item">
                  <div className="tl-time">{new Date(entry.timestamp).toLocaleString()}</div>
                  <div className="tl-title">{TYPE_LABELS[entry.type] || entry.type}</div>
                  <div className="tl-desc">
                    {entry.type === 'PRODUCE_REGISTER' && `${entry.data.farmerName} registered ${entry.data.quantity} ${entry.data.unit} of ${entry.data.cropType} at ₹${entry.data.price}/${entry.data.unit}`}
                    {entry.type === 'OWNERSHIP_TRANSFER' && `${entry.data.senderName} (${entry.data.senderRole}) → ${entry.data.receiverName} (${entry.data.receiverRole}) at ₹${entry.data.purchasePrice}/${entry.data.unit} (${entry.data.priceChangePercent}% change)`}
                    {entry.type === 'TRANSPORT_UPDATE' && `${entry.data.transporterName} — ${entry.data.vehicleType} (${entry.data.vehicleNumber}) from ${entry.data.origin} to ${entry.data.destination}`}
                  </div>
                  <div className="tl-hash">Block #{entry.blockIndex} • {entry.blockHash}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
