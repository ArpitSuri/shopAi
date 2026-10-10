import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Cart from '../models/Cart.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/slugify.js';

const SORTS = {
  newest: '-createdAt',
  price_asc: 'price',
  price_desc: '-price',
  name: 'name',
};

// Shared by the public list and the admin list
const listProducts = async (query, { includeInactive }) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 12, 1), 50);

  const filter = {};
  if (!includeInactive) filter.isActive = true;
  if (query.category) filter.category = query.category;
  if (query.search) filter.name = { $regex: escapeRegex(String(query.search)), $options: 'i' };
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(SORTS[query.sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } };
};

const assertCategoryExists = async (id) => {
  if (!(await Category.exists({ _id: id }))) throw new ApiError(400, 'Selected category does not exist');
};

// GET /api/products  (public, active only)
export const getProducts = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await listProducts(req.query, { includeInactive: false })) });
});

// GET /api/products/admin/all  (admin, includes inactive)
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await listProducts(req.query, { includeInactive: true })) });
});

// GET /api/products/:id  (public)
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

// POST /api/products  (admin)
export const createProduct = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.category);
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  await product.populate('category', 'name slug');
  res.status(201).json({ success: true, product });
});

// PUT /api/products/:id  (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.category) await assertCategoryExists(req.body.category);

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

// DELETE /api/products/:id  (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  // Remove the product from everyone's cart (past orders keep their own snapshot)
  await Cart.updateMany({}, { $pull: { items: { product: product._id } } });
  res.json({ success: true, message: 'Product deleted' });
});
