"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCategoriesSchema = exports.syncSkillsSchema = exports.submitContractorVerificationSchema = exports.updateContractorProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateContractorProfileSchema = zod_1.z.object({
    business_name: zod_1.z.string().trim().min(2, 'Business name must be at least 2 characters.').optional(),
    website: zod_1.z.string().trim().url('Invalid website URL format.').optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().trim().optional(),
    preferences: zod_1.z.object({
        location: zod_1.z.string().trim().optional(),
        budgetMin: zod_1.z.number().nonnegative().optional(),
        budgetMax: zod_1.z.number().nonnegative().optional(),
    }).optional()
});
const contractorDocSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Document name is required.'),
    url: zod_1.z.string().url('Document URL must be valid.'),
    type: zod_1.z.string().min(1, 'Document file type is required.')
});
exports.submitContractorVerificationSchema = zod_1.z.object({
    pan_no: zod_1.z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must be a valid 10-character PAN.'),
    aadhaar_no: zod_1.z.string().trim().regex(/^[0-9]{12}$/, 'Invalid Aadhaar format. Must be exactly 12 digits.'),
    business_reg_no: zod_1.z.string().trim().min(1, 'Business registration number / license ID is required.'),
    documents: zod_1.z.array(contractorDocSchema).min(1, 'At least one registration / verification document must be uploaded.')
});
exports.syncSkillsSchema = zod_1.z.object({
    skills: zod_1.z.array(zod_1.z.string().uuid('Skill ID must be a valid UUID.'))
});
exports.syncCategoriesSchema = zod_1.z.object({
    categories: zod_1.z.array(zod_1.z.string().uuid('Category ID must be a valid UUID.'))
});
