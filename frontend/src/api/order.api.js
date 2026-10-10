import http from './http';

export const orderApi = {
  create: (data) => http.post('/orders', data),
  mine: () => http.get('/orders/my'),
  cancel: (id) => http.patch(`/orders/${id}/cancel`),
  adminList: (params) => http.get('/orders', { params }),
  updateStatus: (id, status) => http.patch(`/orders/${id}/status`, { status }),
};
