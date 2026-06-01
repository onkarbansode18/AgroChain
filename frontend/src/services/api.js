import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('agrochain_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('agrochain_token');
      sessionStorage.removeItem('agrochain_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const verifyEmail = (otp) => api.post('/auth/verify-email', { otp });
export const resendOTP = () => api.post('/auth/resend-otp');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password });
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/change-password', data);

// Farmer
export const addProduce = (data) => api.post('/farmer/produce', data);
export const getFarmerProduce = (query) => api.get('/farmer/produce', { params: query });
export const getFarmerTransactions = () => api.get('/farmer/transactions');
export const getFarmerStats = () => api.get('/farmer/stats');

// Distributor
export const getAvailableProduce = () => api.get('/distributor/available');
export const purchaseFromFarmer = (data) => api.post('/distributor/purchase', data);
export const addTransport = (data) => api.post('/distributor/transport', data);
export const getDistributorInventory = () => api.get('/distributor/inventory');
export const getDistributorStats = () => api.get('/distributor/stats');

// Retailer
export const getRetailerAvailable = () => api.get('/retailer/available');
export const purchaseFromDistributor = (data) => api.post('/retailer/purchase', data);
export const getRetailerInventory = () => api.get('/retailer/inventory');
export const getRetailerQR = (produceId) => api.get(`/retailer/qr/${produceId}`);
export const getRetailerStats = () => api.get('/retailer/stats');

// Consumer
export const traceProduce = (produceId) => api.get(`/consumer/trace/${produceId}`);
export const verifyProduce = (produceId) => api.get(`/consumer/verify/${produceId}`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const verifyUser = (userId) => api.put(`/admin/verify/${userId}`);
export const deactivateUser = (userId, reason) => api.put(`/admin/deactivate/${userId}`, { reason });
export const getBlockchain = () => api.get('/admin/blockchain');
export const getAdminTransactions = () => api.get('/admin/transactions');
export const getAdminProduce = () => api.get('/admin/produce');

// Disputes
export const raiseDispute = (data) => api.post('/disputes', data);
export const getMyDisputes = () => api.get('/disputes/my');
export const getAllDisputes = (status) => api.get('/disputes', { params: { status } });
export const resolveDispute = (id, data) => api.put(`/disputes/${id}/resolve`, data);

export default api;
