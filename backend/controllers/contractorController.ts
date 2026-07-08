import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ContractorRepository } from '../repositories/contractorRepository';
import { StorageService } from '../storage/supabaseStorage';
import { createApiResponse } from '../utils/apiResponse';
import {
  updateContractorProfileSchema,
  submitContractorVerificationSchema,
  syncSkillsSchema,
  syncCategoriesSchema
} from '../validators/contractorValidator';
import { uploadFileSchema } from '../validators/builderValidator';

export class ContractorController {
  // Get contractor profile
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const profile = await ContractorRepository.getProfile(contractorId);
      if (!profile) {
        res.status(404).json(createApiResponse(false, 'Contractor profile not found.'));
        return;
      }

      res.status(200).json(
        createApiResponse(true, 'Contractor profile retrieved successfully.', profile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Update contractor business details
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = updateContractorProfileSchema.parse(req.body);
      const updatedProfile = await ContractorRepository.updateProfile(contractorId, validatedData);

      res.status(200).json(
        createApiResponse(true, 'Profile updated successfully.', updatedProfile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Sync contractor skills checklist
  static async updateSkills(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = syncSkillsSchema.parse(req.body);
      const updatedProfile = await ContractorRepository.updateSkills(contractorId, validatedData.skills);

      res.status(200).json(
        createApiResponse(true, 'Skills checklist synchronized successfully.', updatedProfile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Sync contractor categories checklist
  static async updateCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = syncCategoriesSchema.parse(req.body);
      const updatedProfile = await ContractorRepository.updateCategories(contractorId, validatedData.categories);

      res.status(200).json(
        createApiResponse(true, 'Work categories synchronized successfully.', updatedProfile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Submit Aadhaar / PAN verification papers
  static async submitVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = submitContractorVerificationSchema.parse(req.body);
      const updatedProfile = await ContractorRepository.submitVerification(contractorId, validatedData);

      res.status(200).json(
        createApiResponse(true, 'Verification documents submitted successfully for review.', updatedProfile)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get contractor dashboard analytics counters
  static async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const analytics = await ContractorRepository.getDashboardAnalytics(contractorId);
      res.status(200).json(
        createApiResponse(true, 'Analytics retrieved successfully.', analytics)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get applications/bids logs
  static async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const bids = await ContractorRepository.getApplicationsHistory(contractorId);
      res.status(200).json(
        createApiResponse(true, 'Quotation bids history retrieved successfully.', bids)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get won projects (active/completed)
  static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const projects = await ContractorRepository.getAwardedProjects(contractorId);
      res.status(200).json(
        createApiResponse(true, 'Awarded projects list retrieved successfully.', projects)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get builder ratings and reviews
  static async getReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const reviews = await ContractorRepository.getReviews(contractorId);
      res.status(200).json(
        createApiResponse(true, 'Builder reviews retrieved successfully.', reviews)
      );
    } catch (error) {
      next(error);
    }
  }

  // Upload contractor document
  static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = uploadFileSchema.parse(req.body);
      const { fileName, fileType, fileData } = validatedData;

      let base64String = fileData;
      if (fileData.includes('base64,')) {
        base64String = fileData.split('base64,')[1];
      }

      const fileBuffer = Buffer.from(base64String, 'base64');
      const fileUrl = await StorageService.uploadFile(fileBuffer, fileName, 'contractor-docs');

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
export default ContractorController;
