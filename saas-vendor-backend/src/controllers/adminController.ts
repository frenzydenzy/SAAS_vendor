import { Response } from 'express';
import { User } from '../models/User';
import { Deal } from '../models/Deal';
import { Claim } from '../models/Claim';
import { AdminAction } from '../models/AdminAction';
import { KYCService } from '../services/kycService';
import { CustomError } from '../middleware/errorHandler';
import { IRequestWithUser } from '../types/index';
import { getPagination } from '../utils/helpers';

export class AdminController {
  /**
   * Get Dashboard Stats
   */
  static async getDashboard(_req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const totalUsers = await User.countDocuments();
      const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
      const kycApprovedUsers = await User.countDocuments({ kycStatus: 'approved' });
      
      const totalDeals = await Deal.countDocuments();
      const lockedDeals = await Deal.countDocuments({ isLocked: true });
      
      const totalClaims = await Claim.countDocuments();
      const pendingClaims = await Claim.countDocuments({ status: 'pending' });
      const approvedClaims = await Claim.countDocuments({ status: 'approved' });
      const rejectedClaims = await Claim.countDocuments({ status: 'rejected' });
      
      const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });

      res.json({
        success: true,
        message: 'Dashboard stats retrieved',
        stats: {
          users: {
            total: totalUsers,
            verified: verifiedUsers,
            kycApproved: kycApprovedUsers,
            pendingKYC,
          },
          deals: {
            total: totalDeals,
            locked: lockedDeals,
            public: totalDeals - lockedDeals,
          },
          claims: {
            total: totalClaims,
            pending: pendingClaims,
            approved: approvedClaims,
            rejected: rejectedClaims,
            approvalRate: totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(2) : 0,
          },
        },
      });
    } catch (error: any) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard stats',
      });
    }
  }

  /**
   * Get KYC Verification Requests
   */
  static async getKYCRequests(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { skip } = getPagination(page, limit);
      const status = req.query.status as string || 'pending';

      const kycRequests = await User.find({ kycStatus: status })
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments({ kycStatus: status });

      res.json({
        success: true,
        message: 'KYC requests retrieved',
        data: {
          requests: kycRequests,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Get KYC requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve KYC requests',
      });
    }
  }

  /**
   * Approve KYC
   */
  static async approveKYC(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const adminId = req.userId;

      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const previousStatus = user.kycStatus;

      // ✨ Use KYC service to approve
      try {
        await KYCService.approveKYC(userId);
      } catch (kycError: any) {
        console.error('KYC approval error:', kycError.message);
        throw new CustomError(kycError.message, 400);
      }

      // Log admin action
      const adminAction = new AdminAction({
        adminId,
        action: 'approve-kyc',
        actionType: 'KYC Approval',
        resourceType: 'user',
        resourceId: userId,
        changesBefore: { kycStatus: previousStatus },
        changesAfter: { kycStatus: 'approved', isCompanyVerified: true },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('user-agent') || 'Unknown',
      });
      await adminAction.save();

      const updatedUser = await User.findById(userId);

      res.json({
        success: true,
        message: 'KYC approved successfully',
        user: {
          _id: updatedUser?._id,
          email: updatedUser?.email,
          companyName: updatedUser?.companyName,
          kycStatus: updatedUser?.kycStatus,
        },
      });
    } catch (error: any) {
      console.error('Approve KYC error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to approve KYC',
        });
      }
    }
  }

  /**
   * Reject KYC
   */
  static async rejectKYC(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { rejectionReason } = req.body;
      const adminId = req.userId;

      if (!rejectionReason) {
        throw new CustomError('Rejection reason is required', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const previousStatus = user.kycStatus;

      // ✨ Use KYC service to reject
      try {
        await KYCService.rejectKYC(userId, rejectionReason);
      } catch (kycError: any) {
        console.error('KYC rejection error:', kycError.message);
        throw new CustomError(kycError.message, 400);
      }

      // Log admin action
      const adminAction = new AdminAction({
        adminId,
        action: 'reject-kyc',
        actionType: 'KYC Rejection',
        resourceType: 'user',
        resourceId: userId,
        changesBefore: { kycStatus: previousStatus },
        changesAfter: { kycStatus: 'rejected', rejectionReason },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('user-agent') || 'Unknown',
      });
      await adminAction.save();

      const updatedUser = await User.findById(userId);

      res.json({
        success: true,
        message: 'KYC rejected',
        user: {
          _id: updatedUser?._id,
          email: updatedUser?.email,
          kycStatus: updatedUser?.kycStatus,
          rejectionReason: updatedUser?.kycRejectionReason,
        },
      });
    } catch (error: any) {
      console.error('Reject KYC error:', error);
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to reject KYC',
        });
      }
    }
  }

  /**
   * Get All Claims (Admin View)
   */
  static async getAllClaims(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { skip } = getPagination(page, limit);
      const status = req.query.status as string;

      const filter = status ? { status } : {};

      const claims = await Claim.find(filter)
        .populate('userId', 'email firstName lastName')
        .populate('dealId', 'title category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Claim.countDocuments(filter);

      res.json({
        success: true,
        message: 'All claims retrieved',
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
      console.error('Get all claims error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve claims',
      });
    }
  }

  /**
   * Get Analytics Dashboard
   */
  static async getAnalytics(_req: IRequestWithUser, res: Response): Promise<void> {
    try {
      // User analytics
      const usersByMonth = await User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      // Deal analytics
      const dealsByCategory = await Deal.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgDiscount: { $avg: '$discountPercentage' },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Claim analytics
      const claimsByMonth = await Claim.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            approved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'approved'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      // Top deals by claims
      const topDealsByClaims = await Deal.find()
        .sort({ currentClaims: -1 })
        .limit(5)
        .select('title currentClaims totalClaimsAllowed category');

      res.json({
        success: true,
        message: 'Analytics retrieved',
        analytics: {
          usersByMonth,
          dealsByCategory,
          claimsByMonth,
          topDealsByClaims,
        },
      });
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
      });
    }
  }

  /**
   * Get Admin Activity Log
   */
  static async getActivityLog(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { skip } = getPagination(page, limit);

      const logs = await AdminAction.find()
        .populate('adminId', 'email firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await AdminAction.countDocuments();

      res.json({
        success: true,
        message: 'Activity log retrieved',
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Get activity log error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve activity log',
      });
    }
  }

  /**
   * Seed Sample Deals
   */
  static async seedDeals(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const sampleDeals = [
        {
          title: 'AWS Credits for Startups',
          slug: 'aws-credits-startups',
          description: 'Get $5,000 in AWS credits for your startup. Valid for 2 years.',
          shortDescription: '$5,000 AWS Credits',
          originalPrice: 5000,
          discountedPrice: 0,
          currency: 'USD',
          category: 'Cloud',
          saasTool: 'AWS',
          dealDuration: '2 Years',
          partnerName: 'Amazon Web Services',
          partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
          partnerWebsite: 'https://aws.amazon.com',
          partnerDescription: 'Amazon Web Services (AWS) is the world\'s most comprehensive and broadly adopted cloud platform.',
          dealImage: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
          eligibilityConditions: {
            requiresEmailVerification: true,
            requiresKYCApproval: true,
            allowedFundingStages: ['Seed', 'Series A'],
          },
          highlights: ['No credit card required', 'Instant activation'],
          tags: ['cloud', 'hosting', 'infrastructure'],
        },
        {
          title: 'HubSpot for Startups',
          slug: 'hubspot-for-startups',
          description: 'Get 90% off HubSpot for the first year.',
          shortDescription: '90% off HubSpot',
          originalPrice: 10000,
          discountedPrice: 1000,
          currency: 'USD',
          category: 'Marketing',
          saasTool: 'HubSpot',
          dealDuration: '1 Year',
          partnerName: 'HubSpot',
          partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/15/HubSpot_Logo.png',
          partnerWebsite: 'https://www.hubspot.com',
          partnerDescription: 'HubSpot is a leading CRM platform that provides software and support to help companies grow better.',
          dealImage: 'https://upload.wikimedia.org/wikipedia/commons/1/15/HubSpot_Logo.png',
          eligibilityConditions: {
            requiresEmailVerification: true,
            minEmployees: 2,
            maxEmployees: 50,
          },
          highlights: ['CRM included', 'Marketing automation'],
          tags: ['crm', 'marketing', 'sales'],
        },
        {
          title: 'Slack for Teams',
          slug: 'slack-for-teams',
          description: 'Get 1 year of Slack Pro at 50% off.',
          shortDescription: '50% off Slack Pro',
          originalPrice: 8000,
          discountedPrice: 4000,
          currency: 'USD',
          category: 'Productivity',
          saasTool: 'Slack',
          dealDuration: '1 Year',
          partnerName: 'Slack',
          partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_icon.svg',
          partnerWebsite: 'https://www.slack.com',
          partnerDescription: 'Slack is a messaging app for teams.',
          dealImage: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_icon.svg',
          eligibilityConditions: {
            requiresEmailVerification: true,
            minEmployees: 3,
            maxEmployees: 100,
          },
          highlights: ['Unlimited history', 'Integrations support'],
          tags: ['communication', 'team', 'collaboration'],
        },
        {
          title: 'Github Copilot',
          slug: 'github-copilot',
          description: 'Get 6 months of Github Copilot free.',
          shortDescription: '6 months free GitHub Copilot',
          originalPrice: 180,
          discountedPrice: 0,
          currency: 'USD',
          category: 'Development',
          saasTool: 'GitHub Copilot',
          dealDuration: '6 Months',
          partnerName: 'GitHub',
          partnerLogo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          partnerWebsite: 'https://github.com/features/copilot',
          partnerDescription: 'GitHub Copilot is your AI pair programmer.',
          dealImage: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          eligibilityConditions: {
            requiresEmailVerification: true,
          },
          highlights: ['AI-powered coding', 'Works with VS Code'],
          tags: ['development', 'ai', 'coding'],
        },
      ];

      // Clear existing deals
      await Deal.deleteMany({});

      // Add createdBy to each deal
      const dealsWithCreator = sampleDeals.map(deal => ({
        ...deal,
        createdBy: req.userId,
      }));

      const createdDeals = await Deal.insertMany(dealsWithCreator);

      res.json({
        success: true,
        message: `Successfully seeded ${createdDeals.length} deals`,
        data: {
          dealsCreated: createdDeals.length,
          deals: createdDeals,
        },
      });
    } catch (error: any) {
      console.error('Seed deals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed deals',
      });
    }
  }
}
