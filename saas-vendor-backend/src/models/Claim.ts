import mongoose, { Schema, Document } from 'mongoose';
import { IClaim } from '../types/index';

// Keeping your Document interface
interface IClaimDocument extends IClaim, Document {
  _id: mongoose.Types.ObjectId;
}

const claimSchema = new Schema<IClaimDocument>(
  {
    userId: {
      // Add 'as any' here to bridge String vs ObjectId
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    dealId: {
      // Add 'as any' here as well
      type: Schema.Types.ObjectId as any,
      ref: 'Deal',
      required: [true, 'Deal ID is required'],
    },
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
    },
    
    approvedAt: Date,
    rejectedAt: Date,
    expiresAt: Date,
    rejectionReason: String,
    
    claimCode: {
      type: String,
      required: [true, 'Claim code is required'],
      unique: true,
    },
    claimToken: {
      type: String,
      required: [true, 'Claim token is required'],
      unique: true,
    },
    
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: Date,
    redeemedUrl: String,
    
    adminNotes: String,
    userNotes: String,
  },
  {
    timestamps: true,
    collection: 'claims',
  }
);

// Indexes
claimSchema.index({ userId: 1, dealId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ claimCode: 1 });
claimSchema.index({ createdAt: -1 });

export const Claim = mongoose.model<IClaimDocument>('Claim', claimSchema);