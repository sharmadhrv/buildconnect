import { Router } from 'express';
import { query } from '../config/db';
import { requireAuth } from '../middleware/authMiddleware';
import { createApiResponse } from '../utils/apiResponse';

const router = Router();

// Apply authentication guard
router.use(requireAuth);

// Get master skills list
router.get('/skills', async (_req, res, next) => {
  try {
    const result = await query('SELECT id, name FROM skills ORDER BY name ASC');
    res.status(200).json(
      createApiResponse(true, 'Master skills retrieved successfully.', result.rows)
    );
  } catch (error) {
    next(error);
  }
});

// Get master categories list
router.get('/categories', async (_req, res, next) => {
  try {
    const result = await query('SELECT id, name FROM categories ORDER BY name ASC');
    res.status(200).json(
      createApiResponse(true, 'Master categories retrieved successfully.', result.rows)
    );
  } catch (error) {
    next(error);
  }
});

export default router;
