import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { IJWTPayload } from '../types/index';
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
// We cast to 'any' if the custom IRequestWithUser interface 
// conflicts with Express's internal middleware types
router.post('/logout', authMiddleware as any, AuthController.logout as any);

export default router;
export class JWTService {
  static generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, config.jwtSecret as string, {
      expiresIn: config.jwtExpiration as any,
    });
  }

  static generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiration as any,
    });
  }

  static verifyAccessToken(token: string): IJWTPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret as string) as IJWTPayload;
    } catch { return null; }
  }

  // FIX: Added verifyRefreshToken
  static verifyRefreshToken(token: string): any | null {
    try {
      return jwt.verify(token, config.jwtRefreshSecret as string);
    } catch { return null; }
  }

  // FIX: Added generateEmailVerificationToken
  static generateEmailVerificationToken(email: string): string {
    return jwt.sign({ email }, config.jwtSecret as string, { expiresIn: '24h' });
  }

  // FIX: Added verifyEmailToken
  static verifyEmailToken(token: string): string | null {
    try {
      const decoded: any = jwt.verify(token, config.jwtSecret as string);
      return decoded.email;
    } catch { return null; }
  }

  // FIX: Added generatePasswordResetToken
  static generatePasswordResetToken(email: string): string {
    return jwt.sign({ email }, config.jwtSecret as string, { expiresIn: '1h' });
  }

  // FIX: Added verifyPasswordResetToken
  static verifyPasswordResetToken(token: string): string | null {
    try {
      const decoded: any = jwt.verify(token, config.jwtSecret as string);
      return decoded.email;
    } catch { return null; }
  }
}