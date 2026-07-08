import { Router } from 'express';
import { NegotiationController } from '../controllers/negotiationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication guard to negotiation routes
router.use(requireAuth);

router.post('/:id/counter', NegotiationController.proposeCounter);
router.post('/:id/respond', NegotiationController.respondCounter);

export default router;
