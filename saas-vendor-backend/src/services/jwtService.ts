import jwt from 'jsonwebtoken'; // Added SignOptions for better typing
import config from '../config/environment';
import { IJWTPayload } from '../types/index';

export class JWTService {
  /**
   * Generate Email Verification Token (24 hour expiration)
   */
  static generateEmailVerificationToken(email: string): string {
    const payload = { email };
    return jwt.sign(payload, config.jwtSecret as string, {
      expiresIn: '24h',
    });
  }

  /**
   * Verify Email Verification Token
   */
  static verifyEmailVerificationToken(token: string): { email: string } | null {
    try {
      return jwt.verify(token, config.jwtSecret as string) as { email: string };
    } catch {
      return null;
    }
  }

  /**
   * Generate Password Reset Token (1 hour expiration)
   */
  static generatePasswordResetToken(email: string): string {
    const payload = { email };
    return jwt.sign(payload, config.jwtSecret as string, {
      expiresIn: '1h',
    });
  }

  /**
   * Verify Password Reset Token
   */
  static verifyPasswordResetToken(token: string): { email: string } | null {
    try {
      return jwt.verify(token, config.jwtSecret as string) as { email: string };
    } catch {
      return null;
    }
  }
  /**
   * Generate Access Token (1 hour expiration)
   */
  static generateAccessToken(userId: string, email: string, role: 'user' | 'admin'): string {
    const payload: IJWTPayload = {
      userId,
      email,
      role,
    };

    // FIX: Cast expiresIn to any
    const token = jwt.sign(payload, config.jwtSecret as string, {
      expiresIn: config.jwtExpiration as any, 
    });

    return token;
  }

  /**
   * Generate Refresh Token (7 days expiration)
   */
  static generateRefreshToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
    };

    // FIX: Cast expiresIn to any
    const token = jwt.sign(payload, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiration as any,
    });

    return token;
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): IJWTPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret as string) as IJWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): { userId: string; email: string } | null {
    try {
      return jwt.verify(token, config.jwtRefreshSecret as string) as { userId: string; email: string };
    } catch {
      return null;
    }
  }
}