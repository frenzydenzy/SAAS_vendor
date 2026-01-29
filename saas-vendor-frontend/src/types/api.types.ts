// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface ProfilePictureUploadResponse {
  message: string;
  profilePicture: string;
  user: User;
}

// Deal Types
export interface Deal {
  _id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  discountedPrice: number;
  category: string;
  image: string;
  status: 'active' | 'inactive' | 'approved';
  vendorId: string;
  vendorName: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealRequest {
  title: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  image: string;
  expiresAt: string;
}

export interface CreateDealResponse {
  message: string;
  deal: Deal;
}

export interface UpdateDealRequest {
  title?: string;
  description?: string;
  price?: number;
  discount?: number;
  category?: string;
  image?: string;
  expiresAt?: string;
}

export interface UpdateDealResponse {
  message: string;
  deal: Deal;
}

export interface ApproveDealRequest {
  dealId: string;
}

export interface ApproveDealResponse {
  message: string;
  deal: Deal;
}

export interface DealsListResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
}

export interface DealDetailResponse {
  deal: Deal;
}

// Claim Types
export interface Claim {
  _id: string;
  dealId: string;
  userId: string;
  userName: string;
  userEmail: string;
  dealTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimRequest {
  dealId: string;
}

export interface CreateClaimResponse {
  message: string;
  claim: Claim;
}

export interface ApprovClaimRequest {
  claimId: string;
}

export interface ApproveClaimResponse {
  message: string;
  claim: Claim;
}

export interface RejectClaimRequest {
  claimId: string;
}

export interface RejectClaimResponse {
  message: string;
  claim: Claim;
}

export interface ClaimsListResponse {
  claims: Claim[];
  total: number;
}

export interface UserClaimsListResponse {
  claims: Claim[];
  total: number;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalDeals: number;
  totalClaims: number;
  pendingKYC: number;
  approvedKYC: number;
  rejectedKYC: number;
}

export interface AdminStatsResponse {
  stats: AdminStats;
}

export interface ApproveKYCRequest {
  userId: string;
}

export interface ApproveKYCResponse {
  message: string;
  user: User;
}

export interface RejectKYCRequest {
  userId: string;
}

export interface RejectKYCResponse {
  message: string;
  user: User;
}

// Error Response
export interface ApiError {
  message: string;
  status: number;
  error?: string;
}

// File Upload
export interface FileUploadResponse {
  url: string;
  fileName: string;
}
