import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AdminRepository } from '../repositories/adminRepository';
import { createApiResponse } from '../utils/apiResponse';
import { reviewVerificationSchema, suspendUserSchema } from '../validators/adminValidator';

export class AdminController {
  // Get all pending profiles awaiting verification
  static async getPendingList(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const verifications = await AdminRepository.getPendingVerifications();
      res.status(200).json(
        createApiResponse(true, 'Pending verifications retrieved successfully.', verifications)
      );
    } catch (error) {
      next(error);
    }
  }

  // Approve or reject builder/contractor verification profile
  static async reviewProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityId = req.params.id;
      const validatedData = reviewVerificationSchema.parse(req.body);
      const { entityType, action, remarks } = validatedData;

      const result = await AdminRepository.reviewVerification(entityType, entityId, action, remarks);

      const message = action === 'approve'
        ? `${entityType} profile has been successfully approved.`
        : `${entityType} profile has been rejected with logged remarks.`;

      res.status(200).json(createApiResponse(true, message, result));
    } catch (error) {
      next(error);
    }
  }

  // Get all registered users list
  static async getUsersList(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await AdminRepository.getAllUsers();
      res.status(200).json(createApiResponse(true, 'Users retrieved successfully.', users));
    } catch (error) {
      next(error);
    }
  }

  // Get all posted reviews list
  static async getReviewsList(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await AdminRepository.getAllReviews();
      res.status(200).json(createApiResponse(true, 'Reviews retrieved successfully.', reviews));
    } catch (error) {
      next(error);
    }
  }

  // Suspend or unsuspend user
  static async setUserSuspension(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const validatedData = suspendUserSchema.parse(req.body);
      const { suspend } = validatedData;

      const result = await AdminRepository.suspendUser(userId, suspend);
      const msg = suspend ? 'User account has been suspended.' : 'User account has been unsuspended.';

      res.status(200).json(createApiResponse(true, msg, result));
    } catch (error) {
      next(error);
    }
  }

  // Delete review
  static async removeReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = req.params.id;
      const result = await AdminRepository.deleteReview(reviewId);

      res.status(200).json(createApiResponse(true, 'Review has been successfully deleted.', result));
    } catch (error) {
      next(error);
    }
  }

  // Force cancel package
  static async forceCancelPackage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const packageId = req.params.id;
      const result = await AdminRepository.cancelPackage(packageId);

      res.status(200).json(createApiResponse(true, 'Work package has been cancelled by administrator.', result));
    } catch (error) {
      next(error);
    }
  }
}
export default AdminController;
