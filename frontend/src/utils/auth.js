export const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (err) {
    console.error('Failed to decode token:', err);
    return null;
  }
};

const LOCAL_KEYS = ['token', 'refreshToken', 'role', 'companyId', 'authMode'];

const getStorage = () => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');

  if (localToken) {
    return localStorage;
  }

  if (sessionToken) {
    return sessionStorage;
  }

  return localStorage;
};

export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const setToken = (token, role = null, companyId = null, mode = 'REAL', options = {}) => {
  const remember = options?.remember !== false;
  const refreshToken = options?.refreshToken || null;
  const targetStorage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  LOCAL_KEYS.forEach((key) => {
    otherStorage.removeItem(key);
  });

  targetStorage.setItem('token', token);
  if (refreshToken) {
    targetStorage.setItem('refreshToken', refreshToken);
  }
  if (role) {
    targetStorage.setItem('role', role);
  }
  if (companyId) {
    targetStorage.setItem('companyId', companyId);
  }
  targetStorage.setItem('authMode', mode);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

export const removeToken = () => {
  LOCAL_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};

export const getRole = () => {
  const storageRole = getStorage().getItem('role');
  if (storageRole) {
    return storageRole;
  }

  const user = getUser();
  return user?.role || null;
};

export const getCompanyId = () => {
  const storedCompanyId = getStorage().getItem('companyId');
  if (storedCompanyId) return storedCompanyId;

  const user = getUser();
  return user?.companyId || null;
};

export const getAuthMode = () => {
  return getStorage().getItem('authMode') || 'REAL';
};
