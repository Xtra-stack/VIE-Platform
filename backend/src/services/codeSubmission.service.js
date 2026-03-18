import { CodeSubmission } from '../models/CodeSubmission.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { logger } from '../config/logger.js';

export class CodeSubmissionService {
  /**
   * Save code draft without submitting
   */
  static async saveDraft(userId, taskId, code, language, filename) {
    try {
      const submission = await CodeSubmission.findOneAndUpdate(
        { userId, taskId, status: 'draft' },
        {
          userId,
          taskId,
          code,
          language,
          filename,
          status: 'draft',
          lastSavedAt: new Date(),
          codeLength: code.length,
          lineCount: code.split('\n').length
        },
        { upsert: true, new: true, runValidators: true }
      );

      logger.info(`Draft saved for user ${userId} on task ${taskId}`);
      return submission;
    } catch (error) {
      logger.error(`Error saving draft: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit code for review
   */
  static async submitCode(userId, taskId, code, language, filename) {
    try {
      const task = await Task.findById(taskId);
      if (!task) throw new Error('Task not found');

      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Check submission limit (3 submissions per task)
      const previousSubmissions = await CodeSubmission.countDocuments({
        userId,
        taskId,
        status: 'submitted'
      });

      if (previousSubmissions >= 3) {
        throw new Error('Maximum submissions (3) reached for this task');
      }

      // Create submission
      const submission = new CodeSubmission({
        userId,
        taskId,
        code,
        language,
        filename,
        status: 'submitted',
        submittedAt: new Date(),
        codeLength: code.length,
        lineCount: code.split('\n').length,
        cyclomatic: this.calculateCyclomaticComplexity(code),
        testsPassed: 0,
        testFailures: 0
      });

      await submission.save();

      // Update user's submission count
      user.submissionCount = (user.submissionCount || 0) + 1;
      await user.save();

      // Update task submissions
      task.submissions = (task.submissions || 0) + 1;
      await task.save();

      logger.info(`Code submitted for user ${userId} on task ${taskId}`);
      return submission;
    } catch (error) {
      logger.error(`Error submitting code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's draft for a task
   */
  static async getDraft(userId, taskId) {
    try {
      const draft = await CodeSubmission.findOne({
        userId,
        taskId,
        status: 'draft'
      });

      return draft || null;
    } catch (error) {
      logger.error(`Error fetching draft: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all submissions for a task by user
   */
  static async getSubmissions(userId, taskId) {
    try {
      const submissions = await CodeSubmission.find({
        userId,
        taskId,
        status: 'submitted'
      }).sort({ submittedAt: -1 });

      return submissions;
    } catch (error) {
      logger.error(`Error fetching submissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all submissions for a task (for reviewers)
   */
  static async getTaskSubmissions(taskId, filter = {}) {
    try {
      const query = { taskId, status: 'submitted', ...filter };
      const submissions = await CodeSubmission.find(query)
        .populate('userId', 'username email')
        .sort({ submittedAt: -1 });

      return submissions;
    } catch (error) {
      logger.error(`Error fetching task submissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run basic code analysis
   */
  static async analyzeCode(code, language) {
    try {
      const analysis = {
        language,
        codeLength: code.length,
        lineCount: code.split('\n').length,
        comments: this.countComments(code, language),
        functions: this.countFunctions(code, language),
        cyclomaticComplexity: this.calculateCyclomaticComplexity(code),
        hasErrors: this.detectSyntaxIssues(code, language),
        readabilityScore: this.calculateReadabilityScore(code, language)
      };

      return analysis;
    } catch (error) {
      logger.error(`Error analyzing code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Count comments in code
   */
  static countComments(code, language) {
    let count = 0;
    if (language === 'javascript' || language === 'jsx') {
      count += (code.match(/\/\//g) || []).length;
      count += (code.match(/\/\*.*?\*\//gs) || []).length;
    } else if (language === 'python') {
      count += (code.match(/#/g) || []).length;
      count += (code.match(/'''|"""/g) || []).length / 2;
    } else if (language === 'java') {
      count += (code.match(/\/\//g) || []).length;
      count += (code.match(/\/\*.*?\*\//gs) || []).length;
    }
    return count;
  }

  /**
   * Helper: Count functions
   */
  static countFunctions(code, language) {
    const patterns = {
      javascript: /function\s+\w+|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*\{/g,
      jsx: /function\s+\w+|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*\{/g,
      python: /def\s+\w+/g,
      java: /public|private|protected\s+\w+\s+\w+\s*\(/g
    };

    const pattern = patterns[language];
    return pattern ? (code.match(pattern) || []).length : 0;
  }

  /**
   * Helper: Calculate cyclomatic complexity
   */
  static calculateCyclomaticComplexity(code) {
    let complexity = 1;
    const patterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /else/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?.*:/g // ternary
    ];

    patterns.forEach((pattern) => {
      complexity += (code.match(pattern) || []).length;
    });

    return Math.min(complexity, 10); // Cap at 10
  }

  /**
   * Helper: Detect syntax issues
   */
  static detectSyntaxIssues(code, language) {
    const issues = [];

    if (language === 'javascript' || language === 'jsx') {
      // Check for unclosed brackets
      const openBrackets = (code.match(/\{/g) || []).length;
      const closeBrackets = (code.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) issues.push('Mismatched braces');

      const openParen = (code.match(/\(/g) || []).length;
      const closeParen = (code.match(/\)/g) || []).length;
      if (openParen !== closeParen) issues.push('Mismatched parentheses');
    }

    return issues;
  }

  /**
   * Helper: Calculate readability score (0-100)
   */
  static calculateReadabilityScore(code, language) {
    let score = 50; // Base score

    // Check comment ratio
    const commentCount = this.countComments(code, language);
    const lineCount = code.split('\n').length;
    if (commentCount / lineCount > 0.2) score += 15;

    // Check code length (not too long, not too short)
    if (code.length > 50 && code.length < 5000) score += 10;

    // Check indentation consistency
    const lines = code.split('\n');
    const indentedLines = lines.filter((l) => /^\s+\S/.test(l)).length;
    if (indentedLines / lines.length > 0.6) score += 10;

    // Check function usage
    const functionCount = this.countFunctions(code, language);
    if (functionCount > 2) score += 10;

    // Penalize high complexity
    const complexity = this.calculateCyclomaticComplexity(code);
    if (complexity > 8) score -= 15;

    return Math.min(score, 100);
  }

  /**
   * Get analytics for a user's submissions
   */
  static async getUserSubmissionAnalytics(userId) {
    try {
      const submissions = await CodeSubmission.find({
        userId,
        status: 'submitted'
      });

      if (submissions.length === 0) {
        return {
          totalSubmissions: 0,
          avgCodeLength: 0,
          avgComplexity: 0,
          avgReadability: 0,
          languages: {},
          improvementTrend: []
        };
      }

      const analytics = {
        totalSubmissions: submissions.length,
        avgCodeLength: Math.round(
          submissions.reduce((sum, s) => sum + s.codeLength, 0) / submissions.length
        ),
        avgComplexity:
          Math.round(
            (submissions.reduce((sum, s) => sum + s.cyclomatic, 0) / submissions.length) * 10
          ) / 10,
        avgReadability: Math.round(
          submissions.reduce((sum, s) => sum + (s.readabilityScore || 50), 0) / submissions.length
        ),
        languages: this.aggregateLanguages(submissions),
        improvementTrend: this.calculateTrend(submissions)
      };

      return analytics;
    } catch (error) {
      logger.error(`Error getting submission analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Aggregate languages used
   */
  static aggregateLanguages(submissions) {
    const languages = {};
    submissions.forEach((s) => {
      languages[s.language] = (languages[s.language] || 0) + 1;
    });
    return languages;
  }

  /**
   * Helper: Calculate improvement trend
   */
  static calculateTrend(submissions) {
    const sorted = submissions.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    return sorted.slice(-10).map((s) => ({
      date: s.submittedAt,
      complexity: s.cyclomatic,
      readability: s.readabilityScore || 50,
      codeLength: s.codeLength
    }));
  }
}

export default CodeSubmissionService;
