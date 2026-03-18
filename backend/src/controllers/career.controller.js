import * as CareerService from '../services/career.service.js';

export const listUnlockables = async (req, res) => {
  try {
    const items = await CareerService.listUnlockables();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('listUnlockables', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.sub || req.params.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const profile = await CareerService.getProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error('getProfile', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const unlock = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.sub;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'key required' });

    const result = await CareerService.unlockForUser(userId, key);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('unlock', err);
    return res.status(500).json({ error: err.message || 'server_error' });
  }
};

export const createUnlockable = async (req, res) => {
  try {
    const payload = req.body;
    const doc = await CareerService.createUnlockable(payload);
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('createUnlockable', err);
    return res.status(500).json({ error: 'server_error' });
  }
};
