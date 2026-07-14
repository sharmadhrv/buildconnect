"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuotationSchema = void 0;
const zod_1 = require("zod");
const costBreakdownItemSchema = zod_1.z.object({
    item: zod_1.z.string().trim().min(2, 'Item name/description must be at least 2 characters.'),
    quantity: zod_1.z.number().positive('Quantity must be positive.'),
    unit: zod_1.z.string().trim().min(1, 'Unit (e.g. Kg, SqFt) is required.'),
    rate: zod_1.z.number().positive('Unit rate must be positive.'),
    total: zod_1.z.number().positive('Subtotal must be positive.')
});
exports.submitQuotationSchema = zod_1.z.object({
    proposed_budget: zod_1.z.number().positive('Proposed budget must be positive.'),
    proposed_timeline_start: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format.'),
    proposed_timeline_end: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format.'),
    proposal_notes: zod_1.z.string().trim().optional(),
    breakdown: zod_1.z.array(costBreakdownItemSchema).min(1, 'At least one item breakdown must be provided.')
});
