import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  getCategories: () => API.get('/products/categories'),
  getBrands: () => API.get('/products/brands'),
  getReviews: (id) => API.get(`/products/${id}/reviews`),
};

export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (data) => API.post('/cart', data),
  updateQuantity: (id, quantity) => API.put(`/cart/${id}`, { quantity }),
  removeItem: (id) => API.delete(`/cart/${id}`),
  clearCart: () => API.delete('/cart/clear'),
};

export const orderAPI = {
  placeOrder: (data) => API.post('/orders/place', data),
  getMyOrders: () => API.get('/orders'),
  getOrder: (id) => API.get(`/orders/${id}`),
  cancelOrder: (id) => API.post(`/orders/${id}/cancel`),
};

export const walletAPI = {
  getBalance: () => API.get('/wallet'),
};

export const reviewAPI = {
  addReview: (productId, data) => API.post(`/reviews/product/${productId}`, data),
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getAllOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (id, status) => API.put(`/admin/orders/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } }),
  createProduct: (data) => API.post('/admin/products', data),
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  createCategory: (data) => API.post('/admin/categories', data),
  getUsers: () => API.get('/admin/users'),
};

export default API;
