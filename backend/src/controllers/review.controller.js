import { ReviewService } from "../services/review.service.js";
import { ActivityLogService } from "../services/activitylog.service.js";
import NotificationService from "../services/notification.service.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { ROLES } from "../constants/roles.js";

const reviewService = new ReviewService();
const activityLogService = new ActivityLogService();

export const listReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.listReviews({
      userId: req.user.id,
      userRole: req.user.role,
      companyId: req.user.companyId || null,
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return next(error);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const { overallComment, lineComments = [], checklist = {}, riskFlag = false, riskNotes = '', managerComment, riskAccepted, overrideSeniorDecision } = req.body || {};
    const isManagerEndpoint = req.path.includes("/manager/");
    const reviewerRole = isManagerEndpoint ? ROLES.MANAGER : req.user.role;
    
    const review = await reviewService.approve({
      submissionId: req.params.submissionId,
      reviewerId: req.user.id,
      reviewerRole,
      overallComment,
      lineComments,
      checklist,
      riskFlag,
      riskNotes,
      managerComment,
      riskAccepted,
      overrideSeniorDecision,
    });

    // Log the approval action
    await activityLogService.logAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      actionType: 'approve',
      entityType: 'Review',
      entityId: review._id,
      message: `${req.user.role} approved submission`,
      details: { lineComments: lineComments.length, riskFlag },
    });

    // Prompt reviewer to leave mentorship feedback (if senior)
    try {
      const submission = await CodeSubmission.findById(req.params.submissionId).lean();
      const reviewerId = review.reviewerId || req.user.id;
      if (submission && reviewerId) {
        const menteeId = submission.submittedBy;
        const actionUrl = `/mentorship?menteeId=${menteeId}&submissionId=${submission._id}`;
        await NotificationService.createNotification(
          reviewerId,
          'MENTOR_PROMPT',
          'Please provide mentorship feedback',
          `Consider leaving short mentorship feedback for the author of this submission.`,
          'MENTORSHIP',
          {
            priority: 'MEDIUM',
            relatedId: submission._id,
            relatedModel: 'CodeSubmission',
            actionUrl,
            metadata: { menteeId, submissionId: submission._id },
            sender: req.user.id,
          }
        );
      }
    } catch (notifErr) {
      // Non-fatal
      console.warn('Failed to create mentor prompt notification', notifErr);
    }

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
};

export const rejectReview = async (req, res, next) => {
  try {
    const { overallComment, lineComments = [], fileName, lineNumber } = req.body || {};
    const isManagerEndpoint = req.path.includes("/manager/");
    const reviewerRole = isManagerEndpoint ? ROLES.MANAGER : req.user.role;
    
    const review = await reviewService.reject({
      submissionId: req.params.submissionId,
      reviewerId: req.user.id,
      reviewerRole,
      overallComment,
      lineComments,
      fileName,
      lineNumber,
    });

    // Log the rejection action
    await activityLogService.logAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      actionType: 'reject',
      entityType: 'Review',
      entityId: review._id,
      message: `${req.user.role} requested changes`,
      details: { lineComments: lineComments.length },
    });

    // Prompt reviewer to leave mentorship feedback (on rejection)
    try {
      const submission = await CodeSubmission.findById(req.params.submissionId).lean();
      const reviewerId = review.reviewerId || req.user.id;
      if (submission && reviewerId) {
        const menteeId = submission.submittedBy;
        const actionUrl = `/mentorship?menteeId=${menteeId}&submissionId=${submission._id}`;
        await NotificationService.createNotification(
          reviewerId,
          'MENTOR_PROMPT',
          'Please provide mentorship feedback',
          `You requested changes — consider leaving mentorship feedback to help the author improve.`,
          'MENTORSHIP',
          {
            priority: 'MEDIUM',
            relatedId: submission._id,
            relatedModel: 'CodeSubmission',
            actionUrl,
            metadata: { menteeId, submissionId: submission._id },
            sender: req.user.id,
          }
        );
      }
    } catch (notifErr) {
      console.warn('Failed to create mentor prompt notification (reject flow)', notifErr);
    }

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
};
