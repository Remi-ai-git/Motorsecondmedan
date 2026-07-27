// =========================================================================
// Axios instance terpusat: menambahkan header Authorization otomatis dari
// localStorage, dan mengarahkan ke /login kalau server membalas 401
// (token tidak ada / kedaluwarsa / tidak valid).
// =========================================================================

import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('artamotor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('artamotor_token');
      localStorage.removeItem('artamotor_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default client;
