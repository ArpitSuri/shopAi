import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { getOrCreateCart, buildCartResponse } from '../services/cart.service.js';

const sendCart = async (res, userId, status = 200) =>
  res.status(status).json({ success: true, cart: await buildCartResponse(userId) });

const getActiveProduct = async (id) => {
  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  await getOrCreateCart(req.user._id);
  await sendCart(res, req.user._id);
});

// POST /api/cart  { productId, quantity }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await getActiveProduct(productId);
  const cart = await getOrCreateCart(req.user._id);

  const existing = cart.items.find((i) => i.product.equals(product._id));
  const newQty = (existing?.quantity || 0) + quantity;
  if (newQty > product.stock) {
    throw new ApiError(400, product.stock === 0 ? 'This product is out of stock' : `Only ${product.stock} left in stock`);
  }

  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: product._id, quantity });
  await cart.save();

  await sendCart(res, req.user._id, 201);
});

// PUT /api/cart/items/:productId  { quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const product = await getActiveProduct(req.params.productId);
  if (quantity > product.stock) throw new ApiError(400, `Only ${product.stock} left in stock`);

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.equals(product._id));
  if (!item) throw new ApiError(404, 'Item is not in your cart');

  item.quantity = quantity;
  await cart.save();
  await sendCart(res, req.user._id);
});

// DELETE /api/cart/items/:productId
export const removeCartItem = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } });
  await sendCart(res, req.user._id);
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
  await sendCart(res, req.user._id);
});
