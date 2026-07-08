import { Router } from 'express';
import { DiscoveryController } from '../controllers/discoveryController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

const router = Router();

// Apply authentication guard to discovery routes
router.use(requireAuth);

router.get('/projects', DiscoveryController.getOpenProjects);

// Contractor specific endpoints
router.get('/matching', requireRoles(['contractor']), DiscoveryController.getMatchingPackages);
router.get('/packages/:id', requireRoles(['contractor']), DiscoveryController.getPackageDetails);
router.post('/packages/:id/bid', requireRoles(['contractor']), DiscoveryController.submitBid);

export default router;
