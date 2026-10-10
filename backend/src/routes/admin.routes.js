import { Router } from 'express';
import { getStats } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));
router.get('/stats', getStats);

export default router;
