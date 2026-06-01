import { useState, useEffect } from 'react';
import { getBlockchain } from '../../services/api';

export default function AdminBlockchain() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { getBlockchain().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container animate-fade">
      <div className="page-header"><h1>⛓️ Blockchain Explorer</h1><p>View the complete AgroChain blockchain</p></div>

      {data?.validity && (
        <div className={`verify-banner ${data.validity.valid ? 'verified' : 'unverified'}`} style={{ marginBottom: '20px' }}>
          <span className="verify-icon">{data.validity.valid ? '✅' : '❌'}</span>
          <div>
            <strong>Chain Integrity: {data.validity.valid ? 'VALID' : 'COMPROMISED'}</strong>
            <p>{data.validity.valid ? 'All blocks verified — no tampering detected' : data.validity.error}</p>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-value">{data?.stats?.totalBlocks || 0}</div><div className="stat-label">Total Blocks</div></div>
        <div className="stat-card"><div className="stat-value">{data?.stats?.totalTransactions || 0}</div><div className="stat-label">Total Transactions</div></div>
        <div className="stat-card"><div className="stat-value">{data?.stats?.difficulty || 0}</div><div className="stat-label">Difficulty</div></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data?.chain?.map((block, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-blue">Block #{block.index}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{block.transactionCount} txn(s)</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(block.timestamp).toLocaleString()}</span>
                </div>
                <code style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', wordBreak: 'break-all', marginTop: '4px', display: 'block', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>{block.hash}</code>
              </div>
              <span style={{ fontSize: '1.2rem' }}>{expanded === i ? '▼' : '▶'}</span>
            </div>

            {expanded === i && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <p><strong>Previous Hash:</strong> <code style={{ wordBreak: 'break-all' }}>{block.previousHash}</code></p>
                  <p><strong>Nonce:</strong> {block.nonce}</p>
                </div>
                <h4 style={{ marginBottom: '8px' }}>Transactions:</h4>
                {block.transactions.map((tx, j) => (
                  <div key={j} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span className="badge badge-amber">{tx.type}</span>
                      <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TX: {tx.hash?.substring(0, 24)}...</code>
                    </div>
                    <p><strong>From:</strong> {tx.sender?.substring(0, 20)}... → <strong>To:</strong> {tx.receiver?.substring(0, 20)}...</p>
                    {tx.data?.produceId && <p style={{ marginTop: '4px' }}>Produce: <code style={{ color: 'var(--primary)', background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem' }}>{tx.data.produceId}</code></p>}
                    {tx.data?.cropType && <p>Crop: {tx.data.cropType}</p>}
                    {tx.data?.purchasePrice && <p>Price: ₹{tx.data.purchasePrice} (Change: {tx.data.priceChangePercent}%)</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
