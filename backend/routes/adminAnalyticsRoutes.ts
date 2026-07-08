import { Router } from 'express';
import { AdminAnalyticsController } from '../controllers/adminAnalyticsController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

const router = Router();

// Apply auth and role protection (Restricted to administrators only)
router.use(requireAuth);
router.use(requireRoles(['admin']));

router.get('/', AdminAnalyticsController.getAnalytics);

export default router;
