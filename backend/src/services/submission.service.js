import { CodeSubmission } from "../models/CodeSubmission.js";
import { InternalRepository } from "../models/InternalRepository.js";
import { Project } from "../models/Project.js";
import { Review } from "../models/Review.js";
import { Task } from "../models/Task.js";
import { REVIEW_STATUS, SUBMISSION_STATUS } from "../constants/status.js";
import { ROLES, hasRoleAtLeast } from "../constants/roles.js";
import { ActivityLogService } from "./activitylog.service.js";
import BuildService from "./build.service.js";

const activityLogService = new ActivityLogService();

export class SubmissionService {
  // Convert code string to line-aware format
  parseCodeLines(codeString) {
    if (!codeString) return [];
    const lines = codeString.split('\n');
    
    let linesAdded = 0;
    let linesRemoved = 0;
    
    const parsed = lines.map((content, index) => {
      // Count changes for stats
      if (content.startsWith('+')) linesAdded++;
      if (content.startsWith('-')) linesRemoved++;
      
      return {
        lineNumber: index + 1,
        content: content || '',
      };
    });
    
    return { codeLines: parsed, linesAdded, linesRemoved };
  }

  async createSubmission({ userId, projectId, title, description, sourceBranch, targetBranch, codeSnippet, filesChanged, taskId = null }) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Project not found");
      error.status = 404;
      throw error;
    }

    const isMember = project.members.some((member) => member.userId.toString() === userId);
    if (!isMember) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    let linkedTask = null;
    if (taskId) {
      linkedTask = await Task.findById(taskId);
      if (!linkedTask) {
        const error = new Error("Task not found");
        error.status = 404;
        throw error;
      }
      if (linkedTask.assignedTo.toString() !== userId) {
        const error = new Error("Forbidden");
        error.status = 403;
        throw error;
      }
      if (linkedTask.projectId.toString() !== projectId) {
        const error = new Error("Task does not belong to this project");
        error.status = 400;
        throw error;
      }
    }

    const repository = await InternalRepository.findOne({ projectId, isActive: true });
    const { codeLines, linesAdded, linesRemoved } = this.parseCodeLines(codeSnippet);

    const submission = await CodeSubmission.create({
      projectId,
      repositoryId: repository?._id,
      submittedBy: userId,
      sourceBranch,
      targetBranch: targetBranch || project.mainBranch,
      title,
      description,
      codeLines,
      filesChanged: filesChanged || [],
      linesAdded,
      linesRemoved,
      status: SUBMISSION_STATUS.AWAITING_REVIEW,
      buildStatus: 'PENDING',
    });

    if (linkedTask) {
      linkedTask.status = "SUBMITTED";
      linkedTask.submissionId = submission._id;
      await linkedTask.save();
    }

    await activityLogService.logAction({
      actorId: userId,
      actorRole: ROLES.JUNIOR,
      actionType: 'submit',
      entityType: 'CodeSubmission',
      entityId: submission._id,
      message: `Submitted code: "${title}"`,
      details: { branch: sourceBranch, filesCount: filesChanged?.length || 0 },
    });

    try {
      await BuildService.triggerBuild(submission._id, userId, 'FULL');
    } catch (buildError) {
      console.error('Failed to trigger build:', buildError);
    }

    const seniorMember = project.members.find((member) => member.role === ROLES.SENIOR);
    if (seniorMember) {
      await Review.create({
        submissionId: submission._id,
        projectId,
        reviewerId: seniorMember.userId,
        reviewerRole: "SENIOR",
        status: REVIEW_STATUS.PENDING,
        decision: "PENDING",
      });
    }

    return submission;
  }

  async listSubmissions({ userId, userRole, companyId }) {
    if (hasRoleAtLeast(userRole, ROLES.MANAGER)) {
      if (!companyId) {
        return CodeSubmission.find().sort({ submittedAt: -1 });
      }
      const projects = await Project.find({ companyId }, { _id: 1 });
      const projectIds = projects.map((project) => project._id);
      return CodeSubmission.find({ projectId: { $in: projectIds } }).sort({ submittedAt: -1 });
    }

    if (userRole === ROLES.SENIOR) {
      const projects = await Project.find({ "members.userId": userId }, { _id: 1 });
      const projectIds = projects.map((project) => project._id);
      return CodeSubmission.find({ projectId: { $in: projectIds } }).sort({ submittedAt: -1 });
    }

    return CodeSubmission.find({ submittedBy: userId }).sort({ submittedAt: -1 });
  }

  async getSubmission({ submissionId, userId, userRole, companyId }) {
    const submission = await CodeSubmission.findById(submissionId);
    if (!submission) {
      const error = new Error("Submission not found");
      error.status = 404;
      throw error;
    }

    if (hasRoleAtLeast(userRole, ROLES.MANAGER)) {
      if (!companyId) {
        return submission;
      }
      const project = await Project.findById(submission.projectId, { companyId: 1 });
      if (project?.companyId?.toString() !== companyId) {
        const error = new Error("Forbidden");
        error.status = 403;
        throw error;
      }
      return submission;
    }

    if (submission.submittedBy.toString() === userId) {
      return submission;
    }

    const project = await Project.findById(submission.projectId, { members: 1 });
    const isMember = project?.members.some((member) => member.userId.toString() === userId);
    if (!isMember) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    return submission;
  }

  async resubmit({ previousSubmissionId, userId, codeSnippet, filesChanged }) {
    // Get the original rejected submission
    const previousSubmission = await CodeSubmission.findById(previousSubmissionId);
    if (!previousSubmission) {
      const error = new Error("Previous submission not found");
      error.status = 404;
      throw error;
    }

    // Only the original submitter can resubmit
    if (previousSubmission.submittedBy.toString() !== userId) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    // Must be in REJECTED status
    if (previousSubmission.status !== SUBMISSION_STATUS.REJECTED) {
      const error = new Error("This submission cannot be resubmitted");
      error.status = 400;
      throw error;
    }

    // Parse new code
    const { codeLines, linesAdded, linesRemoved } = this.parseCodeLines(codeSnippet);

    // Create new submission linked to the previous one
    const newSubmission = await CodeSubmission.create({
      projectId: previousSubmission.projectId,
      repositoryId: previousSubmission.repositoryId,
      submittedBy: userId,
      sourceBranch: previousSubmission.sourceBranch,
      targetBranch: previousSubmission.targetBranch,
      title: previousSubmission.title,
      description: previousSubmission.description,
      codeLines,
      filesChanged: filesChanged || previousSubmission.filesChanged,
      linesAdded,
      linesRemoved,
      status: SUBMISSION_STATUS.RESUBMITTED,
      previousSubmissionId: previousSubmissionId,
      buildStatus: 'PENDING',
    });

    const linkedTask = await Task.findOne({ submissionId: previousSubmissionId });
    if (linkedTask) {
      linkedTask.status = "SUBMITTED";
      linkedTask.submissionId = newSubmission._id;
      await linkedTask.save();
    }

    // Increment resubmission count on parent
    previousSubmission.resubmissionCount += 1;
    await previousSubmission.save();

    // Log the resubmission
    await activityLogService.logAction({
      actorId: userId,
      actorRole: ROLES.JUNIOR,
      actionType: 'resubmit',
      entityType: 'CodeSubmission',
      entityId: newSubmission._id,
      message: `Resubmitted code after feedback`,
      details: { previousSubmissionId, resubmissionNumber: previousSubmission.resubmissionCount },
    });

    // Create reviews for the resubmission
    const project = await Project.findById(previousSubmission.projectId);
    const seniorMember = project.members.find((member) => member.role === ROLES.SENIOR);
    if (seniorMember) {
      await Review.create({
        submissionId: newSubmission._id,
        projectId: previousSubmission.projectId,
        reviewerId: seniorMember.userId,
        reviewerRole: ROLES.SENIOR,
        status: REVIEW_STATUS.PENDING,
        decision: "PENDING",
      });
    }

    // Trigger build on the new submission
    try {
      await BuildService.triggerBuild(newSubmission._id, userId, 'FULL');
    } catch (buildError) {
      console.error('Failed to trigger build on resubmission:', buildError);
    }

    return newSubmission;
  }}