import http from './http';

export const cartApi = {
  get: () => http.get('/cart'),
  add: (productId, quantity = 1) => http.post('/cart', { productId, quantity }),
  update: (productId, quantity) => http.put(`/cart/items/${productId}`, { quantity }),
  remove: (productId) => http.delete(`/cart/items/${productId}`),
  clear: () => http.delete('/cart'),
};
