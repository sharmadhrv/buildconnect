import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

const router = Router();

// Apply auth and role protection (Restricted to builders only)
router.use(requireAuth);
router.use(requireRoles(['builder']));

router.post('/packages/:id', ReviewController.submitReview);

export default router;
