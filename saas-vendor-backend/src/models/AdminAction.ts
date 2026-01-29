import mongoose, { Schema, Document } from 'mongoose';
import { IAdminAction } from '../types/index';

// We omit _id from IAdminAction to let Mongoose provide its own version
interface IAdminActionDocument extends Omit<IAdminAction, '_id'>, Document {}

const adminActionSchema = new Schema<IAdminActionDocument>(
  {
    adminId: {
      // Use 'as any' here to bridge the gap between String (in interface) 
      // and ObjectId (in MongoDB)
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
    action: {
      type: String,
      enum: [
        'create-deal', 'update-deal', 'delete-deal', 
        'approve-kyc', 'reject-kyc', 'approve-claim', 'reject-claim'
      ],
      required: [true, 'Action is required'],
    },
    actionType: {
      type: String,
      required: [true, 'Action type is required'],
    },
    resourceType: {
      type: String,
      enum: ['deal', 'user', 'claim'],
      required: [true, 'Resource type is required'],
    },
    resourceId: {
      type: Schema.Types.ObjectId as any,
      required: [true, 'Resource ID is required'],
    },
    // For Mixed types, you can pass the type directly or as an object
    changesBefore: { type: Schema.Types.Mixed },
    changesAfter: {
      type: Schema.Types.Mixed,
      required: [true, 'Changes after is required'],
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
    collection: 'admin_actions',
  }
);

// Optimized Indexes
adminActionSchema.index({ adminId: 1 });
adminActionSchema.index({ action: 1 });
adminActionSchema.index({ resourceType: 1 });
adminActionSchema.index({ createdAt: -1 });

export const AdminAction = mongoose.model<IAdminActionDocument>('AdminAction', adminActionSchema);