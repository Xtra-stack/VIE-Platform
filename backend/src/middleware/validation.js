export const validateRequest = (req, res, next) => {
  return res.status(501).json({
    success: false,
    error: "Validation not implemented",
  });
};
