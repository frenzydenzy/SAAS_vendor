import { Request, Response } from 'express';
import { Deal } from '../models/Deal';
import { User } from '../models/User';
import { UploadService } from '../services/uploadService';
import { CustomError } from '../middleware/errorHandler';
import { IRequestWithUser } from '../types/index';
import { generateSlug, calculateDiscount, getPagination } from '../utils/helpers';

export class DealController {
  /**
   * List All Deals (Public - with pagination)
   */
  static async listDeals(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { skip } = getPagination(page, limit);

      const deals = await Deal.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('-createdBy');

      const total = await Deal.countDocuments();

      res.json({
        success: true,
        message: 'Deals retrieved successfully',
        data: {
          deals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('List deals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve deals',
      });
    }
  }

  /**
   * Search Deals
   */
  static async searchDeals(req: Request, res: Response): Promise<void> {
    try {
      const { query, category, isLocked } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { skip } = getPagination(page, limit);

      const filter: any = {};

      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { saasTool: { $regex: query, $options: 'i' } },
        ];
      }

      if (category) {
        filter.category = category;
      }

      if (isLocked !== undefined) {
        filter.isLocked = isLocked === 'true';
      }

      const deals = await Deal.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('-createdBy');

      const total = await Deal.countDocuments(filter);

      res.json({
        success: true,
        message: 'Search completed',
        data: {
          deals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Search deals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search deals',
      });
    }
  }

  /**
   * Get Single Deal by Slug
   */
  static async getDealBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const deal = await Deal.findOne({ slug }).populate('createdBy', 'email firstName lastName');
      if (!deal) {
        throw new CustomError('Deal not found', 404);
      }

