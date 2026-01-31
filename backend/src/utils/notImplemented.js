export const notImplemented = (featureName) => {
  return (req, res) => {
    res.status(501).json({
      success: false,
      error: `${featureName} not implemented`,
    });
  };
};
