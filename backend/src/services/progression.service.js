import Skill from '../models/Skill.js';
import { User } from '../models/User.js';
import { ActivityLogService } from './activitylog.service.js';
import { PromotionHistory } from '../models/PromotionHistory.js';
import NotificationService from './notification.service.js';

const activityLogService = new ActivityLogService();

class ProgressionService {
  /**
   * Evaluate a user's progression and promote role when criteria met
   */
  async evaluatePromotion(userId) {
    const user = await User.findById(userId);
    if (!user) return { promoted: false, reason: 'user_not_found' };

    // Do not auto-promote Admin/Owner
    if (!['JUNIOR', 'SENIOR'].includes(user.role)) {
      return { promoted: false, reason: 'role_not_eligible' };
    }

    const skills = await Skill.find({ userId });
    const totalXp = skills.reduce((s, k) => s + (k.xp || 0), 0);
    const avgApprovalRate = skills.length ? Math.round(skills.reduce((s, k) => s + (k.approvalRate || 0), 0) / skills.length) : 0;
    const avgRework = skills.length ? skills.reduce((s, k) => s + (k.avgReworkCount || 0), 0) / skills.length : 0;

    // Promotion rules (configurable)
    // Junior -> Senior: totalXp >= 900, avgApprovalRate >= 75, avgRework < 2
    if (user.role === 'JUNIOR') {
      if (totalXp >= 900 && avgApprovalRate >= 75 && avgRework < 2) {
        await this.promoteUser(userId, 'SENIOR');
        return { promoted: true, newRole: 'SENIOR', reason: 'meets_criteria' };
      }

      // Level progression metadata (informational only)
      const level = totalXp >= 400 ? 3 : totalXp >= 150 ? 2 : 1;
      return { promoted: false, juniorLevel: level, totalXp, avgApprovalRate };
    }

    // Senior -> Manager: more strict criteria
    if (user.role === 'SENIOR') {
      if (totalXp >= 2000 && avgApprovalRate >= 80) {
        await this.promoteUser(userId, 'MANAGER');
        return { promoted: true, newRole: 'MANAGER', reason: 'meets_criteria' };
      }

      return { promoted: false, totalXp, avgApprovalRate };
    }

    return { promoted: false };
  }

  async promoteUser(userId, newRole) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const previousRole = user.role;
    user.role = newRole;

    // Adjust capabilities
    if (newRole === 'SENIOR') {
      user.canReview = true;
      user.canDeploy = false;
      user.canApproveDeployment = false;
    }

    if (newRole === 'MANAGER') {
      user.canReview = true;
      user.canDeploy = true;
      user.canApproveDeployment = true;
    }

    await user.save();

    // Log activity using ActivityLogService contract
    await activityLogService.logAction({
      userId: user._id,
      role: previousRole,
      action: 'promotion',
      entityType: 'User',
      entityId: user._id,
      description: `User promoted from ${previousRole} to ${newRole}`,
      metadata: { previousRole, newRole }
    });

    // Persist promotion history
    try {
      await PromotionHistory.create({
        userId: user._id,
        previousRole,
        newRole,
        reason: 'auto_promotion',
        metadata: { xpSnapshot: Date.now() }
      });
    } catch (err) {
      // Non-fatal
      console.warn('Failed to persist promotion history:', err.message);
    }

    // Create an in-app notification for the user
    try {
      const title = `Promoted to ${newRole}`;
      const message = `Congratulations — you have been promoted from ${previousRole} to ${newRole}. Check your profile for new capabilities.`;
      await NotificationService.createNotification(
        user._id,
        'MILESTONE_ACHIEVED',
        title,
        message,
        'ACHIEVEMENT',
        {
          priority: 'HIGH',
          actionUrl: '/profile',
          metadata: { previousRole, newRole },
        }
      );
    } catch (err) {
      console.warn('Failed to create promotion notification:', err.message);
    }

    return user;
  }
}

export default new ProgressionService();
