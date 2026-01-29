import sgMail from '@sendgrid/mail';
import config from '../config/environment';

/**
 * Email Service using SendGrid
 * Handles all email communications
 */
export class EmailService {
  private static initialized = false;

  /**
   * Initialize SendGrid with API key
   */
  static initialize(): void {
    if (this.initialized) return;

    if (!config.sendgridApiKey) {
      console.warn('⚠️  SendGrid API key not configured. Email service will be unavailable.');
      return;
    }

    sgMail.setApiKey(config.sendgridApiKey);
    this.initialized = true;
    console.log('✅ SendGrid initialized');
  }

  /**
   * Send email verification email
   */
  static async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationLink: string
  ): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.sendgridApiKey) throw new Error('SendGrid API key not configured');

      const msg: any = {
        to: email,
        from: config.senderEmail,
        subject: 'Verify Your Email - SAAS Vendor',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to SAAS Vendor, ${firstName}!</h2>
            <p>Please verify your email address to activate your account.</p>
            <p>
              <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Verify Email
              </a>
            </p>
            <p style="color: #666; font-size: 12px;">
              If the button doesn't work, copy this link: ${verificationLink}
            </p>
            <p style="color: #999; font-size: 12px;">
              This link expires in 24 hours.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending verification email:', error.message);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetLink: string
  ): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.sendgridApiKey) throw new Error('SendGrid API key not configured');

      const msg: any = {
        to: email,
        from: config.senderEmail,
        subject: 'Reset Your Password - SAAS Vendor',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your password. Click the link below to proceed:</p>
            <p>
              <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p style="color: #666; font-size: 12px;">
              If the button doesn't work, copy this link: ${resetLink}
            </p>
            <p style="color: #999; font-size: 12px;">
              This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending password reset email:', error.message);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Send KYC approval email
   */
  static async sendKYCApprovalEmail(
    email: string,
    companyName: string
  ): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.sendgridApiKey) throw new Error('SendGrid API key not configured');

      const msg: any = {
        to: email,
        from: config.senderEmail,
        subject: 'Your Company Verification (KYC) Has Been Approved ✅',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Great News! Your KYC Has Been Approved</h2>
            <p>Hi,</p>
            <p>We're pleased to inform you that <strong>${companyName}</strong> has passed our verification process (KYC).</p>
            <p>You now have access to all exclusive deals and premium features!</p>
            <p>
              <a href="https://saasvndor.com/dashboard" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Available Deals
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Start claiming deals and get exclusive discounts on premium SaaS tools.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ KYC approval email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending KYC approval email:', error.message);
      throw new Error(`Failed to send KYC approval email: ${error.message}`);
    }
  }

  /**
   * Send KYC rejection email
   */
  static async sendKYCRejectionEmail(
    email: string,
    companyName: string,
    rejectionReason: string
  ): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.sendgridApiKey) throw new Error('SendGrid API key not configured');

      const msg: any = {
        to: email,
        from: config.senderEmail,
        subject: 'Your Company Verification (KYC) - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your KYC Review - Action Required</h2>
            <p>Hi,</p>
            <p>We reviewed the verification documents for <strong>${companyName}</strong> and need more information.</p>
            <h3>Reason:</h3>
            <p style="background-color: #f5f5f5; padding: 12px; border-left: 4px solid #dc3545;">
              ${rejectionReason}
            </p>
            <p>Please resubmit your documents addressing the above concern.</p>
            <p>
              <a href="https://saasvndor.com/kyc" style="background-color: #ffc107; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Resubmit Documents
              </a>
            </p>
            <p style="color: #666; font-size: 12px;">
              If you have questions, please contact our support team.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ KYC rejection email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending KYC rejection email:', error.message);
      throw new Error(`Failed to send KYC rejection email: ${error.message}`);
    }
  }

  /**
   * Send claim approval email
   */
  static async sendClaimApprovalEmail(
    email: string,
    dealTitle: string,
    claimCode: string
  ): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.sendgridApiKey) throw new Error('SendGrid API key not configured');

      const msg: any = {
        to: email,
        from: config.senderEmail,
        subject: `Your Deal Claim Approved: ${dealTitle} ✅`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Deal Claim Has Been Approved!</h2>
            <p>Congratulations! Your claim for <strong>${dealTitle}</strong> has been approved.</p>
            <h3>Your Claim Code:</h3>
            <p style="background-color: #f5f5f5; padding: 16px; font-size: 18px; font-weight: bold; text-align: center; border-radius: 4px; letter-spacing: 2px;">
              ${claimCode}
            </p>
            <p style="color: #666;">Save this code - you'll need it to redeem your deal.</p>
            <p>
              <a href="https://saasvndor.com/my-deals" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Your Claims
              </a>
            </p>
            <p style="color: #999; font-size: 12px;">
              This claim expires in 30 days. Make sure to redeem it within that time.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Claim approval email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending claim approval email:', error.message);
      throw new Error(`Failed to send claim approval email: ${error.message}`);
    }
  }

  /**
   * Send claim rejection email
   */
  static async sendClaimRejectionEmail(
    email: string,
    dealTitle: string,
    rejectionReason: string
  ): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.sendgridApiKey) throw new Error('SendGrid API key not configured');

      const msg: any = {
        to: email,
        from: config.senderEmail,
        subject: `Claim Status Update: ${dealTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Deal Claim - Update</h2>
            <p>Hi,</p>
            <p>We've reviewed your claim for <strong>${dealTitle}</strong>.</p>
            <h3>Reason:</h3>
            <p style="background-color: #f5f5f5; padding: 12px; border-left: 4px solid #dc3545;">
              ${rejectionReason}
            </p>
            <p>Don't worry! You can claim other deals or try again later.</p>
            <p>
              <a href="https://saasvndor.com/deals" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Browse Other Deals
              </a>
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Claim rejection email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending claim rejection email:', error.message);
      throw new Error(`Failed to send claim rejection email: ${error.message}`);
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string
  ): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.sendgridApiKey) throw new Error('SendGrid API key not configured');

      const msg: any = {
        to: email,
        from: config.senderEmail,
        subject: 'Welcome to SAAS Vendor! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome, ${firstName}!</h2>
            <p>We're excited to have you join SAAS Vendor, your exclusive gateway to premium SaaS discounts.</p>
            <h3>What You Can Do:</h3>
            <ul style="line-height: 1.8;">
              <li>Browse exclusive deals on premium SaaS tools</li>
              <li>Claim deals and get incredible discounts</li>
              <li>Verify your company for priority deals</li>
              <li>Access your deal history and status</li>
            </ul>
            <p>
              <a href="https://saasvndor.com/deals" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Start Exploring Deals
              </a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Questions? Contact us at support@saasvndor.com
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error.message);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }
}
