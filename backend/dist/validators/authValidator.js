"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address format.'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long.'),
    role: zod_1.z.enum(['builder', 'contractor'], {
        errorMap: () => ({ message: "Role must be either 'builder' or 'contractor'." })
    }),
    profileName: zod_1.z.string().trim().min(2, 'Builder/Contractor company name must be at least 2 characters long.')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address format.'),
    password: zod_1.z.string().min(1, 'Password is required.')
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address format.'),
    otp: zod_1.z.string().length(6, 'OTP must be exactly 6 digits long.').regex(/^\d+$/, 'OTP must contain numbers only.')
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address format.')
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address format.'),
    otp: zod_1.z.string().length(6, 'OTP must be exactly 6 digits long.').regex(/^\d+$/, 'OTP must contain numbers only.'),
    password: zod_1.z.string().min(6, 'New password must be at least 6 characters long.')
});
