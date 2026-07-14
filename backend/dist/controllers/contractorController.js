"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractorController = void 0;
const contractorRepository_1 = require("../repositories/contractorRepository");
const supabaseStorage_1 = require("../storage/supabaseStorage");
const apiResponse_1 = require("../utils/apiResponse");
const contractorValidator_1 = require("../validators/contractorValidator");
const builderValidator_1 = require("../validators/builderValidator");
class ContractorController {
    // Get contractor profile
    static async getProfile(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const profile = await contractorRepository_1.ContractorRepository.getProfile(contractorId);
            if (!profile) {
                res.status(404).json((0, apiResponse_1.createApiResponse)(false, 'Contractor profile not found.'));
                return;
            }
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Contractor profile retrieved successfully.', profile));
        }
        catch (error) {
            next(error);
        }
    }
    // Update contractor business details
    static async updateProfile(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = contractorValidator_1.updateContractorProfileSchema.parse(req.body);
            const updatedProfile = await contractorRepository_1.ContractorRepository.updateProfile(contractorId, validatedData);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Profile updated successfully.', updatedProfile));
        }
        catch (error) {
            next(error);
        }
    }
    // Sync contractor skills checklist
    static async updateSkills(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = contractorValidator_1.syncSkillsSchema.parse(req.body);
            const updatedProfile = await contractorRepository_1.ContractorRepository.updateSkills(contractorId, validatedData.skills);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Skills checklist synchronized successfully.', updatedProfile));
        }
        catch (error) {
            next(error);
        }
    }
    // Sync contractor categories checklist
    static async updateCategories(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = contractorValidator_1.syncCategoriesSchema.parse(req.body);
            const updatedProfile = await contractorRepository_1.ContractorRepository.updateCategories(contractorId, validatedData.categories);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Work categories synchronized successfully.', updatedProfile));
        }
        catch (error) {
            next(error);
        }
    }
    // Submit Aadhaar / PAN verification papers
    static async submitVerification(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = contractorValidator_1.submitContractorVerificationSchema.parse(req.body);
            const updatedProfile = await contractorRepository_1.ContractorRepository.submitVerification(contractorId, validatedData);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Verification documents submitted successfully for review.', updatedProfile));
        }
        catch (error) {
            next(error);
        }
    }
    // Get contractor dashboard analytics counters
    static async getAnalytics(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const analytics = await contractorRepository_1.ContractorRepository.getDashboardAnalytics(contractorId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Analytics retrieved successfully.', analytics));
        }
        catch (error) {
            next(error);
        }
    }
    // Get applications/bids logs
    static async getApplications(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const bids = await contractorRepository_1.ContractorRepository.getApplicationsHistory(contractorId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Quotation bids history retrieved successfully.', bids));
        }
        catch (error) {
            next(error);
        }
    }
    // Get won projects (active/completed)
    static async getProjects(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const projects = await contractorRepository_1.ContractorRepository.getAwardedProjects(contractorId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Awarded projects list retrieved successfully.', projects));
        }
        catch (error) {
            next(error);
        }
    }
    // Get builder ratings and reviews
    static async getReviews(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const reviews = await contractorRepository_1.ContractorRepository.getReviews(contractorId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Builder reviews retrieved successfully.', reviews));
        }
        catch (error) {
            next(error);
        }
    }
    // Upload contractor document
    static async uploadDocument(req, res, next) {
        try {
            const contractorId = req.user?.userId;
            if (!contractorId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = builderValidator_1.uploadFileSchema.parse(req.body);
            const { fileName, fileType, fileData } = validatedData;
            let base64String = fileData;
            if (fileData.includes('base64,')) {
                base64String = fileData.split('base64,')[1];
            }
            const fileBuffer = Buffer.from(base64String, 'base64');
            const fileUrl = await supabaseStorage_1.StorageService.uploadFile(fileBuffer, fileName, 'contractor-docs');
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'File uploaded successfully.', {
                url: fileUrl,
                name: fileName,
                type: fileType
            }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ContractorController = ContractorController;
exports.default = ContractorController;
