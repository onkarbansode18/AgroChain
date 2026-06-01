import { useState, useEffect } from 'react';
import { getDistributorInventory, addTransport } from '../../services/api';

export default function DistributorInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState(null);
  const [msg, setMsg] = useState(null);
  const [tForm, setTForm] = useState({ vehicleType: 'Truck', vehicleNumber: '', origin: '', destination: '', temperature: '', humidity: '' });

  const load = () => { getDistributorInventory().then(r => { setInventory(r.data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const handleTransport = async () => {
    try {
      const { data } = await addTransport({ ...tForm, produceId: shipping.produceId, departureTime: new Date().toISOString() });
      setMsg({ type: 'success', text: `Transport recorded on Block #${data.blockchain.blockIndex}` });
      setShipping(null); load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
    }
  };

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container animate-fade">
      <div className="page-header"><h1>📦 My Inventory</h1><p>{inventory.length} items in stock</p></div>
      {msg && <div className={`toast toast-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}
      {inventory.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📦</div><p>Inventory is empty</p></div></div>
      ) : (
        <div className="table-container"><table>
          <thead><tr><th>ID</th><th>Crop</th><th>Farmer</th><th>Qty</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{inventory.map(p => (
            <tr key={p._id}>
              <td><code style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>{p.produceId}</code></td>
              <td><strong>{p.cropType}</strong></td>
              <td>{p.farmer?.name}</td>
              <td>{p.quantity} {p.unit}</td>
              <td>{p.farmLocation}</td>
              <td><span className={`badge ${p.status === 'in_transit' ? 'badge-amber' : 'badge-blue'}`}>{p.status.replace(/_/g, ' ')}</span></td>
              <td>{p.status !== 'in_transit' && <button className="btn btn-secondary btn-sm" onClick={() => setShipping(p)}>🚛 Ship</button>}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}

      {shipping && (
        <div className="modal-overlay" onClick={() => setShipping(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>🚛 Add Transport Details</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Shipping: {shipping.cropType} ({shipping.produceId})</p>
            <div className="form-row">
              <div className="form-group"><label>Vehicle Type</label><select className="form-select" value={tForm.vehicleType} onChange={e => setTForm({...tForm, vehicleType: e.target.value})}><option>Truck</option><option>Van</option><option>Refrigerated Truck</option><option>Mini Truck</option></select></div>
              <div className="form-group"><label>Vehicle Number</label><input className="form-input" placeholder="OD-01-AB-1234" value={tForm.vehicleNumber} onChange={e => setTForm({...tForm, vehicleNumber: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Origin</label><input className="form-input" placeholder="Warehouse location" value={tForm.origin} onChange={e => setTForm({...tForm, origin: e.target.value})} /></div>
              <div className="form-group"><label>Destination</label><input className="form-input" placeholder="Delivery location" value={tForm.destination} onChange={e => setTForm({...tForm, destination: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Temperature (°C)</label><input className="form-input" placeholder="4°C" value={tForm.temperature} onChange={e => setTForm({...tForm, temperature: e.target.value})} /></div>
              <div className="form-group"><label>Humidity (%)</label><input className="form-input" placeholder="65%" value={tForm.humidity} onChange={e => setTForm({...tForm, humidity: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleTransport}>⛓️ Record on Blockchain</button>
              <button className="btn btn-secondary" onClick={() => setShipping(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
