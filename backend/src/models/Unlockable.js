import mongoose from 'mongoose';

const UnlockableSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  criteria: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Unlockable', UnlockableSchema);
