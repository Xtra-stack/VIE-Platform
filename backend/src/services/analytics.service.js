import AnalyticsMetric from '../models/AnalyticsMetric.js';

export const recordMetric = async (type, value = 1, meta = {}) => {
  const doc = new AnalyticsMetric({ type, value, meta });
  await doc.save();
  return doc;
};

export const getSummary = async (sinceDays = 7) => {
  const since = new Date(Date.now() - (sinceDays * 24 * 60 * 60 * 1000));

  const agg = await AnalyticsMetric.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$type', total: { $sum: '$value' }, count: { $sum: 1 } } },
  ]).exec();

  return agg.map((a) => ({ type: a._id, total: a.total, count: a.count }));
};
import { User } from '../models/User.js';
import { CodeSubmission } from '../models/CodeSubmission.js';
import { Review } from '../models/Review.js';
import Skill from '../models/Skill.js';
import { Task } from '../models/Task.js';
import { logger } from '../config/logger.js';

export class AnalyticsService {
  /**
   * Get user's personal analytics dashboard
   */
  static async getUserDashboard(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const submissions = await CodeSubmission.find({ submittedBy: userId });
      const reviews = await Review.find({ reviewerId: userId });
      const skills = await Skill.find({ userId });

      const stats = {
        user: {
          username: user.username,
          role: user.role,
          joinDate: user.createdAt
        },
        submissions: {
          total: submissions.length,
          approved: submissions.filter((s) => s.status === 'APPROVED').length,
          pending: submissions.filter((s) => s.status === 'SUBMITTED').length,
          rejected: submissions.filter((s) => s.status === 'REJECTED').length,
          avgCodeLength: Math.round(
            submissions.reduce((sum, s) => sum + (s.codeLength || 0), 0) /
              Math.max(submissions.length, 1)
          )
        },
        reviews: {
          total: reviews.length,
          avgQualityScore:
            reviews.length > 0
              ? Math.round(
                  (reviews.reduce(
                    (sum, r) => sum + (r.scores?.codeQuality || 0),
                    0
                  ) /
                    reviews.length) *
                    10
                ) / 10
              : 0,
          approvalRate:
            reviews.length > 0
              ? Math.round(
                  ((reviews.filter((r) => r.status === 'APPROVED').length /
                    reviews.length) *
                    100)
                )
              : 0
        },
        skills: {
          total: skills.length,
          avgLevel: Math.round(
            (skills.reduce((sum, s) => sum + (s.level || 0), 0) /
              Math.max(skills.length, 1)) *
              10
          ) / 10,
          totalXp: skills.reduce((sum, s) => sum + (s.xp || 0), 0),
          topSkill: skills.length > 0
            ? skills.reduce((max, s) =>
                (s.level || 0) > (max.level || 0) ? s : max
              ).skillName
            : 'N/A'
        }
      };

      return stats;
    } catch (error) {
      logger.error(`Error getting user dashboard: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get team performance analytics
   */
  static async getTeamAnalytics(companyId, taskId = null) {
    try {
      const query = { companyId };
      if (taskId) query.taskId = taskId;

      const submissions = await CodeSubmission.find(query)
        .populate('submittedBy', 'username role')
        .lean();

      if (submissions.length === 0) {
        return {
          totalSubmissions: 0,
          teamMembers: 0,
          avgApprovalRate: 0,
          avgCodeQuality: 0,
          submissionsTrend: [],
          topPerformers: []
        };
      }

      // Aggregate by user
      const userStats = {};
      submissions.forEach((sub) => {
        const userId = sub.submittedBy._id.toString();
        if (!userStats[userId]) {
          userStats[userId] = {
            username: sub.submittedBy.username,
            total: 0,
            approved: 0,
            codeQuality: []
          };
        }
        userStats[userId].total += 1;
        if (sub.status === 'APPROVED') userStats[userId].approved += 1;
      });

      // Get reviews for quality scores
      const reviews = await Review.find({
        submissionId: { $in: submissions.map((s) => s._id) }
      }).lean();

      reviews.forEach((review) => {
        const subId = review.submissionId.toString();
        const sub = submissions.find((s) => s._id.toString() === subId);
        if (sub) {
          const userId = sub.submittedBy._id.toString();
          if (userStats[userId]) {
            userStats[userId].codeQuality.push(review.scores?.codeQuality || 0);
          }
        }
      });

      // Calculate stats
      const topPerformers = Object.entries(userStats)
        .map(([userId, stats]) => ({
          username: stats.username,
          approvalRate: Math.round((stats.approved / stats.total) * 100),
          avgQuality:
            stats.codeQuality.length > 0
              ? Math.round(
                  (stats.codeQuality.reduce((a, b) => a + b, 0) /
                    stats.codeQuality.length) *
                    10
                ) / 10
              : 0,
          submissions: stats.total
        }))
        .sort((a, b) => b.approvalRate - a.approvalRate)
        .slice(0, 5);

      const avgApprovalRate = Math.round(
        (submissions.filter((s) => s.status === 'APPROVED').length /
          submissions.length) *
          100
      );

      const avgCodeQuality =
        reviews.length > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + (r.scores?.codeQuality || 0), 0) /
                reviews.length) *
                10
            ) / 10
          : 0;

      return {
        totalSubmissions: submissions.length,
        teamMembers: Object.keys(userStats).length,
        avgApprovalRate,
        avgCodeQuality,
        topPerformers,
        statusBreakdown: {
          approved: submissions.filter((s) => s.status === 'APPROVED').length,
          pending: submissions.filter((s) => s.status === 'SUBMITTED').length,
          rejected: submissions.filter((s) => s.status === 'REJECTED').length
        }
      };
    } catch (error) {
      logger.error(`Error getting team analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get company-wide analytics
   */
  static async getCompanyAnalytics(companyId) {
    try {
      const users = await User.find({ companyId });
      const userIds = users.map((u) => u._id);

      const skills = await Skill.find({ userId: { $in: userIds } });
      const submissions = await CodeSubmission.find({ submittedBy: { $in: userIds } });
      const reviews = await Review.find({
        submissionId: { $in: submissions.map((s) => s._id) }
      });

      // Role distribution
      const roleDistribution = {};
      users.forEach((u) => {
        roleDistribution[u.role] = (roleDistribution[u.role] || 0) + 1;
      });

      // Skill distribution
      const skillDistribution = {};
      skills.forEach((s) => {
        skillDistribution[s.skillName] = (skillDistribution[s.skillName] || 0) + 1;
      });

      // Time-series data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const submissionsByDate = {};
      submissions.forEach((sub) => {
        const date = new Date(sub.submittedAt).toISOString().split('T')[0];
        if (new Date(sub.submittedAt) >= thirtyDaysAgo) {
          submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
        }
      });

      return {
        company: companyId,
        totalUsers: users.length,
        totalSubmissions: submissions.length,
        totalReviews: reviews.length,
        avgSkillLevel:
          skills.length > 0
            ? Math.round(
                (skills.reduce((sum, s) => sum + (s.level || 0), 0) /
                  skills.length) *
                  10
              ) / 10
            : 0,
        roleDistribution,
        skillDistribution,
        submissionTrend: Object.entries(submissionsByDate)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
        insights: this.generateInsights(users, submissions, reviews)
      };
    } catch (error) {
      logger.error(`Error getting company analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get skill development trends
   */
  static async getSkillTrends(userId, skillName = null) {
    try {
      const query = { userId };
      if (skillName) query.skillName = skillName;

      const skills = await Skill.find(query);

      if (skills.length === 0) {
        return {
          totalSkills: 0,
          trends: [],
          recommendations: []
        };
      }

      const trends = skills.map((skill) => ({
        skillName: skill.skillName,
        currentLevel: skill.level,
        currentXp: skill.xp,
        nextLevelXp: skill.nextLevelXp,
        progressPercent: Math.round(
          ((skill.xp % skill.nextLevelXp) / skill.nextLevelXp) * 100
        ),
        growthHistory: skill.growthHistory || [],
        lastUpdated: skill.updatedAt
      }));

      // Generate recommendations
      const recommendations = this.generateSkillRecommendations(trends);

      return {
        totalSkills: skills.length,
        trends,
        recommendations
      };
    } catch (error) {
      logger.error(`Error getting skill trends: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get submission quality metrics
   */
  static async getQualityMetrics(taskId, limit = 10) {
    try {
      const submissions = await CodeSubmission.find({ taskId })
        .limit(limit)
        .sort({ submittedAt: -1 });

      const reviews = await Review.find({
        submissionId: { $in: submissions.map((s) => s._id) }
      });

      const qualityData = submissions.map((sub) => {
        const review = reviews.find((r) => r.submissionId.toString() === sub._id.toString());
        return {
          submissionId: sub._id,
          submittedBy: sub.submittedBy,
          codeLength: sub.codeLength,
          lineCount: sub.lineCount,
          status: sub.status,
          quality: {
            codeQuality: review?.scores?.codeQuality || 0,
            readability: review?.scores?.readability || 0,
            functionality: review?.scores?.functionality || 0,
            efficiency: review?.scores?.efficiency || 0,
            documentation: review?.scores?.documentation || 0
          },
          avgScore:
            review?.scores
              ? Math.round(
                  (Object.values(review.scores).reduce((a, b) => a + b, 0) / 5) *
                    10
                ) / 10
              : 0,
          submittedAt: sub.submittedAt
        };
      });

      return {
        taskId,
        submissionCount: submissions.length,
        qualityData,
        avgQuality:
          qualityData.length > 0
            ? Math.round(
                (qualityData.reduce((sum, q) => sum + (q.avgScore || 0), 0) /
                  qualityData.length) *
                  10
              ) / 10
            : 0
      };
    } catch (error) {
      logger.error(`Error getting quality metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Generate insights
   */
  static generateInsights(users, submissions, reviews) {
    const insights = [];

    // User growth
    if (users.length > 0) {
      insights.push({
        type: 'users',
        label: 'Total Team Members',
        value: users.length
      });
    }

    // Submission rate
    if (submissions.length > 0) {
      const ratePerUser = (submissions.length / Math.max(users.length, 1)).toFixed(1);
      insights.push({
        type: 'submissions',
        label: 'Avg Submissions per User',
        value: ratePerUser
      });
    }

    // Review completion
    const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;
    if (submissions.length > 0) {
      const approvalRate = Math.round((approvedCount / submissions.length) * 100);
      insights.push({
        type: 'quality',
        label: 'Code Approval Rate',
        value: `${approvalRate}%`,
        status: approvalRate > 60 ? 'good' : 'needs-improvement'
      });
    }

    return insights;
  }

  /**
   * Helper: Generate skill recommendations
   */
  static generateSkillRecommendations(trends) {
    const recommendations = [];

    // Find lowest skills
    const lowestSkills = trends
      .sort((a, b) => a.currentLevel - b.currentLevel)
      .slice(0, 2);

    lowestSkills.forEach((skill) => {
      if (skill.currentLevel < 3) {
        recommendations.push({
          skillName: skill.skillName,
          type: 'improvement',
          message: `Focus on ${skill.skillName} - currently at level ${skill.currentLevel}`,
          priority: 'high'
        });
      }
    });

    // Find highest skills
    const highestSkills = trends
      .sort((a, b) => b.currentLevel - a.currentLevel)
      .slice(0, 1);

    highestSkills.forEach((skill) => {
      if (skill.currentLevel >= 4) {
        recommendations.push({
          skillName: skill.skillName,
          type: 'mentor',
          message: `You excel at ${skill.skillName} - consider helping teammates`,
          priority: 'medium'
        });
      }
    });

    return recommendations;
  }

  /**
   * Get learning path recommendations
   */
  static async getLearningPath(userId) {
    try {
      const user = await User.findById(userId);
      const skills = await Skill.find({ userId });
      const submissions = await CodeSubmission.find({ submittedBy: userId });
      const reviews = await Review.find({
        submissionId: { $in: submissions.map((s) => s._id) }
      });

      // Analyze feedback patterns
      const feedbackPatterns = {};
      reviews.forEach((review) => {
        if (review.feedback) {
          const keywords = ['error', 'performance', 'readability', 'security', 'test'];
          keywords.forEach((keyword) => {
            if (review.feedback.toLowerCase().includes(keyword)) {
              feedbackPatterns[keyword] = (feedbackPatterns[keyword] || 0) + 1;
            }
          });
        }
      });

      // Generate learning path
      const path = {
        currentRole: user.role,
        skillLevels: skills.map((s) => ({
          skillName: s.skillName,
          level: s.level,
          recommendation: s.level < 3 ? 'Beginner Track' : s.level < 5 ? 'Intermediate Track' : 'Advanced'
        })),
        commonIssues: Object.entries(feedbackPatterns)
          .sort((a, b) => b[1] - a[1])
          .map(([issue, count]) => ({ issue, frequency: count })),
        nextMilestones: this.generateMilestones(skills, submissions, reviews),
        estimatedTime: this.estimateTime(skills)
      };

      return path;
    } catch (error) {
      logger.error(`Error getting learning path: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Generate milestones
   */
  static generateMilestones(skills, submissions, reviews) {
    const milestones = [];

    const totalXp = skills.reduce((sum, s) => sum + (s.xp || 0), 0);
    const avgLevel = Math.round(skills.reduce((sum, s) => sum + (s.level || 0), 0) / Math.max(skills.length, 1));

    if (totalXp < 100) {
      milestones.push({ name: 'Get Started', progress: Math.round((totalXp / 100) * 100), status: 'in-progress' });
    } else if (totalXp < 500) {
      milestones.push({ name: 'Get Started', progress: 100, status: 'completed' });
      milestones.push({ name: 'Build Skills', progress: Math.round((totalXp / 500) * 100), status: 'in-progress' });
    } else {
      milestones.push({ name: 'Get Started', progress: 100, status: 'completed' });
      milestones.push({ name: 'Build Skills', progress: 100, status: 'completed' });
      if (avgLevel >= 3) {
        milestones.push({ name: 'Master Skills', progress: Math.round((avgLevel / 5) * 100), status: 'in-progress' });
      }
    }

    return milestones;
  }

  /**
   * Helper: Estimate time to next level
   */
  static estimateTime(skills) {
    if (skills.length === 0) return 'Unknown';

    const avgXpToNext = skills.reduce((sum, s) => sum + (s.nextLevelXp - s.xp), 0) / skills.length;
    const daysPerXp = 0.1; // Estimate: 0.1 days per XP
    const estimatedDays = Math.round(avgXpToNext * daysPerXp);

    if (estimatedDays < 1) return 'Less than 1 day';
    if (estimatedDays < 7) return `${estimatedDays} days`;
    if (estimatedDays < 30) return `${Math.round(estimatedDays / 7)} weeks`;
    return `${Math.round(estimatedDays / 30)} months`;
  }

  /**
   * Get comparison analytics (user vs team)
   */
  static async getComparisonAnalytics(userId, companyId) {
    try {
      const userDash = await this.getUserDashboard(userId);
      const teamStats = await this.getTeamAnalytics(companyId);

      const comparison = {
        user: userDash,
        team: teamStats,
        comparison: {
          submissionVsTeam: {
            userValue: userDash.submissions.total,
            teamAvg: Math.round(teamStats.totalSubmissions / Math.max(teamStats.teamMembers, 1)),
            percentile: this.calculatePercentile(userDash.submissions.total, teamStats.totalSubmissions, teamStats.teamMembers)
          },
          qualityVsTeam: {
            userValue: userDash.reviews.avgQualityScore,
            teamAvg: teamStats.avgCodeQuality,
            percentile: this.calculatePercentile(userDash.reviews.avgQualityScore, teamStats.teamMembers, 10)
          },
          skillVsTeam: {
            userValue: userDash.skills.avgLevel,
            teamAvg: 0, // Would need to calculate from all team members
            percentile: 0
          }
        }
      };

      return comparison;
    } catch (error) {
      logger.error(`Error getting comparison analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Calculate percentile
   */
  static calculatePercentile(userValue, total, divisor) {
    const teamAvg = total / Math.max(divisor, 1);
    if (teamAvg === 0) return 50;
    return Math.round((userValue / teamAvg) * 100);
  }
}

export default AnalyticsService;
