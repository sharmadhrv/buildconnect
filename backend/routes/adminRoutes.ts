import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

const router = Router();

// Apply auth and role protection (Restricted to administrators only)
router.use(requireAuth);
router.use(requireRoles(['admin']));

// Verification checkups
router.get('/verifications', AdminController.getPendingList);
router.post('/verifications/:id/review', AdminController.reviewProfile);

// User Moderation
router.get('/users', AdminController.getUsersList);
router.post('/users/:id/suspend', AdminController.setUserSuspension);

// Reviews Moderation
router.get('/reviews', AdminController.getReviewsList);
router.delete('/reviews/:id', AdminController.removeReview);

// Package Control overrides
router.post('/packages/:id/cancel', AdminController.forceCancelPackage);

export default router;
