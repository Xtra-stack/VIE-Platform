import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../services/api.js';
import { removeToken } from '../utils/auth.js';

export default function useAuthSession() {
  const navigate = useNavigate();

  const signOut = useCallback(async ({ redirectTo = '/login', replace = true } = {}) => {
    try {
      await logoutApi();
    } catch (error) {
      console.warn('Logout API call failed, clearing local session anyway.', error);
    } finally {
      removeToken();
      navigate(redirectTo, { replace });
    }
  }, [navigate]);

  return {
    signOut,
  };
}
