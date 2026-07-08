import { query } from '../config/db';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'builder' | 'contractor';
  is_email_verified: boolean;
  otp: string | null;
  otp_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  is_revoked: boolean;
  created_at: Date;
}

export class UserRepository {
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Create user
  static async createUser(email: string, passwordHash: string, role: 'admin' | 'builder' | 'contractor'): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash, role, is_email_verified) 
       VALUES ($1, $2, $3, TRUE) 
       RETURNING *`,
      [email.toLowerCase().trim(), passwordHash, role]
    );
    return result.rows[0];
  }

  // Update OTP details
  static async updateOtp(userId: string, otp: string | null, expiresAt: Date | null): Promise<void> {
    await query(
      `UPDATE users 
       SET otp = $1, otp_expires_at = $2, updated_at = NOW() 
       WHERE id = $3`,
      [otp, expiresAt, userId]
    );
  }

  // Set email verified
  static async verifyEmail(userId: string): Promise<void> {
    await query(
      `UPDATE users 
       SET is_email_verified = TRUE, otp = NULL, otp_expires_at = NULL, updated_at = NOW() 
       WHERE id = $1`,
      [userId]
    );
  }

  // Update password
  static async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await query(
      `UPDATE users 
       SET password_hash = $1, otp = NULL, otp_expires_at = NULL, updated_at = NOW() 
       WHERE id = $2`,
      [passwordHash, userId]
    );
  }

  // Create Builder Profile
  static async createBuilderProfile(userId: string, companyName: string): Promise<void> {
    await query(
      `INSERT INTO builders (id, company_name) 
       VALUES ($1, $2)`,
      [userId, companyName]
    );
  }

  // Create Contractor Profile
  static async createContractorProfile(userId: string, businessName: string): Promise<void> {
    await query(
      `INSERT INTO contractors (id, business_name) 
       VALUES ($1, $2)`,
      [userId, businessName]
    );
  }

  // Save Refresh Token
  static async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );
  }

  // Find Refresh Token
  static async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 LIMIT 1',
      [token]
    );
    return result.rows[0] || null;
  }

  // Revoke Refresh Token
  static async revokeRefreshToken(token: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1',
      [token]
    );
  }

  // Revoke All Refresh Tokens for a user (e.g. for security reset or sign out)
  static async revokeAllUserTokens(userId: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1',
      [userId]
    );
  }
}
