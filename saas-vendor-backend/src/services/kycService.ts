import { User } from '../models/User';
import { EmailService } from './emailService';

/**
 * KYC Service
 * Handles company verification and KYC document management
 */
export class KYCService {
  /**
   * Submit KYC for verification
   */
  static async submitKYC(
    userId: string,
    companyName: string,
    companyWebsite: string,
    companyEmail: string,
    fundingStage: string,
    employees: number,
    country: string,
    kycDocumentPath: string
  ): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update KYC information
      user.companyName = companyName;
      user.companyWebsite = companyWebsite;
      user.companyEmail = companyEmail;
      user.fundingStage = fundingStage as 'pre-seed' | 'seed' | 'series-a' | 'series-b+';
      user.employees = employees;
      user.country = country;
      user.kycDocumentPath = kycDocumentPath;
      user.kycStatus = 'pending';

      await user.save();

      console.log(`✅ KYC submitted for user ${userId} (${companyName})`);

      return {
        userId: user._id,
        companyName: user.companyName,
        kycStatus: user.kycStatus,
        submittedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Error submitting KYC:', error.message);
      throw new Error(`Failed to submit KYC: ${error.message}`);
    }
  }

  /**
   * Approve KYC
   */
  static async approveKYC(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.kycStatus === 'approved') {
        throw new Error('KYC already approved');
      }

      // Update KYC status
      user.isCompanyVerified = true;
      user.kycStatus = 'approved';
      await user.save();

      // Send approval email
      try {
        await EmailService.sendKYCApprovalEmail(user.email, user.companyName || 'Your Company');
      } catch (emailError) {
        console.warn('⚠️  Failed to send KYC approval email:', emailError);
        // Don't throw - KYC approval succeeded even if email failed
      }

      console.log(`✅ KYC approved for user ${userId}`);

      return {
        userId: user._id,
        email: user.email,
        companyName: user.companyName,
        kycStatus: user.kycStatus,
        approvedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Error approving KYC:', error.message);
      throw new Error(`Failed to approve KYC: ${error.message}`);
    }
  }

  /**
   * Reject KYC with reason
   */
  static async rejectKYC(userId: string, rejectionReason: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.kycStatus === 'rejected') {
        throw new Error('KYC already rejected');
      }

      // Update KYC status
      user.kycStatus = 'rejected';
      user.kycRejectionReason = rejectionReason;
      await user.save();

      // Send rejection email
      try {
        await EmailService.sendKYCRejectionEmail(
          user.email,
          user.companyName || 'Your Company',
          rejectionReason
        );
      } catch (emailError) {
        console.warn('⚠️  Failed to send KYC rejection email:', emailError);
        // Don't throw - KYC rejection succeeded even if email failed
      }

      console.log(`✅ KYC rejected for user ${userId}`);

      return {
        userId: user._id,
        email: user.email,
        companyName: user.companyName,
        kycStatus: user.kycStatus,
        rejectionReason: user.kycRejectionReason,
        rejectedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Error rejecting KYC:', error.message);
      throw new Error(`Failed to reject KYC: ${error.message}`);
    }
  }

  /**
   * Get KYC status
   */
  static async getKYCStatus(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId).select(
        'companyName companyWebsite companyEmail fundingStage employees country kycStatus kycRejectionReason kycDocumentPath'
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user._id,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companyEmail: user.companyEmail,
        fundingStage: user.fundingStage,
        employees: user.employees,
        country: user.country,
        kycStatus: user.kycStatus,
        rejectionReason: user.kycRejectionReason,
        documentPath: user.kycDocumentPath,
      };
    } catch (error: any) {
      console.error('❌ Error getting KYC status:', error.message);
      throw new Error(`Failed to get KYC status: ${error.message}`);
    }
  }

  /**
   * Validate KYC information
   */
  static validateKYCData(
    companyName: string,
    fundingStage: string,
    employees: number,
    country: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate company name
    if (!companyName || companyName.trim().length < 2) {
      errors.push('Company name must be at least 2 characters');
    }

    // Validate funding stage
    const validFundingStages = ['pre-seed', 'seed', 'series-a', 'series-b+'];
    if (!fundingStage || !validFundingStages.includes(fundingStage)) {
      errors.push('Invalid funding stage');
    }

    // Validate employee count
    if (employees < 1) {
      errors.push('Employee count must be at least 1');
    }

    if (employees > 999999) {
      errors.push('Employee count exceeds maximum allowed');
    }

    // Validate country
    if (!country || country.trim().length < 2) {
      errors.push('Country must be specified');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all pending KYC requests (admin only)
   */
  static async getPendingKYCRequests(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const pendingUsers = await User.find({ kycStatus: 'pending' })
        .select('-password -claimedDeals -claimsHistory')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments({ kycStatus: 'pending' });

      return {
        requests: pendingUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error('❌ Error getting pending KYC requests:', error.message);
      throw new Error(`Failed to get pending KYC requests: ${error.message}`);
    }
  }

  /**
   * Get KYC statistics
   */
  static async getKYCStats(): Promise<any> {
    try {
      const total = await User.countDocuments();
      const pending = await User.countDocuments({ kycStatus: 'pending' });
      const approved = await User.countDocuments({ kycStatus: 'approved' });
      const rejected = await User.countDocuments({ kycStatus: 'rejected' });

      const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(2) : '0';
      const averageProcessingTime = await this.calculateAverageProcessingTime();

      return {
        total,
        pending,
        approved,
        rejected,
        approvalRate: `${approvalRate}%`,
        averageProcessingTime,
      };
    } catch (error: any) {
      console.error('❌ Error getting KYC statistics:', error.message);
      throw new Error(`Failed to get KYC statistics: ${error.message}`);
    }
  }

  /**
   * Calculate average KYC processing time
   */
  private static async calculateAverageProcessingTime(): Promise<string> {
    try {
      // This would require timestamps for when KYC was submitted vs approved
      // For now, returning a placeholder
      return 'N/A (requires additional tracking)';
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Resend KYC rejection notification
   */
  static async resendRejectionNotification(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.kycStatus !== 'rejected') {
        throw new Error('KYC is not in rejected status');
      }

      await EmailService.sendKYCRejectionEmail(
        user.email,
        user.companyName || 'Your Company',
        user.kycRejectionReason || 'Documents do not meet requirements'
      );

      console.log(`✅ KYC rejection notification resent to ${user.email}`);
    } catch (error: any) {
      console.error('❌ Error resending rejection notification:', error.message);
      throw new Error(`Failed to resend notification: ${error.message}`);
    }
  }

  /**
   * Resend KYC approval notification
   */
  static async resendApprovalNotification(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.kycStatus !== 'approved') {
        throw new Error('KYC is not in approved status');
      }

      await EmailService.sendKYCApprovalEmail(
        user.email,
        user.companyName || 'Your Company'
      );

      console.log(`✅ KYC approval notification resent to ${user.email}`);
    } catch (error: any) {
      console.error('❌ Error resending approval notification:', error.message);
      throw new Error(`Failed to resend notification: ${error.message}`);
    }
  }
}
