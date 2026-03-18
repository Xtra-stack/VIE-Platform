import Skill from '../models/Skill.js';
import { User } from '../models/User.js';
import ProgressionService from './progression.service.js';

class SkillService {
  /**
   * Initialize skills for a new user
   * Creates all 7 skill categories at level 0
   */
  static async initializeUserSkills(userId) {
    const skillCategories = [
      'Frontend Development',
      'Backend Development',
      'API Development',
      'Testing & QA',
      'DevOps',
      'Documentation',
      'Communication'
    ];

    const skills = await Promise.all(
      skillCategories.map((skillName) =>
        Skill.create({ userId, skillName })
      )
    );

    return skills;
  }

  /**
   * Award XP to a skill based on task completion
   * Includes bonuses for performance
   */
  static async awardSkillXP(userId, skillName, taskData) {
    // Validate skill name
    const validSkills = [
      'Frontend Development',
      'Backend Development',
      'API Development',
      'Testing & QA',
      'DevOps',
      'Documentation',
      'Communication'
    ];

    if (!validSkills.includes(skillName)) {
      throw new Error(`Invalid skill name: ${skillName}`);
    }

    // Find or create skill
    let skill = await Skill.findOne({ userId, skillName });
    if (!skill) {
      skill = await Skill.create({ userId, skillName });
    }

    // Calculate XP
    let xpToAward = taskData.baseXP || 30;

    // Bonus: First-time approval (+50%)
    if (taskData.isFirstApproval) {
      xpToAward *= 1.5;
    }

    // Bonus: Early submission (+25%)
    if (taskData.submittedEarly) {
      xpToAward *= 1.25;
    }

    // Bonus: Quality feedback score (+15%)
    if (taskData.qualityScore && taskData.qualityScore >= 4) {
      xpToAward *= 1.15;
    }

    // Round to integer
    xpToAward = Math.round(xpToAward);

    // Award XP
    const levelUpResult = skill.awardXP(xpToAward, 'task_completion');

    // Update metrics
    skill.updateMetrics({
      approved: taskData.isFirstApproval,
      reworkCount: taskData.reworkCount || 0,
      hoursUsed: taskData.hoursUsed || 0,
      hoursAvailable: taskData.hoursAvailable || 1
    });

    await skill.save();

    // After awarding XP, evaluate progression for the user
    try {
      await ProgressionService.evaluatePromotion(userId);
    } catch (err) {
      // non-fatal: log and continue
      // logger may not be imported here; safe-guard with console
      console.warn(`Progression evaluation failed for ${userId}: ${err.message}`);
    }

    return {
      skillName,
      xpAwarded: xpToAward,
      newLevel: skill.level,
      newXP: skill.xp,
      leveledUp: levelUpResult.leveledUp,
      progressPercent: skill.getProgressPercent()
    };
  }

  /**
   * Get all skills for a user with progress
   */
  static async getUserSkills(userId) {
    const skills = await Skill.getUserSkillsWithProgress(userId);

    return skills.map((skill) => ({
      id: skill._id,
      name: skill.skillName,
      level: skill.level,
      xp: skill.xp,
      nextLevelXp: skill.nextLevelXp,
      progress: skill.getProgressPercent(),
      taskCount: skill.taskCount,
      approvalRate: skill.approvalRate,
      avgReworkCount: skill.avgReworkCount,
      completionEfficiency: Math.round(skill.completionEfficiency),
      lastUpdated: skill.lastUpdated
    }));
  }

  /**
   * Get skill heatmap for organization (ADMIN view)
   */
  static async getOrganizationSkillHeatmap(workspaceId) {
    // Get all JUNIOR users in workspace
    const juniors = await User.find({
      workspaceId,
      role: 'JUNIOR'
    });

    const juniorIds = juniors.map((j) => j._id);

    // Get skill data for all juniors
    const skillData = await Skill.aggregate([
      {
        $match: {
          userId: { $in: juniorIds }
        }
      },
      {
        $group: {
          _id: '$skillName',
          avgLevel: { $avg: '$level' },
          avgApprovalRate: { $avg: '$approvalRate' },
          userCount: { $sum: 1 },
          totalXP: { $sum: '$xp' }
        }
      },
      {
        $project: {
          skillName: '$_id',
          avgLevel: { $round: ['$avgLevel', 1] },
          avgApprovalRate: { $round: ['$avgApprovalRate', 0] },
          userCount: 1,
          totalXP: 1,
          _id: 0
        }
      },
      { $sort: { avgLevel: -1 } }
    ]);

    return skillData;
  }

  /**
   * Get junior improvement trend (SENIOR mentorship view)
   */
  static async getJuniorImprovementTrend(juniorId, months = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trend = await Skill.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(juniorId),
          'growthHistory.date': { $gte: startDate }
        }
      },
      {
        $unwind: '$growthHistory'
      },
      {
        $match: {
          'growthHistory.date': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            skillName: '$skillName',
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$growthHistory.date' }
            }
          },
          totalXP: { $sum: '$growthHistory.xp' },
          level: { $first: '$growthHistory.level' }
        }
      },
      {
        $sort: { '_id.skillName': 1, '_id.date': 1 }
      }
    ]);

    // Format for chart
    const formattedTrend = {};
    trend.forEach((entry) => {
      const skill = entry._id.skillName;
      if (!formattedTrend[skill]) {
        formattedTrend[skill] = [];
      }
      formattedTrend[skill].push({
        date: entry._id.date,
        xp: entry.totalXP,
        level: entry.level
      });
    });

    return formattedTrend;
  }

  /**
   * Get performance ranking for MANAGER view
   */
  static async getTeamPerformanceRanking(workspaceId, limit = 10) {
    const juniors = await User.find({
      workspaceId,
      role: 'JUNIOR'
    });

    const juniorIds = juniors.map((j) => j._id);

    const ranking = await Skill.aggregate([
      {
        $match: {
          userId: { $in: juniorIds }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalLevel: { $sum: '$level' },
          totalXP: { $sum: '$xp' },
          avgApprovalRate: { $avg: '$approvalRate' },
          skillCount: { $sum: 1 },
          topSkill: { $max: '$level' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          fullName: '$userInfo.fullName',
          username: '$userInfo.username',
          totalLevel: 1,
          totalXP: 1,
          avgApprovalRate: { $round: ['$avgApprovalRate', 0] },
          skillCount: 1,
          topSkill: 1,
          _id: 0
        }
      },
      { $sort: { totalLevel: -1, totalXP: -1 } },
      { $limit: limit }
    ]);

    return ranking;
  }

  /**
   * Get skill development path (What to work on next)
   */
  static async getSkillDevPath(userId) {
    const skills = await Skill.getUserSkillsWithProgress(userId);

    // Identify lowest and highest skills
    const sorted = skills.sort((a, b) => a.level - b.level);

    return {
      currentFocus: sorted[0], // Lowest level skill
      strongArea: sorted[sorted.length - 1], // Highest level skill
      allSkills: skills,
      recommendation:
        sorted[0].level < 3
          ? `Focus on improving ${sorted[0].skillName}`
          : 'Good balance! Push toward next levels'
    };
  }
}

export default SkillService;
