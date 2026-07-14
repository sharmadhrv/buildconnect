"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = require("../repositories/userRepository");
const email_1 = require("../utils/email");
const SALT_ROUNDS = 10;
class AuthService {
    // Generate JWT Access Token
    static generateAccessToken(payload) {
        const secret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
        const expiry = process.env.JWT_ACCESS_EXPIRY || '15m';
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiry });
    }
    // Generate JWT Refresh Token
    static generateRefreshToken(payload) {
        const secret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
        const expiry = process.env.JWT_REFRESH_EXPIRY || '7d';
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiry });
    }
    // Generate a random 6 digit numeric OTP
    static generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // REGISTER USER
    static async register(email, password, role, profileName) {
        // 1. Check if user already exists
        const existingUser = await userRepository_1.UserRepository.findByEmail(email);
        if (existingUser) {
            const err = new Error('Email already registered.');
            err.statusCode = 409;
            throw err;
        }
        // 2. Hash Password
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // 3. Create User in DB
        const user = await userRepository_1.UserRepository.createUser(email, passwordHash, role);
        // 4. Create builder or contractor profile
        if (role === 'builder') {
            await userRepository_1.UserRepository.createBuilderProfile(user.id, profileName);
        }
        else if (role === 'contractor') {
            await userRepository_1.UserRepository.createContractorProfile(user.id, profileName);
        }
        // 5. Generate OTP and send email (Disabled for local dev bypass)
        // const otp = this.generateOtp();
        // const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
        // await UserRepository.updateOtp(user.id, otp, otpExpires);
        // Send email asynchronously
        // sendOtpEmail(user.email, otp).catch(err => 
        //   console.error('[AuthService Register Email Error]:', err)
        // );
        // Return created user (exclude password hash)
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            is_email_verified: user.is_email_verified,
        };
    }
    // LOGIN USER
    static async login(email, password) {
        // 1. Find user
        const user = await userRepository_1.UserRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Invalid email or password.');
            err.statusCode = 401;
            throw err;
        }
        // 2. Check password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            const err = new Error('Invalid email or password.');
            err.statusCode = 401;
            throw err;
        }
        // 3. Generate tokens
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        // 4. Save Refresh Token in DB
        const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days matching standard config
        await userRepository_1.UserRepository.saveRefreshToken(user.id, refreshToken, refreshExpiry);
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                is_email_verified: user.is_email_verified,
            },
            accessToken,
            refreshToken,
        };
    }
    // ROLLING REFRESH TOKEN SESSION
    static async refreshToken(oldRefreshToken) {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
        let decoded;
        // 1. Verify token signature and expiry
        try {
            decoded = jsonwebtoken_1.default.verify(oldRefreshToken, refreshSecret);
        }
        catch (error) {
            const err = new Error('Invalid or expired refresh token.');
            err.statusCode = 401;
            throw err;
        }
        // 2. Look up refresh token in DB
        const dbToken = await userRepository_1.UserRepository.findRefreshToken(oldRefreshToken);
        if (!dbToken || dbToken.is_revoked || new Date() > new Date(dbToken.expires_at)) {
            // Security measure: if token is invalid or already used/revoked, revoke all tokens for this user
            if (dbToken && dbToken.is_revoked) {
                await userRepository_1.UserRepository.revokeAllUserTokens(decoded.userId);
                console.warn(`[Security Alert] Re-use of revoked refresh token by User ${decoded.userId}. Revoked all tokens.`);
            }
            const err = new Error('Session expired or revoked.');
            err.statusCode = 401;
            throw err;
        }
        // 3. Revoke current refresh token (single use token)
        await userRepository_1.UserRepository.revokeRefreshToken(oldRefreshToken);
        // 4. Generate new tokens
        const payload = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        const newAccessToken = this.generateAccessToken(payload);
        const newRefreshToken = this.generateRefreshToken(payload);
        // 5. Save new Refresh Token in DB
        const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await userRepository_1.UserRepository.saveRefreshToken(decoded.userId, newRefreshToken, refreshExpiry);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    // VERIFY OTP
    static async verifyEmailOtp(email, otp) {
        const user = await userRepository_1.UserRepository.findByEmail(email);
        if (!user) {
            const err = new Error('User not found.');
            err.statusCode = 404;
            throw err;
        }
        if (user.is_email_verified) {
            return { message: 'Email is already verified.' };
        }
        if (!user.otp || user.otp !== otp) {
            const err = new Error('Invalid OTP code.');
            err.statusCode = 400;
            throw err;
        }
        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            const err = new Error('OTP has expired.');
            err.statusCode = 400;
            throw err;
        }
        await userRepository_1.UserRepository.verifyEmail(user.id);
        return { message: 'Email verified successfully.' };
    }
    // REQUEST PASSWORD RESET
    static async forgotPassword(email) {
        const user = await userRepository_1.UserRepository.findByEmail(email);
        if (!user) {
            // Security best practice: Don't reveal if user doesn't exist, just return success
            return { success: true };
        }
        const otp = this.generateOtp();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
        await userRepository_1.UserRepository.updateOtp(user.id, otp, otpExpires);
        (0, email_1.sendPasswordResetEmail)(user.email, otp).catch(err => console.error('[AuthService Forgot Password Email Error]:', err));
        return { success: true };
    }
    // RESET PASSWORD
    static async resetPassword(email, otp, passwordNew) {
        const user = await userRepository_1.UserRepository.findByEmail(email);
        if (!user) {
            const err = new Error('User not found.');
            err.statusCode = 404;
            throw err;
        }
        if (!user.otp || user.otp !== otp) {
            const err = new Error('Invalid OTP code.');
            err.statusCode = 400;
            throw err;
        }
        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            const err = new Error('OTP has expired.');
            err.statusCode = 400;
            throw err;
        }
        // Hash new password
        const passwordHash = await bcrypt_1.default.hash(passwordNew, SALT_ROUNDS);
        await userRepository_1.UserRepository.updatePassword(user.id, passwordHash);
        // Revoke all refresh tokens for security
        await userRepository_1.UserRepository.revokeAllUserTokens(user.id);
        return { message: 'Password has been reset successfully.' };
    }
}
exports.AuthService = AuthService;
