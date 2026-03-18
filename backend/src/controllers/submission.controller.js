import { SubmissionService } from "../services/submission.service.js";
import { ActivityLogService } from "../services/activitylog.service.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { ROLES, hasRoleAtLeast } from "../constants/roles.js";
import { SUBMISSION_STATUS } from "../constants/status.js";

const submissionService = new SubmissionService();
const activityLogService = new ActivityLogService();

export const listSubmissions = async (req, res, next) => {
  try {
    const submissions = await submissionService.listSubmissions({
      userId: req.user.id,
      userRole: req.user.role,
      companyId: req.user.companyId || null,
    });
    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    return next(error);
  }
};

export const createSubmission = async (req, res, next) => {
  try {
    const { projectId, title, description, sourceBranch, targetBranch, codeSnippet, filesChanged, taskId } = req.body || {};

    if (!projectId || !title || !sourceBranch) {
      return res.status(400).json({
        success: false,
        error: "projectId, title, and sourceBranch are required",
      });
    }

    const submission = await submissionService.createSubmission({
      userId: req.user.id,
      projectId,
      title,
      description,
      sourceBranch,
      targetBranch,
      codeSnippet,
      filesChanged,
      taskId,
    });

    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return next(error);
  }
};

export const getSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmission({
      submissionId: req.params.submissionId,
      userId: req.user.id,
      userRole: req.user.role,
      companyId: req.user.companyId || null,
    });

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return next(error);
  }
};

export const mergeSubmission = async (req, res, next) => {
  try {
    const submission = await CodeSubmission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, error: "Submission not found" });
    }

    // Only manager can merge
    if (req.user.role !== ROLES.MANAGER) {
      return res.status(403).json({ success: false, error: "Only managers can merge" });
    }

    if (submission.status !== SUBMISSION_STATUS.MANAGER_APPROVED) {
      return res.status(400).json({ success: false, error: "Can only merge approved submissions" });
    }

    submission.mergedBy = req.user.id;
    submission.mergedAt = new Date();
    await submission.save();

    // Log the merge action
    await activityLogService.logAction({
      actorId: req.user.id,
      actorRole: ROLES.MANAGER,
      actionType: 'merge',
      entityType: 'CodeSubmission',
      entityId: submission._id,
      message: `Merged code to ${submission.targetBranch}`,
      details: { sourceBranch: submission.sourceBranch, targetBranch: submission.targetBranch },
    });

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return next(error);
  }
};

export const deploySubmission = async (req, res, next) => {
  try {
    const submission = await CodeSubmission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, error: "Submission not found" });
    }

    // Only manager can deploy
    if (!hasRoleAtLeast(req.user.role, ROLES.MANAGER)) {
      return res.status(403).json({ success: false, error: "Only managers can deploy" });
    }

    if (!submission.mergedAt) {
      return res.status(400).json({ success: false, error: "Can only deploy merged submissions" });
    }

    submission.deployedBy = req.user.id;
    submission.deployedAt = new Date();
    submission.status = SUBMISSION_STATUS.DEPLOYED;
    await submission.save();

    // Log the deployment action
    await activityLogService.logAction({
      actorId: req.user.id,
      actorRole: ROLES.MANAGER,
      actionType: 'deploy',
      entityType: 'CodeSubmission',
      entityId: submission._id,
      message: `Deployed code to production`,
      details: { branch: submission.targetBranch },
    });

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return next(error);
  }
};

export const resubmitSubmission = async (req, res, next) => {
  try {
    const { codeSnippet, filesChanged } = req.body || {};
    const previousSubmissionId = req.params.submissionId;

    if (!codeSnippet) {
      return res.status(400).json({
        success: false,
        error: "codeSnippet is required",
      });
    }

    const submission = await submissionService.resubmit({
      previousSubmissionId,
      userId: req.user.id,
      codeSnippet,
      filesChanged,
    });

    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return next(error);
  }
};
