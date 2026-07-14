"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendOtpEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create transporter using SMTP credentials from environment variables
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
/**
 * Send an email
 * @param to Recipient email address
 * @param subject Email subject line
 * @param html HTML body content
 * @param text Text body content fallback
 */
const sendEmail = async (to, subject, html, text) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"BuildConnect" <noreply@buildconnect.com>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Fallback stripping HTML tags
    };
    try {
        // Attempt sending
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`[Email] Sent email to ${to}: ${subject}`);
        }
        else {
            console.warn(`[Email MOCK] SMTP credentials missing. Logged email to ${to}: ${subject}`);
            console.log(`[Email HTML Contents]:\n${html}\n-------------------`);
        }
        return true;
    }
    catch (error) {
        console.error(`[Email ERROR] Failed sending email to ${to}:`, error);
        // Return true because we logged it locally; don't break the application flow for SMTP failures
        return false;
    }
};
exports.sendEmail = sendEmail;
/**
 * Helper to send registration OTP
 */
const sendOtpEmail = async (to, otp) => {
    const subject = 'Verify your BuildConnect Account';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0F172A; text-align: center;">Welcome to BuildConnect!</h2>
      <p style="font-size: 16px; color: #475569;">Thank you for registering. Please use the verification code below to verify your email address. This OTP is valid for 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3B82F6; background-color: #EFF6FF; padding: 10px 20px; border-radius: 8px; border: 1px solid #BFDBFE;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #64748B; text-align: center;">If you did not request this, please ignore this email.</p>
    </div>
  `;
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendOtpEmail = sendOtpEmail;
/**
 * Helper to send password reset OTP
 */
const sendPasswordResetEmail = async (to, otp) => {
    const subject = 'Reset your BuildConnect Password';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0F172A; text-align: center;">Reset Password Request</h2>
      <p style="font-size: 16px; color: #475569;">We received a request to reset your password. Please use the code below to proceed with resetting your password. This OTP is valid for 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #EF4444; background-color: #FEF2F2; padding: 10px 20px; border-radius: 8px; border: 1px solid #FEE2E2;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #64748B; text-align: center;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
  `;
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
