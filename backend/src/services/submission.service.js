import { CodeSubmission } from "../models/CodeSubmission.js";
import { InternalRepository } from "../models/InternalRepository.js";
import { Project } from "../models/Project.js";
import { Review } from "../models/Review.js";
import { REVIEW_STATUS, SUBMISSION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";

export class SubmissionService {
  async createSubmission({ userId, projectId, title, description, sourceBranch, targetBranch }) {
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

    const repository = await InternalRepository.findOne({ projectId, isActive: true });

    const submission = await CodeSubmission.create({
      projectId,
      repositoryId: repository?._id,
      submittedBy: userId,
      sourceBranch,
      targetBranch: targetBranch || project.mainBranch,
      title,
      description,
      status: SUBMISSION_STATUS.AWAITING_REVIEW,
    });

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

  async listSubmissions({ userId, userRole }) {
    if (userRole === ROLES.MANAGER) {
      return CodeSubmission.find().sort({ submittedAt: -1 });
    }

    if (userRole === ROLES.SENIOR) {
      const projects = await Project.find({ "members.userId": userId }, { _id: 1 });
      const projectIds = projects.map((project) => project._id);
      return CodeSubmission.find({ projectId: { $in: projectIds } }).sort({ submittedAt: -1 });
    }

    return CodeSubmission.find({ submittedBy: userId }).sort({ submittedAt: -1 });
  }

  async getSubmission({ submissionId, userId, userRole }) {
    const submission = await CodeSubmission.findById(submissionId);
    if (!submission) {
      const error = new Error("Submission not found");
      error.status = 404;
      throw error;
    }

    if (userRole === ROLES.MANAGER) {
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
}
