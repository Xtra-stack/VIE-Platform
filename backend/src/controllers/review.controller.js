import { ReviewService } from "../services/review.service.js";

const reviewService = new ReviewService();

export const listReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.listReviews({
      userId: req.user.id,
      userRole: req.user.role,
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return next(error);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const { comment } = req.body || {};
    const review = await reviewService.approve({
      submissionId: req.params.submissionId,
      reviewerId: req.user.id,
      reviewerRole: req.user.role,
      comment,
    });

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
};

export const rejectReview = async (req, res, next) => {
  try {
    const { comment } = req.body || {};
    const review = await reviewService.reject({
      submissionId: req.params.submissionId,
      reviewerId: req.user.id,
      reviewerRole: req.user.role,
      comment,
    });

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
};
