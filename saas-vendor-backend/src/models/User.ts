import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/index';

// 1. Resolve the _id conflict by omitting it from the base interface
interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isCompanyVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    
    companyName: String,
    companyWebsite: String,
    companyEmail: String,
    fundingStage: {
      type: String,
      enum: {
        values: ['pre-seed', 'seed', 'series-a', 'series-b+'],
        message: 'fundingStage must be one of: pre-seed, seed, series-a, series-b+',
      },
      default: undefined,
    },
    employees: Number,
    country: String,
    kycDocumentPath: String,
    kycStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    kycRejectionReason: String,
    
    phoneNumber: String,
    profileImage: String,
    bio: String,
    
    // 2. Use 'as any' to allow mapping ObjectId arrays to string arrays in your type
    claimedDeals: [
      {
        type: Schema.Types.ObjectId as any,
        ref: 'Claim',
      },
    ],
    claimsHistory: [
      {
        type: Schema.Types.ObjectId as any,
        ref: 'Claim',
      },
    ],
    
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    preferredCategories: [String],
    
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    
    lastLogin: Date,
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

userSchema.index({ email: 1 });
userSchema.index({ kycStatus: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);