import { getAuthMode, getCompanyId, getRefreshToken, getRole, getToken, removeToken, setToken } from '../utils/auth.js';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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
      const isAuthEndpoint = endpoint.startsWith('/api/auth/login') || endpoint.startsWith('/api/auth/admin/login') || endpoint.startsWith('/api/auth/refresh');

      if (response.status === 401 && !isAuthEndpoint) {
        const storedRefreshToken = getRefreshToken();

        if (storedRefreshToken) {
          const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshed = await refreshResponse.json();
            const newAccessToken = refreshed?.data?.token;
            const newRefreshToken = refreshed?.data?.refreshToken;

            if (newAccessToken) {
              setToken(newAccessToken, getRole(), getCompanyId(), getAuthMode(), {
                remember: localStorage.getItem('token') !== null,
                refreshToken: newRefreshToken || storedRefreshToken,
              });

              const retryOptions = {
                ...options,
                headers: getHeaders(),
              };

              const retryResponse = await fetch(`${API_BASE}${endpoint}`, retryOptions);
              if (retryResponse.ok) {
                return await retryResponse.json();
              }
            }
          }
        }

        removeToken();
      }

      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.message || errorBody.error || 'API Error';
      const apiError = new Error(message);
      apiError.status = response.status;
      throw apiError;
    }

    return await response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to connect to API server. Please check your connection and deployment URL.');
    }
    throw err;
  }
};

// Auth
export const login = async (username, password) => {
  const response = await apiCall('POST', '/api/auth/login', { username, password });
  // Backend returns { success: true, data: { token, user } }
  if (response.data) {
    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      role: response.data.user.role,
      userId: response.data.user._id,
      companyId: response.data.user.companyId,
    };
  }
  throw new Error('Invalid response from server');
};

export const adminRegister = async (payload) => {
  const response = await apiCall('POST', '/api/auth/admin/register', payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await apiCall('POST', '/api/auth/register', payload);
  return response.data;
};

export const adminLogin = async (username, password) => {
  const response = await apiCall('POST', '/api/auth/admin/login', { username, password });
  if (response.data) {
    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      role: response.data.user.role,
      userId: response.data.user._id,
      companyId: response.data.user.companyId,
    };
  }
  throw new Error('Invalid response from server');
};

export const refreshAuth = async (refreshToken) => {
  const response = await apiCall('POST', '/api/auth/refresh', { refreshToken });
  return response.data;
};

export const logout = async () => {
  const response = await apiCall('POST', '/api/auth/logout', {});
  return response;
};

export const startDemoTrial = async () => {
  const response = await apiCall('POST', '/api/demo-trial/start', {});
  return response.data;
};

export const getDemoState = async () => {
  const response = await apiCall('GET', '/api/demo-trial/state');
  return response.data;
};

export const submitDemoTask = async (taskId) => {
  const response = await apiCall('POST', `/api/demo-trial/tasks/${taskId}/submit`, {});
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiCall('GET', '/api/auth/me');
  return response.data?.user || null;
};

// Workspaces
export const createWorkspace = (payload) => {
  return apiCall('POST', '/api/workspaces', payload);
};

export const inviteWorkspaceUser = (companyId, user) => {
  return apiCall('POST', `/api/workspaces/${companyId}/invite`, user);
};

export const createInviteCode = (companyId, payload) => {
  return apiCall('POST', `/api/workspaces/${companyId}/invite-code`, payload);
};

