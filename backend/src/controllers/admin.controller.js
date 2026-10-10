import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ORDER_STATUS, ROLES } from '../config/constants.js';

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const [customers, products, categories, orders, pendingOrders, lowStock, revenue] = await Promise.all([
    User.countDocuments({ role: ROLES.USER, isVerified: true }),
    Product.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: ORDER_STATUS.PENDING }),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.aggregate([
      { $match: { status: { $ne: ORDER_STATUS.CANCELLED } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: { customers, products, categories, orders, pendingOrders, lowStock, revenue: revenue[0]?.total || 0 },
  });
});
