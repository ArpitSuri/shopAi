import { Router } from 'express';
import {
  getProducts,
  getAllProductsAdmin,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Public
router.get('/', getProducts);

// Admin only
router.get('/admin/all', protect, authorize(ROLES.ADMIN), getAllProductsAdmin);
router.post('/', protect, authorize(ROLES.ADMIN), validate(createProductSchema), createProduct);
router.put('/:id', protect, authorize(ROLES.ADMIN), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteProduct);

// Public
router.get('/:id', getProduct);

export default router;
