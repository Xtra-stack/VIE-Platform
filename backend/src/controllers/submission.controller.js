import { SubmissionService } from "../services/submission.service.js";

const submissionService = new SubmissionService();

export const listSubmissions = async (req, res, next) => {
  try {
    const submissions = await submissionService.listSubmissions({
      userId: req.user.id,
      userRole: req.user.role,
    });
    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    return next(error);
  }
};

export const createSubmission = async (req, res, next) => {
  try {
    const { projectId, title, description, sourceBranch, targetBranch } = req.body || {};

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
    });

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return next(error);
  }
};
