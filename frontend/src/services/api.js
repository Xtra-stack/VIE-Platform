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
export const login = (username, password) => {
  return apiCall('POST', '/auth/login', { username, password });
};

// Submissions
export const getSubmissions = () => {
  return apiCall('GET', '/api/submissions');
};

export const getSubmission = (id) => {
  return apiCall('GET', `/api/submissions/${id}`);
};

export const createSubmission = (projectId, sourceBranch, targetBranch, title, description) => {
  return apiCall('POST', '/api/submissions', {
    projectId,
    sourceBranch,
    targetBranch,
    title,
    description,
  });
};

// Reviews
export const getReviews = () => {
  return apiCall('GET', '/api/reviews');
};

export const approveReview = (submissionId, overallComment, inlineComments = []) => {
  return apiCall('POST', `/api/reviews/${submissionId}/approve`, {
    overallComment,
    inlineComments,
  });
};

export const rejectReview = (submissionId, overallComment, inlineComments = []) => {
  return apiCall('POST', `/api/reviews/${submissionId}/reject`, {
    overallComment,
    inlineComments,
  });
};

export const approveManagerReview = (submissionId, overallComment) => {
  return apiCall('POST', `/api/reviews/${submissionId}/manager/approve`, {
    overallComment,
  });
};

export const rejectManagerReview = (submissionId, overallComment) => {
  return apiCall('POST', `/api/reviews/${submissionId}/manager/reject`, {
    overallComment,
  });
};

// Projects
export const getProjects = () => {
  return apiCall('GET', '/api/projects');
};

export const getProject = (id) => {
  return apiCall('GET', `/api/projects/${id}`);
};
