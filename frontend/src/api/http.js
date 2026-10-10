import axios from 'axios';

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // Token expired or invalid while logged in -> clear session and go to login
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach the server' : err.message) || 'Something went wrong';

export default http;
