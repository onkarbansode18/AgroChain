import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addProduce } from '../../services/api';

export default function AddProduce() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    cropType: '', variety: '', quantity: '', unit: 'kg',
    qualityGrade: 'A', harvestDate: new Date().toISOString().split('T')[0],
    farmLocation: user?.farmLocation || '', price: '', description: '', certifications: []
  });

  const u = (k, v) => setForm({ ...form, [k]: v });

  const certOptions = ['Organic', 'Pesticide-Free', 'Chemical-Free', 'Non-GMO', 'Fair Trade'];
  const toggleCert = (c) => {
    setForm(f => ({
      ...f,
      certifications: f.certifications.includes(c) ? f.certifications.filter(x => x !== c) : [...f.certifications, c]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await addProduce({ ...form, quantity: Number(form.quantity), price: Number(form.price) });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register produce');
    }
    setLoading(false);
  };

  if (result) {
    return (
      <div className="page-container animate-fade">
        <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
          <h2>Produce Registered on Blockchain!</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Your produce has been permanently recorded on the AgroChain blockchain.</p>
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'left', marginBottom: '20px' }}>
            <p><strong>Produce ID:</strong> <code style={{ color: 'var(--primary)' }}>{result.produce.produceId}</code></p>
            <p><strong>Block Hash:</strong> <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{result.blockchain.blockHash}</code></p>
            <p><strong>Transaction Hash:</strong> <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{result.blockchain.transactionHash}</code></p>
            <p><strong>Block Index:</strong> #{result.blockchain.blockIndex}</p>
          </div>
          {result.produce.qrCode && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '8px', fontWeight: '600' }}>QR Code</p>
              <img src={result.produce.qrCode} alt="QR Code" style={{ width: '150px', borderRadius: '8px' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setResult(null); setForm({ cropType: '', variety: '', quantity: '', unit: 'kg', qualityGrade: 'A', harvestDate: new Date().toISOString().split('T')[0], farmLocation: user?.farmLocation || '', price: '', description: '', certifications: [] }); }}>Add Another</button>
            <button className="btn btn-secondary" onClick={() => navigate('/farmer/produce')}>View All Produce</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade">
      <div className="page-header"><h1>🌿 Register New Produce</h1><p>Add your agricultural produce to the blockchain</p></div>
      <div className="card" style={{ maxWidth: '700px' }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Crop Type *</label><input className="form-input" required placeholder="e.g. Tomato, Rice, Wheat" value={form.cropType} onChange={e => u('cropType', e.target.value)} /></div>
            <div className="form-group"><label>Variety</label><input className="form-input" placeholder="e.g. Cherry, Basmati" value={form.variety} onChange={e => u('variety', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Quantity *</label><input className="form-input" type="number" required min="1" placeholder="500" value={form.quantity} onChange={e => u('quantity', e.target.value)} /></div>
            <div className="form-group"><label>Unit</label><select className="form-select" value={form.unit} onChange={e => u('unit', e.target.value)}><option value="kg">Kilograms (kg)</option><option value="quintal">Quintal</option><option value="ton">Ton</option><option value="pieces">Pieces</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Quality Grade *</label><select className="form-select" value={form.qualityGrade} onChange={e => u('qualityGrade', e.target.value)}><option value="A+">A+ (Premium)</option><option value="A">A (Excellent)</option><option value="B">B (Good)</option><option value="C">C (Average)</option></select></div>
            <div className="form-group"><label>Price per {form.unit} (₹) *</label><input className="form-input" type="number" required min="1" placeholder="20" value={form.price} onChange={e => u('price', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Harvest Date *</label><input className="form-input" type="date" required value={form.harvestDate} onChange={e => u('harvestDate', e.target.value)} /></div>
            <div className="form-group"><label>Farm Location *</label><input className="form-input" required placeholder="City, State" value={form.farmLocation} onChange={e => u('farmLocation', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-textarea" placeholder="Describe your produce..." value={form.description} onChange={e => u('description', e.target.value)} /></div>
          <div className="form-group">
            <label>Certifications</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {certOptions.map(c => (
                <button type="button" key={c} onClick={() => toggleCert(c)} className={`btn btn-sm ${form.certifications.includes(c) ? 'btn-primary' : 'btn-secondary'}`}>{form.certifications.includes(c) ? '✓ ' : ''}{c}</button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>{loading ? '⛏️ Mining Block...' : '🔗 Register on Blockchain'}</button>
        </form>
      </div>
    </div>
  );
}
