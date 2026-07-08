import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../services/authService';
import { createApiResponse } from '../utils/apiResponse';
import { query } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(
      createApiResponse(false, 'Authorization token required. Access denied.', {}, null)
    );
    return;
  }

  const token = authHeader.split(' ')[1];
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';

  try {
    const decoded = jwt.verify(token, accessSecret) as TokenPayload;

    // Check database to ensure user is not suspended
    const userCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [decoded.userId]);
    if (userCheck.rows[0]?.is_suspended) {
      res.status(403).json(
        createApiResponse(false, 'Your account has been suspended by an administrator. Access denied.', {}, null)
      );
      return;
    }

    req.user = decoded;
    next();
    return;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json(
        createApiResponse(false, 'Access token expired.', {}, { code: 'TOKEN_EXPIRED' })
      );
      return;
    }
    res.status(401).json(
      createApiResponse(false, 'Invalid access token. Authorization failed.', {}, null)
    );
    return;
  }
};
export default requireAuth;
