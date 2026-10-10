import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

// Customer
router.post('/', authorize(ROLES.USER), validate(createOrderSchema), createOrder);
router.get('/my', authorize(ROLES.USER), getMyOrders);
router.patch('/:id/cancel', authorize(ROLES.USER), cancelMyOrder);

// Admin
router.get('/', authorize(ROLES.ADMIN), getAllOrders);
router.patch('/:id/status', authorize(ROLES.ADMIN), validate(updateOrderStatusSchema), updateOrderStatus);

// Owner or admin (checked inside the controller)
router.get('/:id', getOrder);

export default router;
