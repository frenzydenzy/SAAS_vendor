import { Response } from 'express';
import { User } from '../models/User';
import { UploadService } from '../services/uploadService';
import { CustomError } from '../middleware/errorHandler';
import { IRequestWithUser } from '../types/index';

export class UserController {
  /**
   * Get User Profile
   */
  static async getProfile(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new CustomError('User ID not found in request', 400);
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        user,
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve profile',
        });
      }
    }
  }

  /**
   * Update User Profile
   */
  static async updateProfile(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { firstName, lastName, phoneNumber, bio, preferredCategories } = req.body;
      const file = (req as any).file;

      if (!userId) {
        throw new CustomError('User ID not found in request', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Update allowed fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (bio) user.bio = bio;
      if (preferredCategories) user.preferredCategories = preferredCategories;

      // ✨ Upload profile image if provided
      if (file) {
        try {
          const profileImageUrl = await UploadService.uploadProfileImage(file.buffer, userId);
          user.profileImage = profileImageUrl;
        } catch (uploadError: any) {
          console.warn('Profile image upload failed:', uploadError.message);
          // Continue without image - don't crash
        }
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user,
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update profile',
        });
      }
    }
  }

  /**
   * Upload KYC Documents
   */
  static async uploadKYC(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { companyName, companyWebsite, companyEmail, fundingStage, employees, country } = req.body;
      const files = (req as any).files as Express.Multer.File[] | undefined;

      if (!userId) {
        throw new CustomError('User ID not found in request', 400);
      }

      if (!companyName || !fundingStage || !employees || !country) {
        throw new CustomError('All KYC fields are required', 400);
      }

      if (!files || files.length === 0) {
        throw new CustomError('At least one KYC document is required', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // ✨ Upload KYC documents to Cloudinary
      const documentUrls: string[] = [];
      for (const file of files) {
        try {
          const documentUrl = await UploadService.uploadKYCDocument(file.buffer, userId, file.originalname || `document-${Date.now()}`);
          documentUrls.push(documentUrl);
        } catch (uploadError: any) {
          console.warn('KYC document upload failed:', uploadError.message);
          throw new CustomError('Failed to upload KYC document', 400);
        }
      }

      // Update KYC information
      user.companyName = companyName;
      user.companyWebsite = companyWebsite;
      user.companyEmail = companyEmail;
      user.fundingStage = fundingStage as 'pre-seed' | 'seed' | 'series-a' | 'series-b+';
      user.employees = employees;
      user.country = country;
      user.kycDocumentPath = documentUrls[0] || '';
      user.kycStatus = 'pending'; // Set to pending for admin review

      await user.save();

      res.json({
        success: true,
        message: 'KYC documents submitted successfully. Awaiting admin approval.',
        user: {
          _id: user._id,
          email: user.email,
          companyName: user.companyName,
          kycStatus: user.kycStatus,
          documentsUploaded: documentUrls.length,
        },
      });
    } catch (error: any) {
      console.error('Upload KYC error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to upload KYC documents',
        });
      }
    }
  }

  /**
   * Get Verification Status
   */
  static async getVerificationStatus(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new CustomError('User ID not found in request', 400);
      }

      const user = await User.findById(userId).select('isEmailVerified isCompanyVerified kycStatus');
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        message: 'Verification status retrieved',
        verification: {
          isEmailVerified: user.isEmailVerified,
          isCompanyVerified: user.isCompanyVerified,
          kycStatus: user.kycStatus,
          isFullyVerified: user.isEmailVerified && user.isCompanyVerified && user.kycStatus === 'approved',
        },
      });
    } catch (error: any) {
      console.error('Get verification status error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve verification status',
        });
      }
    }
  }

  /**
   * Update Preferences
   */
  static async updatePreferences(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { emailNotifications, preferredCategories } = req.body;

      if (!userId) {
        throw new CustomError('User ID not found in request', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
      if (preferredCategories) user.preferredCategories = preferredCategories;

      await user.save();

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: {
          emailNotifications: user.emailNotifications,
          preferredCategories: user.preferredCategories,
        },
      });
    } catch (error: any) {
      console.error('Update preferences error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update preferences',
        });
      }
    }
  }

  /**
   * Delete Account
   */
  static async deleteAccount(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new CustomError('User ID not found in request', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // TODO: Delete associated claims before deleting user
      await User.findByIdAndDelete(userId);

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete account',
        });
      }
    }
  }
}
