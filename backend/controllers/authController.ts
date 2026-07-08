import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { createApiResponse } from '../utils/apiResponse';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/authValidator';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  // Register User
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await AuthService.register(
        validatedData.email,
        validatedData.password,
        validatedData.role,
        validatedData.profileName
      );
      
      res.status(201).json(
        createApiResponse(true, 'Registration successful. OTP sent to your email.', user)
      );
    } catch (error) {
      next(error);
    }
  }

  // Login User
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const authData = await AuthService.login(validatedData.email, validatedData.password);
      
      res.status(200).json(
        createApiResponse(true, 'Login successful.', authData)
      );
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP Email
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      const result = await AuthService.verifyEmailOtp(validatedData.email, validatedData.otp);
      
      res.status(200).json(
        createApiResponse(true, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  // Refresh Token
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        const err: any = new Error('Refresh token is required.');
        err.statusCode = 400;
        throw err;
      }
      
      const newTokens = await AuthService.refreshToken(refreshToken);
      res.status(200).json(
        createApiResponse(true, 'Token refreshed successfully.', newTokens)
      );
    } catch (error) {
      next(error);
    }
  }

  // Forgot Password (Request OTP)
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      await AuthService.forgotPassword(validatedData.email);
      
      res.status(200).json(
        createApiResponse(true, 'If the email exists, an OTP has been sent for password reset.')
      );
    } catch (error) {
      next(error);
    }
  }

  // Reset Password (Verify OTP and Reset)
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(
        validatedData.email,
        validatedData.otp,
        validatedData.password
      );
      
      res.status(200).json(
        createApiResponse(true, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get Current User Profile (Route test helper)
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      res.status(200).json(
        createApiResponse(true, 'User details retrieved successfully.', { user })
      );
    } catch (error) {
      next(error);
    }
  }
}
