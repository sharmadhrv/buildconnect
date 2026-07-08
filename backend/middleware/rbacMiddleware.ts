import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { createApiResponse } from '../utils/apiResponse';

/**
 * Restricts access to specific roles
 * @param roles Array of allowed roles ('admin', 'builder', 'contractor')
 */
export const requireRoles = (roles: Array<'admin' | 'builder' | 'contractor'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json(
        createApiResponse(false, 'Authentication required.', {}, null)
      );
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json(
        createApiResponse(false, 'Access denied. Insufficient permissions.', {}, null)
      );
      return;
    }

    next();
  };
};
