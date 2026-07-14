"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondCounterSchema = exports.proposeCounterSchema = void 0;
const zod_1 = require("zod");
exports.proposeCounterSchema = zod_1.z.object({
    budget: zod_1.z.number().positive('Counter budget must be positive.'),
    notes: zod_1.z.string().trim().min(2, 'Counter-offer note must describe changes requested.')
});
exports.respondCounterSchema = zod_1.z.object({
    action: zod_1.z.enum(['accept', 'reject'], {
        errorMap: () => ({ message: "Decision action must be either 'accept' or 'reject'." })
    })
});
