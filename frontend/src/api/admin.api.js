import http from './http';

export const adminApi = {
  stats: () => http.get('/admin/stats'),
};
