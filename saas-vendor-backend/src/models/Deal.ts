import mongoose, { Schema, Document } from 'mongoose';
import { IDeal } from '../types/index';

// 1. Resolve _id conflict using Omit
interface IDealDocument extends Omit<IDeal, '_id'>, Document {}

const dealSchema = new Schema<IDealDocument>(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [150, 'Short description must not exceed 150 characters'],
    },
    
    // Pricing
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Discounted price is required'],
    },
    discountPercentage: {
      type: Number,
      // 2. Fix 'this' context by explicitly typing it
      default: function (this: IDealDocument) {
        if (!this.originalPrice) return 0;
        return Math.round(((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100);
      },
    },
    currency: {
      type: String,
      default: 'USD',
    },
    
    // Details
    category: {
      type: String,
      enum: ['Cloud', 'Marketing', 'Analytics', 'Productivity', 'Finance', 'Design'],
      required: [true, 'Category is required'],
    },
    saasTool: {
      type: String,
      required: [true, 'SaaS tool name is required'],
    },
    dealDuration: {
      type: String,
      required: [true, 'Deal duration is required'],
    },
    validTill: Date,
    
    // Partner Info
    partnerName: { type: String, required: [true, 'Partner name is required'] },
    partnerLogo: { type: String, required: [true, 'Partner logo is required'] },
    partnerWebsite: { type: String, required: [true, 'Partner website is required'] },
    partnerDescription: String,
    
    // Access Control
    isLocked: { type: Boolean, default: false },
    lockReason: String,
    eligibilityConditions: {
      requiresEmailVerification: { type: Boolean, default: false },
      requiresKYCApproval: { type: Boolean, default: false },
      minEmployees: Number,
      maxEmployees: Number,
      allowedFundingStages: [String],
      allowedCountries: [String],
      description: String,
    },
    
    // Images
    dealImage: { type: String, required: [true, 'Deal image is required'] },
    galleryImages: [String],
    demoVideoUrl: String,
    
    // Tracking
    totalClaimsAllowed: Number,
    currentClaims: { type: Number, default: 0 },
    claimsList: [
      {
        type: Schema.Types.ObjectId as any,
        ref: 'Claim',
      },
    ],
    
    // SEO
    tags: [String],
    highlights: [String],
    
    // Metadata
    createdBy: {
      // 3. Cast to any to resolve String vs ObjectId mismatch
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'deals',
  }
);

// Indexes
dealSchema.index({ slug: 1 });
dealSchema.index({ category: 1 });
dealSchema.index({ isLocked: 1 });
dealSchema.index({ createdAt: -1 });
dealSchema.index({ saasTool: 1 });

export const Deal = mongoose.model<IDealDocument>('Deal', dealSchema);