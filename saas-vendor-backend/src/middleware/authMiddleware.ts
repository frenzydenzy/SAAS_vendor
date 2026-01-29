import { Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';
import { IRequestWithUser } from '../types/index';

export const authMiddleware = (req: IRequestWithUser, res: Response, next: NextFunction): void => {
  try {
    // Accessing cookies requires the 'cookie-parser' middleware in your main app file
    const token = req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Please login.',
      });
      return; 
    }

    // Explicitly casting JWTService as 'any' is a temporary "escape hatch" 
    // if the TS Server restart doesn't work, but try the restart first!
    const decoded = (JWTService as any).verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
      });
      return;
    }

    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

/**
 * Admin Middleware - Check if user is admin
 */
export const adminMiddleware = (req: IRequestWithUser, res: Response, next: NextFunction): void => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
      return;
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({ success: false, message: 'Authorization failed' });
  }
};

/**
 * Optional Auth Middleware - User login is optional
 */
export const optionalAuthMiddleware = (req: IRequestWithUser, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      const decoded = (JWTService as any).verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
        req.userId = decoded.userId;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};