      res.json({
        success: true,
        message: 'Deal retrieved successfully',
        deal,
      });
    } catch (error: any) {
      console.error('Get deal error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve deal',
        });
      }
    }
  }

  /**
   * Get Deals by Category
   */
  static async getDealsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { skip } = getPagination(page, limit);

      const deals = await Deal.find({ category })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('-createdBy');

      const total = await Deal.countDocuments({ category });

      res.json({
        success: true,
        message: `Deals in ${category} category retrieved`,
        data: {
          deals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Get deals by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve deals',
      });
    }
  }

  /**
   * Create Deal (Admin Only)
   */
  static async createDeal(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const {
        title,
        description,
        shortDescription,
        originalPrice,
        discountedPrice,
        category,
        saasTool,
        dealDuration,
        validTill,
        partnerName,
        partnerLogo,
        partnerWebsite,
        partnerDescription,
        isLocked,
        lockReason,
        eligibilityConditions,
        tags,
        highlights,
      } = req.body;
      
      const file = (req as any).file;
      const galleryFiles = (req as any).files as Express.Multer.File[] | undefined;

      // Validation
      const required = ['title', 'description', 'shortDescription', 'originalPrice', 'discountedPrice', 'category', 'saasTool', 'dealDuration', 'partnerName', 'partnerLogo', 'partnerWebsite'];
      for (const field of required) {
        if (!req.body[field]) {
          throw new CustomError(`${field} is required`, 400);
        }
      }

      if (!file) {
        throw new CustomError('Deal image is required', 400);
      }

      // ✨ Upload deal image
      let dealImage = '';
      try {
        dealImage = await UploadService.uploadDealImage(file.buffer, title.toLowerCase().replace(/\s+/g, '-'));
      } catch (uploadError: any) {
        console.error('Deal image upload failed:', uploadError.message);
        throw new CustomError('Failed to upload deal image', 400);
      }

      // ✨ Upload gallery images if provided
      let galleryImages: string[] = [];
      if (galleryFiles && galleryFiles.length > 0) {
        try {
          const fileBuffers = galleryFiles.map(f => f.buffer);
          galleryImages = await UploadService.uploadGalleryImages(
            fileBuffers,
            title.toLowerCase().replace(/\s+/g, '-')
          );
        } catch (uploadError: any) {
          console.warn('Gallery images upload failed:', uploadError.message);
          // Continue without gallery images
        }
      }

      // Generate slug
      const slug = generateSlug(title);

      // Check if slug already exists
      const existingDeal = await Deal.findOne({ slug });
      if (existingDeal) {
        throw new CustomError('A deal with this title already exists', 409);
      }

      // Calculate discount
      const discountPercentage = calculateDiscount(originalPrice, discountedPrice);

      // Create new deal
      const newDeal = new Deal({
        title,
        slug,
        description,
        shortDescription,
        originalPrice,
        discountedPrice,
        discountPercentage,
        category,
        saasTool,
        dealDuration,
        validTill,
        partnerName,
        partnerLogo,
        partnerWebsite,
        partnerDescription,
        isLocked: isLocked || false,
        lockReason,
        eligibilityConditions,
        dealImage,
        galleryImages,
        tags,
        highlights,
        currentClaims: 0,
        claimsList: [],
        createdBy: userId,
      });

      await newDeal.save();

      res.status(201).json({
        success: true,
        message: 'Deal created successfully',
        deal: newDeal,
      });
    } catch (error: any) {
      console.error('Create deal error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create deal',
        });
      }
    }
  }

  /**
   * Update Deal (Admin Only)
   */
  static async updateDeal(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { dealId } = req.params;
      const updateData = req.body;

      const deal = await Deal.findById(dealId);
      if (!deal) {
        throw new CustomError('Deal not found', 404);
      }

      // Update allowed fields
      Object.keys(updateData).forEach((key) => {
        if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
          (deal as any)[key] = updateData[key];
        }
      });

      // Recalculate discount if prices changed
      if (updateData.originalPrice || updateData.discountedPrice) {
        deal.discountPercentage = calculateDiscount(deal.originalPrice, deal.discountedPrice);
      }

      await deal.save();

      res.json({
        success: true,
        message: 'Deal updated successfully',
        deal,
      });
    } catch (error: any) {
      console.error('Update deal error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update deal',
        });
      }
    }
  }

  /**
   * Delete Deal (Admin Only)
   */
  static async deleteDeal(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { dealId } = req.params;

      const deal = await Deal.findByIdAndDelete(dealId);
      if (!deal) {
        throw new CustomError('Deal not found', 404);
      }

      res.json({
        success: true,
        message: 'Deal deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete deal error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete deal',
        });
      }
    }
  }

  /**
   * Check User Eligibility for Deal
   */
  static async checkEligibility(req: IRequestWithUser, res: Response): Promise<any> {
    try {
      const { dealId } = req.params;
      const userId = req.userId;

      if (!userId) {
        throw new CustomError('User ID not found', 400);
      }

      const deal = await Deal.findById(dealId);
      if (!deal) {
        throw new CustomError('Deal not found', 404);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Check if deal is locked
      if (!deal.isLocked) {
        res.json({
          success: true,
          message: 'Deal is public',
          eligible: true,
          reason: 'This deal is available to all users',
        });
        return;
      }

      // Check eligibility conditions
      let eligible = true;
      let reason = '';

      if (deal.eligibilityConditions?.requiresEmailVerification && !user.isEmailVerified) {
        eligible = false;
        reason = 'Email verification required';
      }

      if (deal.eligibilityConditions?.requiresKYCApproval && user.kycStatus !== 'approved') {
        eligible = false;
        reason = 'Company verification (KYC) required and not yet approved';
      }

      if (deal.eligibilityConditions?.minEmployees && user.employees && user.employees < deal.eligibilityConditions.minEmployees) {
        eligible = false;
        reason = `Minimum ${deal.eligibilityConditions.minEmployees} employees required`;
      }

      if (deal.eligibilityConditions?.maxEmployees && user.employees && user.employees > deal.eligibilityConditions.maxEmployees) {
        eligible = false;
        reason = `Maximum ${deal.eligibilityConditions.maxEmployees} employees allowed`;
      }

      if (deal.eligibilityConditions?.allowedFundingStages && user.fundingStage && !deal.eligibilityConditions.allowedFundingStages.includes(user.fundingStage)) {
        eligible = false;
        reason = `Your funding stage is not eligible for this deal`;
      }

      if (deal.eligibilityConditions?.allowedCountries && user.country && !deal.eligibilityConditions.allowedCountries.includes(user.country)) {
        eligible = false;
        reason = `This deal is not available in your country`;
      }

      res.json({
        success: true,
        message: eligible ? 'User is eligible' : 'User is not eligible',
        eligible,
        reason: reason || 'User meets all requirements',
      });
    } catch (error: any) {
      console.error('Check eligibility error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to check eligibility',
        });
      }
    }
  }
}
