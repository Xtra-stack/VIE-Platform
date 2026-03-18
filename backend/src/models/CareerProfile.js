import mongoose from 'mongoose';

const CareerProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true, unique: true },
  unlocked: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CareerProfileSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('CareerProfile', CareerProfileSchema);
