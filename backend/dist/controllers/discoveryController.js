"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryController = void 0;
const discoveryRepository_1 = require("../repositories/discoveryRepository");
const apiResponse_1 = require("../utils/apiResponse");
const discoveryValidator_1 = require("../validators/discoveryValidator");
class DiscoveryController {
    // Get all open projects and open packages on discovery boards
    static async getOpenProjects(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            const { search, location, propertyType, minBudget, maxBudget, matching } = req.query;
            const filters = {
                search: search ? String(search) : undefined,
                location: location ? String(location) : undefined,
                propertyType: propertyType ? String(propertyType) : undefined,
                minBudget: minBudget ? parseFloat(String(minBudget)) : undefined,
                maxBudget: maxBudget ? parseFloat(String(maxBudget)) : undefined,
                matchingContractorId: matching === 'true' ? contractorId : undefined
            };
            const page = parseInt(String(req.query.page), 10) || 1;
            const limit = parseInt(String(req.query.limit), 10) || 10;
            const projects = await discoveryRepository_1.DiscoveryRepository.getOpenProjects(filters, page, limit);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Open projects retrieved successfully.', projects));
        }
        catch (error) {
            next(error);
        }
    }
    // Get matching open packages for contractor specialties
    static async getMatchingPackages(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const packages = await discoveryRepository_1.DiscoveryRepository.getMatchingPackages(contractorId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Recommended open packages retrieved successfully.', packages));
        }
        catch (error) {
            next(error);
        }
    }
    // Get details of a single package for the bid form
    static async getPackageDetails(req, res, next) {
        try {
            const packageId = req.params.id;
            const details = await discoveryRepository_1.DiscoveryRepository.getPackageDetails(packageId);
            if (!details) {
                res.status(404).json((0, apiResponse_1.createApiResponse)(false, 'Work package not found.'));
                return;
            }
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Package details retrieved successfully.', details));
        }
        catch (error) {
            next(error);
        }
    }
    // Submit bid quotation for work package
    static async submitBid(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            const packageId = req.params.id;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = discoveryValidator_1.submitQuotationSchema.parse(req.body);
            const quotation = await discoveryRepository_1.DiscoveryRepository.submitQuotation(contractorId, packageId, validatedData);
            res.status(201).json((0, apiResponse_1.createApiResponse)(true, 'Your quotation bid has been submitted successfully.', quotation));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DiscoveryController = DiscoveryController;
exports.default = DiscoveryController;
