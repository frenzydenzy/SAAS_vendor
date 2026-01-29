# SAAS Vendor - Backend API

## 📋 Project Overview

Backend API for the SAAS Vendor platform - a SaaS deals marketplace for early-stage startups.

**Tech Stack:**
- Node.js 18+
- Express.js 4.x
- MongoDB Atlas
- JWT Authentication
- TypeScript

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm installed
- MongoDB Atlas account (free tier available)
- Cloudinary account for file uploads (optional)
- SendGrid account for emails (optional)

### 2. Setup Steps

#### Clone/Create Project
```bash
# Create backend folder
mkdir saas-vendor-backend
cd saas-vendor-backend
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
```bash
# Copy example env file
cp .env.example .env

# Edit .env and fill in your values
```

**Required Environment Variables:**
```env
# Server
NODE_ENV=development
PORT=8000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saas-vendor?retryWrites=true&w=majority

# JWT Secrets (Generate: https://randomkeygen.com/)
JWT_SECRET=<random-secret-at-least-32-chars>
JWT_REFRESH_SECRET=<random-secret-at-least-32-chars>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (SendGrid)
SENDGRID_API_KEY=<your-key>
SENDER_EMAIL=noreply@saasvndor.com

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=<your-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>

# Admin
ADMIN_EMAIL=admin@saasvndor.com
ADMIN_PASSWORD=Admin@123456
```

#### MongoDB Atlas Setup
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Add IP to whitelist (0.0.0.0/0 for development)
4. Create database user
5. Copy connection string
6. Paste into `MONGODB_URI` in .env

### 3. Run Development Server
```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════╗
║   SAAS VENDOR - Backend API                ║
║   Server running on port 8000              ║
║   Environment: development                 ║
╚════════════════════════════════════════════╝
```

### 4. Test API
Visit health check endpoint:
```
http://localhost:8000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-29T10:00:00.000Z"
}
```

---

## 📁 Project Structure

```
saas-vendor-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   └── environment.ts       # Environment variables
│   │
│   ├── models/
│   │   ├── User.ts              # User schema
│   │   ├── Deal.ts              # Deal schema
│   │   ├── Claim.ts             # Claim schema
│   │   └── AdminAction.ts       # Admin action schema
│   │
│   ├── controllers/
│   │   ├── authController.ts    # Auth logic
│   │   ├── userController.ts    # User logic (TODO)
│   │   ├── dealController.ts    # Deal logic (TODO)
│   │   ├── claimController.ts   # Claim logic (TODO)
│   │   └── adminController.ts   # Admin logic (TODO)
│   │
│   ├── routes/
│   │   ├── authRoutes.ts        # Auth endpoints
│   │   ├── userRoutes.ts        # User endpoints (TODO)
│   │   ├── dealRoutes.ts        # Deal endpoints (TODO)
│   │   ├── claimRoutes.ts       # Claim endpoints (TODO)
│   │   └── adminRoutes.ts       # Admin endpoints (TODO)
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts    # JWT verification
│   │   └── errorHandler.ts      # Error handling
│   │
│   ├── services/
│   │   ├── jwtService.ts        # JWT operations
│   │   ├── emailService.ts      # Email sending (TODO)
│   │   ├── uploadService.ts     # File uploads (TODO)
│   │   └── kycService.ts        # KYC verification (TODO)
│   │
│   ├── utils/
│   │   └── helpers.ts           # Helper functions
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   │
│   ├── seeds/
│   │   └── seedDeals.ts         # Demo data seeding (TODO)
│   │
│   └── app.ts                   # Main Express app
│
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

---

## 🔐 Authentication Flow

### Registration
```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Email Verification
```
POST /api/auth/verify-email
{
  "token": "email-verification-token"
}
```

### Login
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isEmailVerified": true,
    "isCompanyVerified": false
  }
}
```

**Cookies Set:**
- `accessToken` (httpOnly, 1 hour)
- `refreshToken` (httpOnly, 7 days)

