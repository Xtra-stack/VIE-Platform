import Unlockable from '../models/Unlockable.js';
import CareerProfile from '../models/CareerProfile.js';

export const listUnlockables = async () => {
  return Unlockable.find().sort({ createdAt: -1 }).lean().exec();
};

export const getProfile = async (userId) => {
  let profile = await CareerProfile.findOne({ userId }).lean().exec();
  if (!profile) {
    profile = await new CareerProfile({ userId }).save();
  }
  return profile;
};

export const unlockForUser = async (userId, key) => {
  const unlockable = await Unlockable.findOne({ key }).lean().exec();
  if (!unlockable) throw new Error('unlockable_not_found');

  const profile = await CareerProfile.findOneAndUpdate(
    { userId },
    { $addToSet: { unlocked: key }, $set: { updatedAt: new Date() } },
    { upsert: true, new: true }
  ).exec();

  return { profile, unlockable };
};

export const createUnlockable = async (payload) => {
  const doc = new Unlockable(payload);
  await doc.save();
  return doc;
};
