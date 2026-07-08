import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DiscoveryRepository } from '../repositories/discoveryRepository';
import { createApiResponse } from '../utils/apiResponse';
import { submitQuotationSchema } from '../validators/discoveryValidator';

export class DiscoveryController {
  // Get all open projects and open packages on discovery boards
  static async getOpenProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      const { search, location, propertyType, minBudget, maxBudget, matching } = req.query;

      const filters: any = {
        search: search ? String(search) : undefined,
        location: location ? String(location) : undefined,
        propertyType: propertyType ? String(propertyType) : undefined,
        minBudget: minBudget ? parseFloat(String(minBudget)) : undefined,
        maxBudget: maxBudget ? parseFloat(String(maxBudget)) : undefined,
        matchingContractorId: matching === 'true' ? contractorId : undefined
      };

      const page = parseInt(String(req.query.page), 10) || 1;
      const limit = parseInt(String(req.query.limit), 10) || 10;

      const projects = await DiscoveryRepository.getOpenProjects(filters, page, limit);

      res.status(200).json(
        createApiResponse(true, 'Open projects retrieved successfully.', projects)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get matching open packages for contractor specialties
  static async getMatchingPackages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const packages = await DiscoveryRepository.getMatchingPackages(contractorId);

      res.status(200).json(
        createApiResponse(true, 'Recommended open packages retrieved successfully.', packages)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get details of a single package for the bid form
  static async getPackageDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const packageId = req.params.id;
      const details = await DiscoveryRepository.getPackageDetails(packageId);
      if (!details) {
        res.status(404).json(createApiResponse(false, 'Work package not found.'));
        return;
      }
      res.status(200).json(
        createApiResponse(true, 'Package details retrieved successfully.', details)
      );
    } catch (error) {
      next(error);
    }
  }

  // Submit bid quotation for work package
  static async submitBid(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractorId = req.user?.userId;
      const packageId = req.params.id;

      if (!contractorId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = submitQuotationSchema.parse(req.body);
      const quotation = await DiscoveryRepository.submitQuotation(contractorId, packageId, validatedData);

      res.status(201).json(
        createApiResponse(true, 'Your quotation bid has been submitted successfully.', quotation)
      );
    } catch (error) {
      next(error);
    }
  }
}
export default DiscoveryController;
