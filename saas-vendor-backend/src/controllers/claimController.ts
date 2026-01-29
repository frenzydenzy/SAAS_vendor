import { Response } from 'express';
import { Claim } from '../models/Claim';
import { Deal } from '../models/Deal';
import { User } from '../models/User';
import { EmailService } from '../services/emailService';
import { CustomError } from '../middleware/errorHandler';
import { IRequestWithUser } from '../types/index';
import { generateClaimCode, generateRandomString, getPagination } from '../utils/helpers';

export class ClaimController {
  /**
   * Create Claim (User claims a deal)
   */
  static async createClaim(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { dealId } = req.body;

      if (!userId) {
        throw new CustomError('User ID not found', 400);
      }

      if (!dealId) {
        throw new CustomError('Deal ID is required', 400);
      }

      // Check if deal exists
      const deal = await Deal.findById(dealId);
      if (!deal) {
        throw new CustomError('Deal not found', 404);
      }

      // Check if user already claimed this deal
      const existingClaim = await Claim.findOne({ userId, dealId });
      if (existingClaim) {
        throw new CustomError('You have already claimed this deal', 409);
      }

      // Get user to check eligibility
      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Check if deal is locked and verify eligibility
      if (deal.isLocked) {
        if (deal.eligibilityConditions?.requiresEmailVerification && !user.isEmailVerified) {
          throw new CustomError('Email verification required to claim this deal', 403);
        }

        if (deal.eligibilityConditions?.requiresKYCApproval && user.kycStatus !== 'approved') {
          throw new CustomError('Company verification (KYC) approval required to claim this deal', 403);
        }
      }

      // Check claim limit
      if (deal.totalClaimsAllowed && deal.currentClaims >= deal.totalClaimsAllowed) {
        throw new CustomError('This deal has reached maximum claims limit', 409);
      }

      // Generate claim code and token
      const claimCode = generateClaimCode();
      const claimToken = generateRandomString();

      // Create claim
      const newClaim = new Claim({
        userId,
        dealId,
        status: 'pending',
        claimCode,
        claimToken,
        claimedAt: new Date(),
      });

      await newClaim.save();

      // Update deal claims count and list
      deal.currentClaims += 1;
      deal.claimsList.push(newClaim._id.toString());
      await deal.save();

      // Update user claimed deals
      user.claimedDeals.push(newClaim._id.toString());
      user.claimsHistory.push(newClaim._id.toString());
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Deal claimed successfully. Awaiting admin approval.',
        claim: {
          _id: newClaim._id,
          dealId: newClaim.dealId,
          status: newClaim.status,
          claimCode: newClaim.claimCode,
          claimedAt: newClaim.claimedAt,
        },
      });
    } catch (error: any) {
      console.error('Create claim error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create claim',
        });
      }
    }
  }

  /**
   * Get User's Claims
   */
  static async getUserClaims(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { skip } = getPagination(page, limit);

      if (!userId) {
        throw new CustomError('User ID not found', 400);
      }

      const claims = await Claim.find({ userId })
        .populate('dealId', 'title saasTool category originalPrice discountedPrice dealImage')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Claim.countDocuments({ userId });

      res.json({
        success: true,
        message: 'User claims retrieved',
        data: {
          claims,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Get user claims error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve claims',
        });
      }
    }
  }

  /**
   * Get Single Claim Details
   */
  static async getClaimDetails(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const userId = req.userId;

      const claim = await Claim.findById(claimId).populate('dealId userId', '-password');
      if (!claim) {
        throw new CustomError('Claim not found', 404);
      }

      // Check if user owns the claim (unless admin)
      if (claim.userId.toString() !== userId && req.user?.role !== 'admin') {
        throw new CustomError('Unauthorized access to this claim', 403);
      }

      res.json({
        success: true,
        message: 'Claim details retrieved',
        claim,
      });
    } catch (error: any) {
      console.error('Get claim details error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve claim details',
        });
      }
    }
  }

  /**
   * Approve Claim (Admin Only)
   */
  static async approveClaim(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;

      const claim = await Claim.findById(claimId).populate('userId dealId');
      if (!claim) {
        throw new CustomError('Claim not found', 404);
      }

      if (claim.status !== 'pending') {
        throw new CustomError(`Cannot approve a ${claim.status} claim`, 409);
      }

      // Update claim status
      claim.status = 'approved';
      claim.approvedAt = new Date();
      claim.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days expiration
      await claim.save();

      // ✨ Send approval email to user
      try {
        const user = claim.userId as any;
        const deal = claim.dealId as any;
        
        await EmailService.sendClaimApprovalEmail(
          user.email,
          deal.title,
          claim.claimCode
        );
      } catch (emailError: any) {
        console.warn('Failed to send claim approval email:', emailError.message);
        // Continue - don't crash if email fails
      }

      res.json({
        success: true,
        message: 'Claim approved successfully',
        claim: {
          _id: claim._id,
          status: claim.status,
          claimCode: claim.claimCode,
          approvedAt: claim.approvedAt,
          expiresAt: claim.expiresAt,
        },
      });
    } catch (error: any) {
      console.error('Approve claim error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to approve claim',
        });
      }
    }
  }

  /**
   * Reject Claim (Admin Only)
   */
  static async rejectClaim(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        throw new CustomError('Rejection reason is required', 400);
      }

      const claim = await Claim.findById(claimId).populate('userId dealId');
      if (!claim) {
        throw new CustomError('Claim not found', 404);
      }

      if (claim.status !== 'pending') {
        throw new CustomError(`Cannot reject a ${claim.status} claim`, 409);
      }

      // Update claim status
      claim.status = 'rejected';
      claim.rejectedAt = new Date();
      claim.rejectionReason = rejectionReason;
      await claim.save();

      // ✨ Send rejection email to user
      try {
        const user = claim.userId as any;
        const deal = claim.dealId as any;
        
        await EmailService.sendClaimRejectionEmail(
          user.email,

          deal.title,
          rejectionReason
        );
      } catch (emailError: any) {
        console.warn('Failed to send claim rejection email:', emailError.message);
        // Continue - don't crash if email fails
      }

      res.json({
        success: true,
        message: 'Claim rejected',
        claim: {
          _id: claim._id,
          status: claim.status,
          rejectionReason: claim.rejectionReason,
        },
      });
    } catch (error: any) {
      console.error('Reject claim error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to reject claim',
        });
      }
    }
  }

  /**
   * Get Claim Analytics (Admin Only)
   */
  static async getClaimAnalytics(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { dealId } = req.params;

      const deal = await Deal.findById(dealId);
      if (!deal) {
        throw new CustomError('Deal not found', 404);
      }

      const claims = await Claim.find({ dealId });
      const statusBreakdown = {
        pending: claims.filter(c => c.status === 'pending').length,
        approved: claims.filter(c => c.status === 'approved').length,
        rejected: claims.filter(c => c.status === 'rejected').length,
        expired: claims.filter(c => c.status === 'expired').length,
      };

      res.json({
        success: true,
        message: 'Claim analytics retrieved',
        analytics: {
          dealTitle: deal.title,
          totalClaims: claims.length,
          statusBreakdown,
          claimRate: deal.totalClaimsAllowed ? ((claims.length / deal.totalClaimsAllowed) * 100).toFixed(2) : 'Unlimited',
        },
      });
    } catch (error: any) {
      console.error('Get claim analytics error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve claim analytics',
        });
      }
    }
  }
}
