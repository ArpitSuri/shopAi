import http from './http';

export const productApi = {
  list: (params) => http.get('/products', { params }),
  adminList: (params) => http.get('/products/admin/all', { params }),
  get: (id) => http.get(`/products/${id}`),
  create: (data) => http.post('/products', data),
  update: (id, data) => http.put(`/products/${id}`, data),
  remove: (id) => http.delete(`/products/${id}`),
};
