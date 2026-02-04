import { ReviewService } from "../services/review.service.js";
import { ActivityLogService } from "../services/activitylog.service.js";

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
    
    const review = await reviewService.approve({
      submissionId: req.params.submissionId,
      reviewerId: req.user.id,
      reviewerRole: req.user.role,
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

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
};

export const rejectReview = async (req, res, next) => {
  try {
    const { overallComment, lineComments = [], fileName, lineNumber } = req.body || {};
    
    const review = await reviewService.reject({
      submissionId: req.params.submissionId,
      reviewerId: req.user.id,
      reviewerRole: req.user.role,
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

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
};
