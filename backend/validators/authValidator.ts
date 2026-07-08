import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address format.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  role: z.enum(['builder', 'contractor'], {
    errorMap: () => ({ message: "Role must be either 'builder' or 'contractor'." })
  }),
  profileName: z.string().trim().min(2, 'Builder/Contractor company name must be at least 2 characters long.')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format.'),
  password: z.string().min(1, 'Password is required.')
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address format.'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits long.').regex(/^\d+$/, 'OTP must contain numbers only.')
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format.')
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format.'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits long.').regex(/^\d+$/, 'OTP must contain numbers only.'),
  password: z.string().min(6, 'New password must be at least 6 characters long.')
});
