import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const roleLinks = {
  farmer: [
    { to: '/farmer', label: '📊 Dashboard' },
    { to: '/farmer/add', label: '🌿 Add Produce' },
    { to: '/farmer/produce', label: '📦 My Produce' }
  ],
  distributor: [
    { to: '/distributor', label: '📊 Dashboard' },
    { to: '/distributor/market', label: '🛒 Market' },
    { to: '/distributor/inventory', label: '📦 Inventory' }
  ],
  retailer: [
    { to: '/retailer', label: '📊 Dashboard' },
    { to: '/retailer/market', label: '🛒 Market' },
    { to: '/retailer/inventory', label: '📦 Inventory' }
  ],
  consumer: [{ to: '/consumer', label: '🔍 Trace Product' }],
  admin: [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/admin/blockchain', label: '⛓️ Blockchain' }
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = user ? (roleLinks[user.role] || []) : [];

  // Show email verification banner
  const showVerifyBanner = user && !user.isEmailVerified;

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <span className="brand-icon">🌾</span>
            <span className="brand-text">AgroChain</span>
          </Link>
          <div className="nav-links">
            {!user && (
              <>
                <Link to="/trace" className="nav-link">🔍 Trace</Link>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
            {user && (
              <>
                {links.map(l => (
                  <Link key={l.to} to={l.to} className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}>{l.label}</Link>
                ))}
                <Link to="/trace" className="nav-link">🔍 Trace</Link>
                <div className="nav-user">
                  <span className="user-badge">{user.role}</span>
                  <Link to="/profile" className="nav-link user-avatar" title="Profile">
                    <span className="avatar-circle">{user.name?.[0]?.toUpperCase()}</span>
                  </Link>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
      {showVerifyBanner && (
        <div className="verify-bar">
          <span>⚠️ Your email is not verified.</span>
          <Link to="/verify-email" className="verify-bar-link">Verify Now →</Link>
        </div>
      )}
    </>
  );
}
