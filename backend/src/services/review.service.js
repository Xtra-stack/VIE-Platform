import { Review } from "../models/Review.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { REVIEW_STATUS, SUBMISSION_STATUS } from "../constants/status.js";
import { ROLES, hasRoleAtLeast } from "../constants/roles.js";

export class ReviewService {
  async listReviews({ userId, userRole, companyId }) {
    if (hasRoleAtLeast(userRole, ROLES.MANAGER)) {
      if (!companyId) {
        return Review.find({ reviewerRole: { $in: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OWNER] } })
          .sort({ createdAt: -1 });
      }
      const projects = await Project.find({ companyId }, { _id: 1 });
      const projectIds = projects.map((project) => project._id);
      return Review.find({ reviewerRole: { $in: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OWNER] }, projectId: { $in: projectIds } })
        .sort({ createdAt: -1 });
    }
    if (userRole === ROLES.SENIOR) {
      return Review.find({ reviewerId: userId, reviewerRole: ROLES.SENIOR }).sort({ createdAt: -1 });
    }
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  async approve({ submissionId, reviewerId, reviewerRole, overallComment, lineComments = [], checklist = {}, riskFlag = false, riskNotes = '', managerComment, riskAccepted, overrideSeniorDecision }) {
    const submission = await CodeSubmission.findById(submissionId);
    if (!submission) {
      const error = new Error("Submission not found");
      error.status = 404;
      throw error;
    }

    const project = await Project.findById(submission.projectId, { members: 1 });
    const isMember = project?.members.some((member) => member.userId.toString() === reviewerId);
    if (!isMember) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    const isManagerOrHigher = hasRoleAtLeast(reviewerRole, ROLES.MANAGER);

    // For manager role (or higher), require comment
    if (isManagerOrHigher && !managerComment) {
      const error = new Error("Manager decision comment is required");
      error.status = 400;
      throw error;
    }

    const updateData = {
      reviewerId,
      reviewerRole,
      status: REVIEW_STATUS.APPROVED,
      decision: "APPROVED",
      overallComment: overallComment || '',
      lineComments: lineComments || [],
      checklist: checklist || {},
      riskFlag: riskFlag || false,
      riskNotes: riskNotes || '',
      completedAt: new Date(),
    };

    // Manager-specific fields
    if (isManagerOrHigher) {
      updateData.managerComment = managerComment;
      updateData.riskAccepted = riskAccepted || false;
      updateData.overrideSeniorDecision = overrideSeniorDecision || false;
    }

    const review = await Review.findOneAndUpdate(
      { submissionId, reviewerRole },
      updateData,
      { new: true, upsert: true }
    );

    if (reviewerRole === ROLES.SENIOR) {
      submission.status = SUBMISSION_STATUS.AWAITING_MANAGER_APPROVAL;
      await submission.save();

      const managerMember = project.members.find((member) => member.role === ROLES.MANAGER);
      if (managerMember) {
        await Review.findOneAndUpdate(
          { submissionId, reviewerRole: ROLES.MANAGER },
          {
            reviewerId: managerMember.userId,
            reviewerRole: ROLES.MANAGER,
            status: REVIEW_STATUS.PENDING,
            decision: "PENDING",
          },
          { new: true, upsert: true }
        );
      }
    }

    if (isManagerOrHigher) {
      submission.status = SUBMISSION_STATUS.MANAGER_APPROVED;
      submission.resolvedAt = new Date();
      await submission.save();

      const task = await Task.findOne({ submissionId: submission._id });
      if (task) {
        task.status = "APPROVED";
        task.completedAt = new Date();
        await task.save();
      }
    }

    return review;
  }

  async reject({ submissionId, reviewerId, reviewerRole, overallComment, lineComments = [], fileName, lineNumber }) {
    // Mandatory: rejection reason
    if (!overallComment || overallComment.trim() === '') {
      const error = new Error("Rejection reason is mandatory");
      error.status = 400;
      throw error;
    }

    const submission = await CodeSubmission.findById(submissionId);
    if (!submission) {
      const error = new Error("Submission not found");
      error.status = 404;
      throw error;
    }

    const project = await Project.findById(submission.projectId, { members: 1 });
    const isMember = project?.members.some((member) => member.userId.toString() === reviewerId);
    if (!isMember) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    const review = await Review.findOneAndUpdate(
      { submissionId, reviewerRole },
      {
        reviewerId,
        reviewerRole,
        status: REVIEW_STATUS.CHANGES_REQUESTED,
        decision: "REJECTED",
        overallComment: overallComment || '',
        lineComments: lineComments || [],
        completedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // Store rejection feedback for learning purposes
    submission.status = SUBMISSION_STATUS.REJECTED;
    submission.resolvedAt = new Date();
    submission.rejectionFeedback = {
      reason: overallComment,
      fileName: fileName || null,
      lineNumber: lineNumber || null,
      reviewerRole: reviewerRole,
      rejectedAt: new Date(),
      rejectedBy: reviewerId
    };
    await submission.save();

    const task = await Task.findOne({ submissionId: submission._id });
    if (task) {
      task.status = "CHANGES_REQUESTED";
      await task.save();
    }

    return review;
  }
}
