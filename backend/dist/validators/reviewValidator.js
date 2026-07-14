"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReviewValidatorSchema = void 0;
const zod_1 = require("zod");
const scoreRangeSchema = zod_1.z.number().min(1, 'Rating must be at least 1.').max(5, 'Rating cannot exceed 5.');
exports.submitReviewValidatorSchema = zod_1.z.object({
    rating: scoreRangeSchema,
    feedback: zod_1.z.string().trim().min(2, 'Written feedback comment is required.'),
    ratings_breakdown: zod_1.z.object({
        quality: scoreRangeSchema,
        communication: scoreRangeSchema,
        timeliness: scoreRangeSchema,
        professionalism: scoreRangeSchema,
        safety: scoreRangeSchema
    })
});
