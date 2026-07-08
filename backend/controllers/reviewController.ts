import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ReviewRepository } from '../repositories/reviewRepository';
import { createApiResponse } from '../utils/apiResponse';
import { submitReviewValidatorSchema } from '../validators/reviewValidator';

export class ReviewController {
  // Mark package completed and submit ratings review
  static async submitReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      const packageId = req.params.id;

      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = submitReviewValidatorSchema.parse(req.body);
      const reviewResult = await ReviewRepository.createReview(builderId, packageId, validatedData);

      res.status(201).json(
        createApiResponse(true, 'Review submitted successfully. Work package marked completed.', reviewResult)
      );
    } catch (error) {
      next(error);
    }
  }
}
export default ReviewController;
