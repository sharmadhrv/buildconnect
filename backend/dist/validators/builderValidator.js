"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileSchema = exports.submitBuilderVerificationSchema = exports.verificationDocumentSchema = exports.updateBuilderProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateBuilderProfileSchema = zod_1.z.object({
    company_name: zod_1.z.string().trim().min(2, 'Company name must be at least 2 characters.').optional(),
    company_reg_no: zod_1.z.string().trim().optional(),
    gst_no: zod_1.z.string().trim().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format. Must be a valid Indian GSTIN.').optional().or(zod_1.z.literal('')),
    pan_no: zod_1.z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must be a valid 10-character PAN.').optional().or(zod_1.z.literal('')),
    website: zod_1.z.string().trim().url('Invalid website URL format.').optional().or(zod_1.z.literal('')),
    logo_url: zod_1.z.string().trim().url('Invalid logo URL format.').optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().trim().optional()
});
exports.verificationDocumentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Document name is required.'),
    url: zod_1.z.string().url('Document URL must be valid.'),
    type: zod_1.z.string().min(1, 'Document file type is required.')
});
exports.submitBuilderVerificationSchema = zod_1.z.object({
    company_reg_no: zod_1.z.string().trim().min(1, 'Company registration number is required.'),
    gst_no: zod_1.z.string().trim().min(15, 'GSTIN is required for company verification.'),
    pan_no: zod_1.z.string().trim().length(10, 'PAN is required for company verification.'),
    documents: zod_1.z.array(exports.verificationDocumentSchema).min(1, 'At least one registration / verification document must be uploaded.')
});
exports.uploadFileSchema = zod_1.z.object({
    fileName: zod_1.z.string().min(1, 'File name is required.'),
    fileType: zod_1.z.string().min(1, 'File type is required.'),
    fileData: zod_1.z.string().min(1, 'Base64 file data is required.')
});
