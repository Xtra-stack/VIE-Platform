import { getToken } from '../utils/auth.js';

const API_BASE = 'http://localhost:3000';

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiCall = async (method, endpoint, data = null) => {
  try {
    const options = {
      method,
      headers: getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw {
        status: response.status,
        message: error.message || 'API Error',
      };
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
};

// Auth
export const login = async (username, password) => {
  const response = await apiCall('POST', '/auth/login', { username, password });
  // Backend returns { success: true, data: { token, user } }
  if (response.data) {
    return {
      token: response.data.token,
      role: response.data.user.role,
      userId: response.data.user._id,
      companyId: response.data.user.companyId,
    };
  }
  throw new Error('Invalid response from server');
};

// Workspaces
export const createWorkspace = (payload) => {
  return apiCall('POST', '/api/workspaces', payload);
};

export const inviteWorkspaceUser = (companyId, user) => {
  return apiCall('POST', `/api/workspaces/${companyId}/invite`, user);
};

// Submissions
export const getSubmissions = async () => {
  const response = await apiCall('GET', '/api/submissions');
  return response.data || [];
};

export const getSubmission = async (id) => {
  const response = await apiCall('GET', `/api/submissions/${id}`);
  return response.data || {};
};

export const createSubmission = (projectId, sourceBranch, targetBranch, title, description, codeSnippet, filesChanged) => {
  return apiCall('POST', '/api/submissions', {
    projectId,
    sourceBranch,
    targetBranch,
    title,
    description,
    codeSnippet,
    filesChanged,
  });
};

export const resubmitSubmission = (previousSubmissionId, codeSnippet, filesChanged) => {
  return apiCall('POST', `/api/submissions/${previousSubmissionId}/resubmit`, {
    codeSnippet,
    filesChanged,
  });
};

// Reviews
export const getReviews = async () => {
  const response = await apiCall('GET', '/api/reviews');
  return response.data || [];
};

export const approveReview = (submissionId, overallComment, lineComments = [], checklist = {}, riskFlag = false, riskNotes = '') => {
  return apiCall('POST', `/api/reviews/${submissionId}/approve`, {
    overallComment,
    lineComments,
    checklist,
    riskFlag,
    riskNotes,
  });
};

export const rejectReview = (submissionId, overallComment, lineComments = [], fileName = null, lineNumber = null) => {
  return apiCall('POST', `/api/reviews/${submissionId}/reject`, {
    overallComment,
    lineComments,
    fileName,
    lineNumber,
  });
};

export const approveManagerReview = (submissionId, managerComment, riskAccepted = false, overrideSeniorDecision = false) => {
  return apiCall('POST', `/api/reviews/${submissionId}/manager/approve`, {
    managerComment,
    riskAccepted,
    overrideSeniorDecision,
  });
};

export const rejectManagerReview = (submissionId, managerComment) => {
  return apiCall('POST', `/api/reviews/${submissionId}/manager/reject`, {
    managerComment,
  });
};

// Merge and Deployment
export const mergeSubmission = (submissionId) => {
  return apiCall('POST', `/api/submissions/${submissionId}/merge`, {});
};

export const deploySubmission = (submissionId) => {
  return apiCall('POST', `/api/submissions/${submissionId}/deploy`, {});
};

// Build Logs
export const getBuildLogs = async (submissionId) => {
  const response = await apiCall('GET', `/api/builds/${submissionId}`);
  return response.data || [];
};

export const getBuildLog = async (buildId) => {
  const response = await apiCall('GET', `/api/builds/log/${buildId}`);
  return response.data;
};

export const retryBuild = (submissionId) => {
  return apiCall('POST', `/api/builds/${submissionId}/retry`, {});
};

export const getPreviewUrl = async (submissionId) => {
  const response = await apiCall('GET', `/api/builds/${submissionId}/preview`);
  return response.data;
};

// Activity Logs
export const getActivityLog = (submissionId) => {
  return apiCall('GET', `/api/submissions/${submissionId}/activity`);
};

// Projects
export const getProjects = async () => {
  const response = await apiCall('GET', '/api/projects');
  return response.data || [];
};

export const getProject = (id) => {
  return apiCall('GET', `/api/projects/${id}`);
};
