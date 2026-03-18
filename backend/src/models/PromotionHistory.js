import mongoose from 'mongoose';

const promotionHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousRole: { type: String, required: true },
    newRole: { type: String, required: true },
    reason: { type: String },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Object },
  },
  { timestamps: true }
);

promotionHistorySchema.index({ userId: 1, createdAt: -1 });

export const PromotionHistory = mongoose.model('PromotionHistory', promotionHistorySchema);
