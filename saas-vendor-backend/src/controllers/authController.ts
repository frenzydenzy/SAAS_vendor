import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { JWTService } from '../services/jwtService';
import { EmailService } from '../services/emailService';
import { CustomError } from '../middleware/errorHandler';
import { IRequestWithUser } from '../types/index';

export class AuthController {
  /**
   * Verify Email
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        throw new CustomError('Verification token is required', 400);
      }

      const payload = JWTService.verifyEmailVerificationToken(token);
      if (!payload) {
        throw new CustomError('Invalid or expired verification token', 401);
      }

      const user = await User.findOne({ email: payload.email });
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Email verification failed',
      });
    }
  }

  /**
   * Refresh Token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw new CustomError('Refresh token not found', 401);
      }

      const payload = JWTService.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new CustomError('Invalid or expired refresh token', 401);
      }

      const user = await User.findById(payload.userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const newAccessToken = JWTService.generateAccessToken(user._id.toString(), user.email, user.role as any);

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });

      res.json({
        success: true,
        message: 'Token refreshed',
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * Forgot Password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new CustomError('Email is required', 400);
      }

      const user = await User.findOne({ email });
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const resetToken = JWTService.generatePasswordResetToken(email);
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      EmailService.sendPasswordResetEmail(email, user.firstName, resetLink).catch((error: any) => {
        console.warn(`⚠️  Failed to send password reset email to ${email}:`, error.message);
      });

      res.json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Forgot password request failed',
      });
    }
  }

  /**
   * Reset Password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        throw new CustomError('Token and new password are required', 400);
      }

      const payload = JWTService.verifyPasswordResetToken(token);
      if (!payload) {
        throw new CustomError('Invalid or expired reset token', 401);
      }

      const user = await User.findOne({ email: payload.email });
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Password reset failed',
      });
    }
  }
  /**
   * User Registration
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw new CustomError('All fields are required', 400);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new CustomError('Email already registered', 409);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const emailVerificationToken = JWTService.generateEmailVerificationToken(email);

      const newUser = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerificationToken,
        role: 'user',
      });

      await newUser.save();

      // ✨ Send verification email (non-blocking)
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
      EmailService.sendVerificationEmail(
        newUser.email,
        newUser.firstName,
        verificationLink
      ).catch((error: any) => {
        console.warn(`⚠️  Failed to send verification email to ${newUser.email}:`, error.message);
      });

      // ✨ Send welcome email (non-blocking)
      EmailService.sendWelcomeEmail(
        newUser.email,
        newUser.firstName
      ).catch((error: any) => {
        console.warn(`⚠️  Failed to send welcome email to ${newUser.email}:`, error.message);
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        user: { _id: newUser._id, email: newUser.email },
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * User Login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new CustomError('Email and password are required', 400);
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new CustomError('Invalid email or password', 401);
      }

      const accessToken = JWTService.generateAccessToken(user._id.toString(), user.email, user.role as any);
      const refreshToken = JWTService.generateRefreshToken(user._id.toString(), user.email);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1h
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000, // 7d
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: { email: user.email, role: user.role },
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * User Logout
   */
  static async logout(_req: IRequestWithUser, res: Response): Promise<void> {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  }
}