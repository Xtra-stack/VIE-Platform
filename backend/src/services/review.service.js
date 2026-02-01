import { Review } from "../models/Review.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { Project } from "../models/Project.js";
import { REVIEW_STATUS, SUBMISSION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";

export class ReviewService {
  async listReviews({ userId, userRole }) {
    if (userRole === ROLES.MANAGER) {
      return Review.find({ reviewerRole: ROLES.MANAGER }).sort({ createdAt: -1 });
    }
    if (userRole === ROLES.SENIOR) {
      return Review.find({ reviewerId: userId, reviewerRole: ROLES.SENIOR }).sort({ createdAt: -1 });
    }
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  async approve({ submissionId, reviewerId, reviewerRole, comment }) {
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
        status: REVIEW_STATUS.APPROVED,
        decision: "APPROVED",
        overallComment: comment,
        completedAt: new Date(),
      },
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

    if (reviewerRole === ROLES.MANAGER) {
      submission.status = SUBMISSION_STATUS.MANAGER_APPROVED;
      submission.resolvedAt = new Date();
      await submission.save();
    }

    return review;
  }

  async reject({ submissionId, reviewerId, reviewerRole, comment }) {
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
        overallComment: comment,
        completedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    if (reviewerRole === ROLES.SENIOR) {
      submission.status = SUBMISSION_STATUS.REVIEWER_REJECTED;
      submission.resolvedAt = new Date();
      await submission.save();
    }

    if (reviewerRole === ROLES.MANAGER) {
      submission.status = SUBMISSION_STATUS.MANAGER_REJECTED;
      submission.resolvedAt = new Date();
      await submission.save();
    }

    return review;
  }
}
