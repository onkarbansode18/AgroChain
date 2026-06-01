import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">

      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content animate-fade">
          <div className="hero-badge">🔗 Blockchain-Powered Supply Chain</div>
          <h1>
            Farm to Fork —<br />
            <span className="gradient-text">Full Transparency</span>
          </h1>
          <p>
            Track agricultural produce from harvest to your table. Verify origin, quality,
            and fair pricing with immutable blockchain records.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started →</Link>
            <Link to="/trace" className="btn btn-secondary btn-lg">🔍 Trace a Product</Link>
          </div>
          <div className="hero-stats">
            <div className="hs"><span className="hs-val">100%</span><span className="hs-lbl">Transparent</span></div>
            <div className="hs"><span className="hs-val">Immutable</span><span className="hs-lbl">Records</span></div>
            <div className="hs"><span className="hs-val">Real-time</span><span className="hs-lbl">Tracking</span></div>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="landing-section">
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="section-eyebrow">How It Works</span>
          </div>
          <h2 className="section-title">From Field to Consumer</h2>
          <p className="section-subtitle">Every step of the journey is recorded on the blockchain — permanent, verifiable, and transparent.</p>
          <div className="flow-steps">
            {[
              { icon: '🌾', title: 'Farmer Registers', desc: 'Farmer uploads crop details, quality grade, and price' },
              { icon: '🏭', title: 'Distributor Buys', desc: 'Purchase recorded with transparent pricing on-chain' },
              { icon: '🚛', title: 'Transport Logged', desc: 'Vehicle, route, and delivery tracked in real-time' },
              { icon: '🏪', title: 'Retailer Sells', desc: 'Final price set with full markup visibility' },
              { icon: '📱', title: 'Consumer Verifies', desc: 'Scan QR to see the complete journey and pricing' },
            ].map((s, i) => (
              <div key={i} className="flow-step" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="step-num">{i + 1}</div>
                <span className="step-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="landing-section">
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="section-eyebrow">Why AgroChain</span>
          </div>
          <h2 className="section-title">Built on Trust & Technology</h2>
          <p className="section-subtitle">Blockchain ensures no one can alter the record — giving every stakeholder confidence in the data.</p>
          <div className="grid-3">
            {[
              { icon: '🔒', title: 'Tamper-Proof Records', desc: 'Once data is recorded on the blockchain it cannot be altered or deleted by anyone.' },
              { icon: '👁️', title: 'Full Transparency', desc: 'Every stakeholder can verify the complete transaction history at any time.' },
              { icon: '⚖️', title: 'Fair Pricing', desc: 'Price markup at each stage is visible to everyone — eliminating hidden margins.' },
              { icon: '🛡️', title: 'Anti-Fraud', desc: 'Prevents fake organic certificates, duplicate entries, and counterfeit produce.' },
              { icon: '📍', title: 'Instant Traceability', desc: 'Trace contamination or quality issues back to source in seconds.' },
              { icon: '🤝', title: 'Consumer Trust', desc: 'Verified provenance builds lasting consumer confidence in every product.' },
            ].map((f, i) => (
              <div key={i} className="card feature-card">
                <div className="f-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="page-container cta-inner">
          <h2>Ready to Transform Your Supply Chain?</h2>
          <p>Join AgroChain today and bring full transparency to agricultural trade.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-white btn-lg">Create Free Account →</Link>
            <Link to="/trace" className="btn btn-outline-white btn-lg">🔍 Trace a Product</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>🌾 AgroChain — Blockchain Supply Chain Transparency &nbsp;|&nbsp; Government of Odisha Initiative</p>
      </footer>
    </div>
  );
}
