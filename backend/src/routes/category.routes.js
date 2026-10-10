import { Router } from 'express';
import {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Public
router.get('/', getCategories);

// Admin only
router.get('/admin/all', protect, authorize(ROLES.ADMIN), getAllCategories);
router.post('/', protect, authorize(ROLES.ADMIN), validate(createCategorySchema), createCategory);
router.put('/:id', protect, authorize(ROLES.ADMIN), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCategory);

// Public (keep after /admin/all so "admin" is not treated as an id)
router.get('/:id', getCategory);

export default router;
