/**
 * API TypeScript Types - SAAS Vendor Frontend
 * Auto-generated types for all backend endpoints
 * Use these in your frontend for type safety
 */

// ============= AUTH TYPES =============

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
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
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ============= USER TYPES =============

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: 'user' | 'admin' | 'vendor';
  kycStatus?: 'pending' | 'approved' | 'rejected';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetProfileResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface UploadProfilePictureRequest {
  file: File;
}

export interface UploadProfilePictureResponse {
  message: string;
  data: {
    user: User;
    profilePictureUrl: string;
  };
}

// ============= DEAL TYPES =============

export interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  dealImage?: string;
  dealDetails: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  claimsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetDealsResponse {
  message: string;
  data: {
    deals: Deal[];
    total: number;
    page?: number;
    limit?: number;
  };
}

export interface GetDealDetailResponse {
  message: string;
  data: {
    deal: Deal;
  };
}

export interface CreateDealRequest {
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  dealDetails: string;
  dealImage?: File;
}

export interface CreateDealResponse {
  message: string;
  data: {
    deal: Deal;
  };
}

export interface UpdateDealRequest {
  title?: string;
  description?: string;
  category?: string;
  originalPrice?: number;
  discountedPrice?: number;
  dealDetails?: string;
  dealImage?: File;
}

export interface UpdateDealResponse {
  message: string;
  data: {
    deal: Deal;
  };
}

export interface ApproveDealRequest {
  dealId: string;
}

export interface ApproveDealResponse {
  message: string;
  data: {
    deal: Deal;
  };
}

// ============= CLAIM TYPES =============

export interface Claim {
  id: string;
  userId: string;
  dealId: string;
  dealTitle?: string;
  vendorName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  expiryDate?: string;
}

export interface CreateClaimRequest {
  dealId: string;
}

export interface CreateClaimResponse {
  message: string;
  data: {
    claim: Claim;
  };
}

export interface GetClaimsResponse {
  message: string;
  data: {
    claims: Claim[];
    total: number;
    page?: number;
    limit?: number;
  };
}

export interface ApproveClaimRequest {
  claimId: string;
}

export interface ApproveClaimResponse {
  message: string;
  data: {
    claim: Claim;
  };
}

export interface RejectClaimRequest {
  claimId: string;
  reason?: string;
}

export interface RejectClaimResponse {
  message: string;
  data: {
    claim: Claim;
  };
}

// ============= ADMIN TYPES =============

export interface KYCVerification {
  id: string;
  userId: string;
  documentType: string;
  documentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveKYCRequest {
  userId: string;
}

export interface ApproveKYCResponse {
  message: string;
  data: {
    kyc: KYCVerification;
  };
}

export interface RejectKYCRequest {
  userId: string;
  reason: string;
}

export interface RejectKYCResponse {
  message: string;
  data: {
    kyc: KYCVerification;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalDeals: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  pendingKYC: number;
  approvedKYC: number;
  totalRevenue?: number;
}

export interface GetAdminStatsResponse {
  message: string;
  data: {
    stats: AdminStats;
  };
}

export interface GetUsersResponse {
  message: string;
  data: {
    users: User[];
    total: number;
    page?: number;
    limit?: number;
  };
}

// ============= HEALTH CHECK =============

export interface HealthResponse {
  message: string;
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime?: number;
}

// ============= ERROR TYPES =============

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface ValidationError extends ApiError {
  errors: Record<string, string[]>;
}

// ============= API CLIENT TYPES =============

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============= FILTER & SORT TYPES =============

export interface DealFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ClaimFilters {
  status?: 'pending' | 'approved' | 'rejected';
  dealId?: string;
}

// ============= STORE TYPES =============

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface DealsState {
  deals: Deal[];
  currentDeal: Deal | null;
  isLoading: boolean;
  error: string | null;
  filters: DealFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ClaimsState {
  claims: Claim[];
  isLoading: boolean;
  error: string | null;
  filters: ClaimFilters;
}

export interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
}

// ============= REQUEST/RESPONSE HELPERS =============

/**
 * Helper type to extract response data type
 * Usage: ResponseData<GetDealsResponse> = Deal[]
 */
export type ResponseData<T> = T extends ApiResponse<infer D> ? D : never;

/**
 * Helper for pagination
 */
export const createPaginationParams = (page: number = 1, limit: number = 10) => ({
  page,
  limit,
  offset: (page - 1) * limit,
});

/**
 * Helper to check if response is an error
 */
export const isApiError = (response: any): response is ApiError => {
  return response && typeof response.statusCode === 'number' && response.statusCode >= 400;
};

/**
 * Helper to build query string for API calls
 */
export const buildQueryString = (filters: Record<string, any>): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

// ============= CONSTANTS =============

export const DEAL_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const CLAIM_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const KYC_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  VENDOR: 'vendor',
} as const;

export const DEAL_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Food & Dining',
  'Travel',
  'Entertainment',
  'Health & Beauty',
  'Home & Garden',
  'Sports',
  'Education',
  'Other',
] as const;
