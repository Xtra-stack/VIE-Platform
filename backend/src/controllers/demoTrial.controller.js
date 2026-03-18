import { demoTrialService } from "../services/demoTrial.service.js";

export const startDemoTrial = async (req, res, next) => {
  try {
    const result = demoTrialService.startTrial();
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getDemoState = async (req, res, next) => {
  try {
    const state = demoTrialService.getState(req.demo.token);
    if (!state) {
      return res.status(401).json({
        success: false,
        error: "Demo session expired",
      });
    }

    return res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    return next(error);
  }
};

export const submitDemoTask = async (req, res, next) => {
  try {
    const result = demoTrialService.submitTask(req.demo.token, req.params.taskId);
    if (!result) {
      return res.status(401).json({
        success: false,
        error: "Demo session expired",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
