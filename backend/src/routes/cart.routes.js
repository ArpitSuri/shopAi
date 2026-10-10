import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Only customers have a cart
router.use(protect, authorize(ROLES.USER));

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.delete('/', clearCart);
router.put('/items/:productId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:productId', removeCartItem);

export default router;
