import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

const router = Router();

// Apply auth to all project routes
router.use(requireAuth);

// Project detail retrieval is open to all authenticated users (builders, contractors, admins)
router.get('/:id', ProjectController.getDetails);

// Actions restricted to builders only
router.post('/', requireRoles(['builder']), ProjectController.create);
router.get('/list/builder', requireRoles(['builder']), ProjectController.getBuilderProjects);
router.put('/:id', requireRoles(['builder']), ProjectController.update);
router.patch('/:id/status', requireRoles(['builder']), ProjectController.updateStatus);

export default router;
