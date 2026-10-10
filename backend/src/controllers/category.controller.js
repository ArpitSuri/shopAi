import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';

const assertNameFree = async (name, ignoreId) => {
  const clash = await Category.findOne({ slug: slugify(name), ...(ignoreId && { _id: { $ne: ignoreId } }) });
  if (clash) throw new ApiError(409, 'A category with this name already exists');
};

// GET /api/categories  (public: active only)
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, categories });
});

// GET /api/categories/admin/all  (admin: includes inactive + product counts)
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name').lean();
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  res.json({
    success: true,
    categories: categories.map((c) => ({ ...c, productCount: countMap[String(c._id)] || 0 })),
  });
});

// GET /api/categories/:id
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category || (!category.isActive && req.user?.role !== 'admin')) {
    throw new ApiError(404, 'Category not found');
  }
  res.json({ success: true, category });
});

// POST /api/categories  (admin)
export const createCategory = asyncHandler(async (req, res) => {
  await assertNameFree(req.body.name);
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

// PUT /api/categories/:id  (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  if (req.body.name) await assertNameFree(req.body.name, category._id);
  Object.assign(category, req.body);
  await category.save();

  res.json({ success: true, category });
});

// DELETE /api/categories/:id  (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  if (await Product.exists({ category: category._id })) {
    throw new ApiError(400, 'This category still has products. Move or delete them first.');
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
