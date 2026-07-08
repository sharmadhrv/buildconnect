import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AdminAnalyticsRepository } from '../repositories/adminAnalyticsRepository';
import { createApiResponse } from '../utils/apiResponse';

export class AdminAnalyticsController {
  // Get platform-wide aggregated analytics metrics
  static async getAnalytics(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminAnalyticsRepository.getPlatformAnalytics();
      res.status(200).json(
        createApiResponse(true, 'Platform statistics retrieved successfully.', stats)
      );
    } catch (error) {
      next(error);
    }
  }
}
export default AdminAnalyticsController;