### Refresh Token
```
POST /api/auth/refresh-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

### Logout
```
POST /api/auth/logout
(requires accessToken)
```

---

## 📚 Database Schema

### User Model
```typescript
{
  _id: ObjectId
  email: String (unique)
  password: String (hashed)
  firstName: String
  lastName: String
  isEmailVerified: Boolean
  isCompanyVerified: Boolean
  emailVerificationToken?: String
  emailVerificationTokenExpiry?: Date
  
  // Company/KYC
  companyName?: String
  companyWebsite?: String
  fundingStage?: enum('pre-seed', 'seed', 'series-a', 'series-b+')
  employees?: Number
  country?: String
  kycDocumentPath?: String
  kycStatus?: enum('pending', 'approved', 'rejected')
  
  // Profile
  profileImage?: String
  phoneNumber?: String
  bio?: String
  
  // Claims
  claimedDeals: [ObjectId] // References to Claims
  claimsHistory: [ObjectId]
  
  // Preferences
  emailNotifications: Boolean
  preferredCategories: [String]
  
  // Metadata
  role: enum('user', 'admin')
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Deal Model
```typescript
{
  _id: ObjectId
  title: String
  slug: String (unique)
  description: String
  shortDescription: String
  
  // Pricing
  originalPrice: Number
  discountedPrice: Number
  discountPercentage?: Number
  currency: String (default: 'USD')
  
  // Details
  category: enum('Cloud', 'Marketing', 'Analytics', 'Productivity', 'Finance', 'Design')
  saasTool: String
  dealDuration: String
  validTill?: Date
  
  // Partner
  partnerName: String
  partnerLogo: String
  partnerWebsite: String
  partnerDescription?: String
  
  // Access Control
  isLocked: Boolean
  lockReason?: String
  eligibilityConditions?: {
    requiresEmailVerification: Boolean
    requiresKYCApproval: Boolean
    minEmployees?: Number
    maxEmployees?: Number
    allowedFundingStages?: [String]
    allowedCountries?: [String]
    description: String
  }
  
  // Images
  dealImage: String
  galleryImages?: [String]
  demoVideoUrl?: String
  
  // Tracking
  totalClaimsAllowed?: Number
  currentClaims: Number
  claimsList: [ObjectId]
  
  // SEO
  tags: [String]
  highlights: [String]
  
  // Metadata
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

### Claim Model
```typescript
{
  _id: ObjectId
  userId: ObjectId
  dealId: ObjectId
  
  status: enum('pending', 'approved', 'rejected', 'expired')
  claimedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  expiresAt?: Date
  rejectionReason?: String
  
  claimCode: String (unique)
  claimToken: String (unique)
  
  isRedeemed: Boolean
  redeemedAt?: Date
  redeemedUrl?: String
  
  adminNotes?: String
  userNotes?: String
  
  createdAt: Date
  updatedAt: Date
}
```

---

## 🧪 Testing Endpoints

### Register Test
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login Test
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### Protected Route Test
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt
```

---

## 📝 Implementation Phases

### ✅ Phase 1: Backend Setup (COMPLETED)
- [x] Initialize Express.js + TypeScript
- [x] MongoDB connection setup
- [x] Models creation (User, Deal, Claim, AdminAction)
- [x] JWT service
- [x] Auth middleware
- [x] Auth controller (register, login, logout, refresh, verify email)
- [x] Auth routes

### ⏭️ Phase 2: User Management (NEXT)
- [ ] User controller (profile, update, KYC upload)
- [ ] User routes
- [ ] Email service integration
- [ ] Upload service integration

### ⏭️ Phase 3: Deal Management
- [ ] Deal controller (list, search, filter, create, update, delete)
- [ ] Deal routes
- [ ] Eligibility checker logic

### ⏭️ Phase 4: Claims System
- [ ] Claim controller (create, list, approve, reject)
- [ ] Claim routes
- [ ] Claim code generation

### ⏭️ Phase 5: Admin Features
- [ ] Admin controller (KYC approval, analytics)
- [ ] Admin routes
- [ ] Dashboard endpoints

### ⏭️ Phase 6: Demo Data Seeding
- [ ] Create 18 demo deals
- [ ] Create admin user
- [ ] Seed database

---

## 🛠️ Useful Commands

```bash
# Install dependencies
npm install

# Development mode (with auto-reload)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Seed demo data
npm run seed
```

---

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available options.

### MongoDB Atlas Setup
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create M0 Free cluster
4. Go to Database Access and create user
5. Go to Network Access and add your IP (0.0.0.0/0 for dev)
6. Get connection string and add to `.env`

### Email Service (SendGrid)
1. Create account at https://sendgrid.com
2. Generate API key
3. Add to `SENDGRID_API_KEY` in `.env`

### File Upload (Cloudinary)
1. Create account at https://cloudinary.com
2. Get Cloud Name, API Key, and API Secret
3. Add to `.env`

---

## 📦 Dependencies

### Production
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `jsonwebtoken`: JWT handling
- `bcryptjs`: Password hashing
- `cors`: Cross-origin support
- `dotenv`: Environment variables
- `helmet`: Security headers
- `morgan`: HTTP logging
- `express-validator`: Input validation
- `multer`: File uploads
- `cloudinary`: Image hosting
- `nodemailer`: Email sending

### Development
- `typescript`: Type checking
- `ts-node`: TypeScript execution
- `tsx`: Watch mode execution
- Type definitions for all packages

---

## 🚨 Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {} // Optional detailed errors
}
```

### Common Error Codes
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication failed)
- `403`: Forbidden (authorization failed)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

---

## 🔒 Security Features

✅ Password hashing with bcryptjs (10 salt rounds)
✅ JWT tokens with 1-hour expiration
✅ httpOnly cookies (XSS protection)
✅ SameSite cookie attribute (CSRF protection)
✅ CORS configured
✅ Helmet security headers
✅ Input validation
✅ MongoDB injection prevention (Mongoose)
✅ Rate limiting (ready)

---

## 📞 Support

For issues or questions:
1. Check error logs in terminal
2. Verify `.env` configuration
3. Test database connection
4. Review API responses

---

## 📅 Next Steps

1. ✅ Backend setup complete
2. ⏭️ Complete remaining controllers (users, deals, claims, admin)
3. ⏭️ Integrate email and upload services
4. ⏭️ Create seed script with 18 demo deals
5. ⏭️ Start frontend development

---

**Backend Setup Status**: ✅ READY FOR DEVELOPMENT

Last Updated: January 29, 2026
