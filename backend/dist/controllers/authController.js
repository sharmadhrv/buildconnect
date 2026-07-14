"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const apiResponse_1 = require("../utils/apiResponse");
const authValidator_1 = require("../validators/authValidator");
class AuthController {
    // Register User
    static async register(req, res, next) {
        try {
            const validatedData = authValidator_1.registerSchema.parse(req.body);
            const user = await authService_1.AuthService.register(validatedData.email, validatedData.password, validatedData.role, validatedData.profileName);
            res.status(201).json((0, apiResponse_1.createApiResponse)(true, 'Registration successful. OTP sent to your email.', user));
        }
        catch (error) {
            next(error);
        }
    }
    // Login User
    static async login(req, res, next) {
        try {
            const validatedData = authValidator_1.loginSchema.parse(req.body);
            const authData = await authService_1.AuthService.login(validatedData.email, validatedData.password);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Login successful.', authData));
        }
        catch (error) {
            next(error);
        }
    }
    // Verify OTP Email
    static async verifyOtp(req, res, next) {
        try {
            const validatedData = authValidator_1.verifyOtpSchema.parse(req.body);
            const result = await authService_1.AuthService.verifyEmailOtp(validatedData.email, validatedData.otp);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, result.message));
        }
        catch (error) {
            next(error);
        }
    }
    // Refresh Token
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                const err = new Error('Refresh token is required.');
                err.statusCode = 400;
                throw err;
            }
            const newTokens = await authService_1.AuthService.refreshToken(refreshToken);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Token refreshed successfully.', newTokens));
        }
        catch (error) {
            next(error);
        }
    }
    // Forgot Password (Request OTP)
    static async forgotPassword(req, res, next) {
        try {
            const validatedData = authValidator_1.forgotPasswordSchema.parse(req.body);
            await authService_1.AuthService.forgotPassword(validatedData.email);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'If the email exists, an OTP has been sent for password reset.'));
        }
        catch (error) {
            next(error);
        }
    }
    // Reset Password (Verify OTP and Reset)
    static async resetPassword(req, res, next) {
        try {
            const validatedData = authValidator_1.resetPasswordSchema.parse(req.body);
            const result = await authService_1.AuthService.resetPassword(validatedData.email, validatedData.otp, validatedData.password);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, result.message));
        }
        catch (error) {
            next(error);
        }
    }
    // Get Current User Profile (Route test helper)
    static async getMe(req, res, next) {
        try {
            const user = req.user;
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'User details retrieved successfully.', { user }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
