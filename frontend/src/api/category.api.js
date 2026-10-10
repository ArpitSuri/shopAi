import http from './http';

export const categoryApi = {
  list: () => http.get('/categories'),
  adminList: () => http.get('/categories/admin/all'),
  create: (data) => http.post('/categories', data),
  update: (id, data) => http.put(`/categories/${id}`, data),
  remove: (id) => http.delete(`/categories/${id}`),
};
