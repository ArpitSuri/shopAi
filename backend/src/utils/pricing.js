import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../config/constants.js';

export const calcPricing = (itemsPrice) => {
  const shippingPrice = itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { itemsPrice, shippingPrice, totalPrice: itemsPrice + shippingPrice };
};
