import { Router } from 'express';
import { BuilderController } from '../controllers/builderController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

const router = Router();

// Apply auth and role protection (Restricted to builders only)
router.use(requireAuth);
router.use(requireRoles(['builder']));

router.get('/profile', BuilderController.getProfile);
router.put('/profile', BuilderController.updateProfile);
router.post('/upload-document', BuilderController.uploadDocument);
router.post('/verify', BuilderController.submitVerification);
router.get('/analytics', BuilderController.getAnalytics);
router.get('/applications', BuilderController.getApplications);
router.post('/applications/:id/review', BuilderController.reviewApplication);

export default router;
