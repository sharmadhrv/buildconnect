import { Router } from 'express';
import { ContractorController } from '../controllers/contractorController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

const router = Router();

// Apply auth and role protection (Restricted to contractors only)
router.use(requireAuth);
router.use(requireRoles(['contractor']));

router.get('/profile', ContractorController.getProfile);
router.put('/profile', ContractorController.updateProfile);
router.put('/skills', ContractorController.updateSkills);
router.put('/categories', ContractorController.updateCategories);
router.post('/upload-document', ContractorController.uploadDocument);
router.post('/verify', ContractorController.submitVerification);
router.get('/analytics', ContractorController.getAnalytics);
router.get('/applications', ContractorController.getApplications);
router.get('/projects', ContractorController.getProjects);
router.get('/reviews', ContractorController.getReviews);

export default router;
