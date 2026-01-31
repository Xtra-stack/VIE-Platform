export const requireAuth = (req, res, next) => {
  return res.status(501).json({
    success: false,
    error: "Authentication not implemented",
  });
};
