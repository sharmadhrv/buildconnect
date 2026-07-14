"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderController = void 0;
const builderRepository_1 = require("../repositories/builderRepository");
const applicationRepository_1 = require("../repositories/applicationRepository");
const apiResponse_1 = require("../utils/apiResponse");
const builderValidator_1 = require("../validators/builderValidator");
const supabaseStorage_1 = require("../storage/supabaseStorage");
class BuilderController {
    // Get current builder profile
    static async getProfile(req, res, next) {
        try {
            const builderId = req.user?.userId;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const profile = await builderRepository_1.BuilderRepository.getProfile(builderId);
            if (!profile) {
                res.status(404).json((0, apiResponse_1.createApiResponse)(false, 'Builder profile not found.'));
                return;
            }
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Builder profile retrieved successfully.', profile));
        }
        catch (error) {
            next(error);
        }
    }
    // Update builder profile
    static async updateProfile(req, res, next) {
        try {
            const builderId = req.user?.userId;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = builderValidator_1.updateBuilderProfileSchema.parse(req.body);
            const updatedProfile = await builderRepository_1.BuilderRepository.updateProfile(builderId, validatedData);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Profile updated successfully.', updatedProfile));
        }
        catch (error) {
            next(error);
        }
    }
    // Submit verification documents
    static async submitVerification(req, res, next) {
        try {
            const builderId = req.user?.userId;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = builderValidator_1.submitBuilderVerificationSchema.parse(req.body);
            const updatedProfile = await builderRepository_1.BuilderRepository.submitVerification(builderId, validatedData);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Verification documents submitted successfully for review.', updatedProfile));
        }
        catch (error) {
            next(error);
        }
    }
    // Get builder dashboard analytics counters
    static async getAnalytics(req, res, next) {
        try {
            const builderId = req.user?.userId;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const analytics = await builderRepository_1.BuilderRepository.getDashboardAnalytics(builderId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Analytics retrieved successfully.', analytics));
        }
        catch (error) {
            next(error);
        }
    }
    // Get all contractor bids/applications for packages
    static async getApplications(req, res, next) {
        try {
            const builderId = req.user?.userId;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const bids = await applicationRepository_1.ApplicationRepository.getApplicationsForBuilder(builderId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Contractor applications retrieved successfully.', bids));
        }
        catch (error) {
            next(error);
        }
    }
    // Review (Accept / Reject) quotation
    static async reviewApplication(req, res, next) {
        try {
            const builderId = req.user?.userId;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const quotationId = req.params.id;
            const { status } = req.body; // 'accepted' or 'rejected'
            if (!status || !['accepted', 'rejected'].includes(status)) {
                res.status(400).json((0, apiResponse_1.createApiResponse)(false, "Status is required and must be 'accepted' or 'rejected'."));
                return;
            }
            // Security check: Verify that this quotation belongs to a project owned by this builder
            const quotation = await applicationRepository_1.ApplicationRepository.getQuotationDetails(quotationId);
            if (!quotation) {
                res.status(404).json((0, apiResponse_1.createApiResponse)(false, 'Quotation not found.'));
                return;
            }
            if (quotation.builder_id !== builderId) {
                res.status(403).json((0, apiResponse_1.createApiResponse)(false, 'Access denied. You do not own the project for this quotation.'));
                return;
            }
            // Execute review
            await applicationRepository_1.ApplicationRepository.reviewApplication(quotationId, status);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, `Application has been successfully ${status}.`));
        }
        catch (error) {
            next(error);
        }
    }
    // Upload verification document
    static async uploadDocument(req, res, next) {
        try {
            const builderId = req.user?.userId;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = builderValidator_1.uploadFileSchema.parse(req.body);
            const { fileName, fileType, fileData } = validatedData;
            // Extract base64 file buffer (handle data URL prefix if present)
            let base64String = fileData;
            if (fileData.includes('base64,')) {
                base64String = fileData.split('base64,')[1];
            }
            const fileBuffer = Buffer.from(base64String, 'base64');
            // Upload to storage
            const fileUrl = await supabaseStorage_1.StorageService.uploadFile(fileBuffer, fileName, 'builder-docs');
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
exports.BuilderController = BuilderController;
exports.default = BuilderController;
