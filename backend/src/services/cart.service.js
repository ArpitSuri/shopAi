import Cart from '../models/Cart.js';
import { calcPricing } from '../utils/pricing.js';

export const getOrCreateCart = (userId) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { items: [] } },
    { upsert: true, new: true }
  );

// Shapes the cart for the client: drops deleted products and adds totals
export const buildCartResponse = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price image stock isActive',
  });

  const items = (cart?.items || [])
    .filter((i) => i.product)
    .map((i) => ({
      product: i.product,
      quantity: i.quantity,
      lineTotal: i.product.price * i.quantity,
    }));

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const { shippingPrice, totalPrice } = calcPricing(subtotal);

  return {
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    shippingPrice,
    totalPrice,
  };
};
