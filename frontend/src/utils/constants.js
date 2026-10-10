export const ROLES = { USER: 'user', ADMIN: 'admin' };

// Same flow as the backend: which statuses an order may move to
export const ORDER_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const ORDER_STATUSES = Object.keys(ORDER_FLOW);

// Where each role lands after login
export const homeFor = (role) => (role === ROLES.ADMIN ? '/admin' : '/');
