import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { BuilderRepository } from '../repositories/builderRepository';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { createApiResponse } from '../utils/apiResponse';
import {
  updateBuilderProfileSchema,
  submitBuilderVerificationSchema,
  uploadFileSchema
} from '../validators/builderValidator';
import { StorageService } from '../storage/supabaseStorage';

export class BuilderController {
  // Get current builder profile
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const profile = await BuilderRepository.getProfile(builderId);
      if (!profile) {
        res.status(404).json(createApiResponse(false, 'Builder profile not found.'));
        return;
      }

      res.status(200).json(
        createApiResponse(true, 'Builder profile retrieved successfully.', profile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Update builder profile
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = updateBuilderProfileSchema.parse(req.body);
      const updatedProfile = await BuilderRepository.updateProfile(builderId, validatedData);

      res.status(200).json(
        createApiResponse(true, 'Profile updated successfully.', updatedProfile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Submit verification documents
  static async submitVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = submitBuilderVerificationSchema.parse(req.body);
      const updatedProfile = await BuilderRepository.submitVerification(builderId, validatedData);

      res.status(200).json(
        createApiResponse(true, 'Verification documents submitted successfully for review.', updatedProfile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get builder dashboard analytics counters
  static async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const analytics = await BuilderRepository.getDashboardAnalytics(builderId);
      res.status(200).json(
        createApiResponse(true, 'Analytics retrieved successfully.', analytics)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all contractor bids/applications for packages
  static async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const bids = await ApplicationRepository.getApplicationsForBuilder(builderId);
      res.status(200).json(
        createApiResponse(true, 'Contractor applications retrieved successfully.', bids)
      );
    } catch (error) {
      next(error);
    }
  }

  // Review (Accept / Reject) quotation
  static async reviewApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const quotationId = req.params.id;
      const { status } = req.body; // 'accepted' or 'rejected'

      if (!status || !['accepted', 'rejected'].includes(status)) {
        res.status(400).json(createApiResponse(false, "Status is required and must be 'accepted' or 'rejected'."));
        return;
      }

      // Security check: Verify that this quotation belongs to a project owned by this builder
      const quotation = await ApplicationRepository.getQuotationDetails(quotationId);
      if (!quotation) {
        res.status(404).json(createApiResponse(false, 'Quotation not found.'));
        return;
      }

      if (quotation.builder_id !== builderId) {
        res.status(403).json(createApiResponse(false, 'Access denied. You do not own the project for this quotation.'));
        return;
      }

      // Execute review
      await ApplicationRepository.reviewApplication(quotationId, status);

      res.status(200).json(
        createApiResponse(true, `Application has been successfully ${status}.`)
      );
    } catch (error) {
      next(error);
    }
  }

  // Upload verification document
  static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = uploadFileSchema.parse(req.body);
      const { fileName, fileType, fileData } = validatedData;

      // Extract base64 file buffer (handle data URL prefix if present)
      let base64String = fileData;
      if (fileData.includes('base64,')) {
        base64String = fileData.split('base64,')[1];
      }

      const fileBuffer = Buffer.from(base64String, 'base64');
      
      // Upload to storage
      const fileUrl = await StorageService.uploadFile(fileBuffer, fileName, 'builder-docs');

      res.status(200).json(
        createApiResponse(true, 'File uploaded successfully.', {
          url: fileUrl,
          name: fileName,
          type: fileType
        })
      );
    } catch (error) {
      next(error);
    }
  }
}
export default BuilderController;
