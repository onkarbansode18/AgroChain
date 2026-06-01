import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddProduce from './pages/farmer/AddProduce';
import MyProduce from './pages/farmer/MyProduce';
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import DistributorMarket from './pages/distributor/DistributorMarket';
import DistributorInventory from './pages/distributor/DistributorInventory';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import RetailerMarket from './pages/retailer/RetailerMarket';
import RetailerInventory from './pages/retailer/RetailerInventory';
import TraceProduce from './pages/consumer/TraceProduce';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBlockchain from './pages/admin/AdminBlockchain';
import './index.css';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role === 'consumer' ? 'consumer' : user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />
      <Route path="/verify-email" element={user ? <VerifyEmail /> : <Navigate to="/login" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/trace" element={<TraceProduce />} />
      <Route path="/trace/:id" element={<TraceProduce />} />
      <Route path="/farmer" element={<ProtectedRoute roles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
      <Route path="/farmer/add" element={<ProtectedRoute roles={['farmer']}><AddProduce /></ProtectedRoute>} />
      <Route path="/farmer/produce" element={<ProtectedRoute roles={['farmer']}><MyProduce /></ProtectedRoute>} />
      <Route path="/distributor" element={<ProtectedRoute roles={['distributor']}><DistributorDashboard /></ProtectedRoute>} />
      <Route path="/distributor/market" element={<ProtectedRoute roles={['distributor']}><DistributorMarket /></ProtectedRoute>} />
      <Route path="/distributor/inventory" element={<ProtectedRoute roles={['distributor']}><DistributorInventory /></ProtectedRoute>} />
      <Route path="/retailer" element={<ProtectedRoute roles={['retailer']}><RetailerDashboard /></ProtectedRoute>} />
      <Route path="/retailer/market" element={<ProtectedRoute roles={['retailer']}><RetailerMarket /></ProtectedRoute>} />
      <Route path="/retailer/inventory" element={<ProtectedRoute roles={['retailer']}><RetailerInventory /></ProtectedRoute>} />
      <Route path="/consumer" element={<TraceProduce />} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/blockchain" element={<ProtectedRoute roles={['admin']}><AdminBlockchain /></ProtectedRoute>} />
      <Route path="*" element={<div className="page-container" style={{textAlign:'center',paddingTop:'80px'}}><h1 style={{fontSize:'3rem'}}>404</h1><p style={{color:'var(--text-secondary)'}}>Page not found</p></div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
