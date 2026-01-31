export const requireRole = () => {
  return (req, res, next) => {
    return res.status(501).json({
      success: false,
      error: "RBAC not implemented",
    });
  };
};
