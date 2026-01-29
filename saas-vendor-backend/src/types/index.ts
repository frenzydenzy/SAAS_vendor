// Import Express types
import { Request } from 'express';

// User Types
export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isCompanyVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  
  // Company/KYC Information
  companyName?: string;
  companyWebsite?: string;
  companyEmail?: string;
  fundingStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b+';
  employees?: number;
  country?: string;
  kycDocumentPath?: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  kycRejectionReason?: string;
  
  // Profile
  phoneNumber?: string;
  profileImage?: string;
  bio?: string;
  
  // Claimed Deals
  claimedDeals: string[];
  claimsHistory: string[];
  
  // Preferences
  emailNotifications: boolean;
  preferredCategories: string[];
  
  // Role
  role: 'user' | 'admin';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Deal Types
export interface IDeal {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  
  // Pricing
  originalPrice: number;
  discountedPrice: number;
  discountPercentage?: number;
  currency: string;
  
  // Details
  category: 'Cloud' | 'Marketing' | 'Analytics' | 'Productivity' | 'Finance' | 'Design';
  saasTool: string;
  dealDuration: string;
  validTill?: Date;
  
  // Partner Info
  partnerName: string;
  partnerLogo: string;
  partnerWebsite: string;
  partnerDescription?: string;
  
  // Access Control
  isLocked: boolean;
  lockReason?: string;
  eligibilityConditions?: {
    requiresEmailVerification: boolean;
    requiresKYCApproval: boolean;
    minEmployees?: number;
    maxEmployees?: number;
    allowedFundingStages?: string[];
    allowedCountries?: string[];
    description: string;
  };
  
  // Images
  dealImage: string;
  galleryImages?: string[];
  demoVideoUrl?: string;
  
  // Tracking
  totalClaimsAllowed?: number;
  currentClaims: number;
  claimsList: string[];
  
  // SEO
  tags: string[];
  highlights: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Claim Types
export interface IClaim {
  userId: string;
  dealId: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  
  // Timestamps
  claimedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  expiresAt?: Date;
  rejectionReason?: string;
  
  // Codes
  claimCode: string;
  claimToken: string;
  
  // Tracking
  isRedeemed: boolean;
  redeemedAt?: Date;
  redeemedUrl?: string;
  
  // Notes
  adminNotes?: string;
  userNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// AdminAction Types
export interface IAdminAction {
  _id?: string;
  adminId: string;
  action: 'create-deal' | 'update-deal' | 'delete-deal' | 'approve-kyc' | 'reject-kyc' | 'approve-claim' | 'reject-claim';
  actionType: string;
  
  resourceType: 'deal' | 'user' | 'claim';
  resourceId: string;
  
  changesBefore?: any;
  changesAfter: any;
  
  ipAddress: string;
  userAgent: string;
  
  createdAt: Date;
}

// Auth Response Types
export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: Partial<IUser>;
  token?: string;
  refreshToken?: string;
}

// Error Response Type
export interface IErrorResponse {
  success: false;
  message: string;
  errors?: any;
  statusCode: number;
}

// JWT Payload Type
export interface IJWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// Request with User Type (extends Express Request)
export interface IRequestWithUser extends Omit<Request, 'ip'> {
  userId?: string;
  email?: string;
  user?: IJWTPayload;
  body: any;
  query: any;
  params: any;
  ip?: string;
}

// Request with User Type
export interface IRequestWithUser {
  cookies: any;
  user?: IJWTPayload;
  userId?: string;
}
