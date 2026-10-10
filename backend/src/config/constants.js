export const ROLES = { USER: 'user', ADMIN: 'admin' };

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Which statuses an order may move to from its current status
export const ORDER_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 49;
export const OTP_MAX_ATTEMPTS = 5;
