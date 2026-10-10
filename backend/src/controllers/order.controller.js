import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { calcPricing } from '../utils/pricing.js';
import { ORDER_FLOW, ORDER_STATUS, ROLES } from '../config/constants.js';

const restoreStock = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));

// POST /api/orders  (user) -> turns the cart into an order
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const cartItems = (cart?.items || []).filter((i) => i.product);
  if (!cartItems.length) throw new ApiError(400, 'Your cart is empty');

  for (const { product, quantity } of cartItems) {
    if (!product.isActive) throw new ApiError(400, `"${product.name}" is no longer available`);
    if (product.stock < quantity) throw new ApiError(400, `Only ${product.stock} of "${product.name}" left in stock`);
  }

  // Reserve stock atomically; undo if anything fails
  const reserved = [];
  try {
    for (const { product, quantity } of cartItems) {
      const result = await Product.updateOne(
        { _id: product._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );
      if (result.modifiedCount === 0) throw new ApiError(400, `"${product.name}" just went out of stock`);
      reserved.push({ product: product._id, quantity });
    }

    const items = cartItems.map(({ product, quantity }) => ({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
    }));
    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      ...calcPricing(itemsPrice),
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
});

// GET /api/orders/my  (user)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

// GET /api/orders/:id  (owner or admin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  const ownerId = order?.user?._id || order?.user;
  if (!order || (req.user.role !== ROLES.ADMIN && !ownerId.equals(req.user._id))) {
    throw new ApiError(404, 'Order not found');
  }
  res.json({ success: true, order });
});

// PATCH /api/orders/:id/cancel  (user, only while pending)
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status !== ORDER_STATUS.PENDING) {
    throw new ApiError(400, 'Only pending orders can be cancelled');
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  await order.save();
  await restoreStock(order.items);

  res.json({ success: true, order });
});

// GET /api/orders  (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
  const filter = req.query.status ? { status: req.query.status } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
});

// PATCH /api/orders/:id/status  (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');

  if (!ORDER_FLOW[order.status].includes(status)) {
    throw new ApiError(400, `Cannot change an order from "${order.status}" to "${status}"`);
  }

  order.status = status;
  if (status === ORDER_STATUS.DELIVERED) order.deliveredAt = new Date();
  if (status === ORDER_STATUS.CANCELLED) {
    order.cancelledAt = new Date();
    await restoreStock(order.items);
  }
  await order.save();

  res.json({ success: true, order });
});
