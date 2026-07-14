"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suspendUserSchema = exports.reviewVerificationSchema = void 0;
const zod_1 = require("zod");
exports.reviewVerificationSchema = zod_1.z.object({
    entityType: zod_1.z.enum(['builder', 'contractor'], {
        errorMap: () => ({ message: "Entity type must be either 'builder' or 'contractor'." })
    }),
    action: zod_1.z.enum(['approve', 'reject'], {
        errorMap: () => ({ message: "Review action must be either 'approve' or 'reject'." })
    }),
    remarks: zod_1.z.string().trim().optional()
});
exports.suspendUserSchema = zod_1.z.object({
    suspend: zod_1.z.boolean({
        required_error: "suspend flag is required."
    })
});
