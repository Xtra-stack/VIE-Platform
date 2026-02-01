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

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
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