export const joinOrganization = (inviteCode, payload) => {
  return apiCall('POST', `/api/workspaces/join/${inviteCode}`, payload);
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

export const createSubmission = (projectId, sourceBranch, targetBranch, title, description, codeSnippet, filesChanged, taskId = null) => {
  return apiCall('POST', '/api/submissions', {
    projectId,
    sourceBranch,
    targetBranch,
    title,
    description,
    codeSnippet,
    filesChanged,
    taskId,
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

export const getWorkspaceActivityLogs = async (workspaceId, page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await apiCall('GET', `/api/workspaces/${workspaceId}/activity?${params.toString()}`);
  return response.data || { logs: [], total: 0, page: 1, pages: 1 };
};

// Projects
export const getProjects = async () => {
  const response = await apiCall('GET', '/api/projects');
  return response.data || [];
};

export const getProject = (id) => {
  return apiCall('GET', `/api/projects/${id}`);
};

// Companies
export const getCompany = (companyId) => {
  return apiCall('GET', `/api/companies/${companyId}`);
};

export const completeTrial = (companyId) => {
  return apiCall('POST', `/api/companies/${companyId}/trial/complete`, {});
};

export const createOrganization = (payload) => {
  return apiCall('POST', '/api/real-workspace/organization', payload);
};

export const createRealWorkspace = (payload) => {
  return apiCall('POST', '/api/real-workspace/workspaces', payload);
};

export const assignWorkspaceManager = (workspaceId, managerUserId) => {
  return apiCall('POST', `/api/real-workspace/workspaces/${workspaceId}/assign-manager`, {
    managerUserId,
  });
};

export const inviteRealWorkspaceMember = (payload) => {
  return apiCall('POST', '/api/real-workspace/members/invite', payload);
};

// Project Workspaces (new workflow features)
export const createProjectWorkspace = (payload) => {
  return apiCall('POST', '/api/project-workspaces', payload);
};

export const uploadBaseCode = (workspaceId, files) => {
  return apiCall('POST', `/api/project-workspaces/${workspaceId}/base-code`, { files });
};

export const getProjectWorkspaces = async () => {
  const response = await apiCall('GET', '/api/project-workspaces');
  return response.data || [];
};

export const getProjectWorkspace = async (workspaceId) => {
  const response = await apiCall('GET', `/api/project-workspaces/${workspaceId}`);
  return response.data || {};
};

export const getMyTasks = async () => {
  const response = await apiCall('GET', '/api/project-workspaces/tasks/my-tasks');
  return response.data || [];
};

export const updateTaskStatus = (taskId, status, submissionId = null) => {
  return apiCall('PATCH', `/api/project-workspaces/tasks/${taskId}`, { status, submissionId });
};

export const getBaseCodeFiles = async (workspaceId) => {
  const response = await apiCall('GET', `/api/project-workspaces/${workspaceId}/base-code-files`);
  return response.data || [];
};

export const getWorkingCopyFiles = async (workspaceId) => {
  const response = await apiCall('GET', `/api/project-workspaces/${workspaceId}/working-copy-files`);
  return response.data || [];
};

export const updateWorkingFile = (workspaceId, filePath, content) => {
  return apiCall('PATCH', `/api/project-workspaces/${workspaceId}/working-files`, { filePath, content });
};

export const executeTerminalCommand = async (command, sessionId = 'default') => {
  const response = await apiCall('POST', '/api/coding/terminal/execute', {
    command,
    sessionId,
  });
  return response.data || null;
};

export const getTerminalHistory = async (limit = 50) => {
  const response = await apiCall('GET', `/api/coding/terminal/history?limit=${limit}`);
  return response.data || { history: [], count: 0 };
};

export const getPromotionHistory = async (userId) => {
  const response = await apiCall('GET', `/api/promotions/user/${userId}`);
  return response.history || response.data?.history || [];
};

// Analytics
export const getAnalyticsSummary = async (days = 7) => {
  const response = await apiCall('GET', `/api/analytics/summary?days=${days}`);
  return response.data || [];
};

// Templates
export const getTemplates = async () => {
  const response = await apiCall('GET', '/api/templates');
  return response.data || [];
};

export const generateTemplate = async (templateId, substitutions = {}) => {
  const response = await apiCall('POST', '/api/templates/generate', { templateId, substitutions });
  return response.data || null;
};

// Career mode
export const getUnlockables = async () => {
  const response = await apiCall('GET', '/api/career/unlockables');
  return response.data || [];
};

export const getCareerProfile = async (userId) => {
  const response = await apiCall('GET', `/api/career/profile/${userId || ''}`);
  return response.data || {};
};

export const unlockItem = async (key) => {
  const response = await apiCall('POST', '/api/career/unlock', { key });
  return response.data || {};
};

// Mentorship feedback
export const postMentorshipFeedback = async (payload) => {
  const response = await apiCall('POST', '/api/mentorship/feedback', payload);
  return response.data || {};
};

export const getMenteeFeedback = async (menteeId) => {
  const response = await apiCall('GET', `/api/mentorship/mentee/${menteeId}`);
  return response.data || [];
};

export const getMenteeSummary = async (menteeId) => {
  const response = await apiCall('GET', `/api/mentorship/mentee/${menteeId}/summary`);
  return response.data || {};
};


