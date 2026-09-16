import { useSelector, useDispatch } from "react-redux";
import {
  checkAuth,
  loginUser,
  registerUser,
  googleLoginUser,
  logoutUser,
  clearAuthError
} from "../features/auth/authSlice.js";

/**
 * Custom hook for authentication state and dispatch actions.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, actionLoading, error } = useSelector(
    (state) => state.auth
  );

  return {
    user,
    isAuthenticated,
    loading,
    actionLoading,
    error,
    checkAuth: () => dispatch(checkAuth()),
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (userData) => dispatch(registerUser(userData)),
    googleLogin: (googleData) => dispatch(googleLoginUser(googleData)),
    logout: () => dispatch(logoutUser()),
    clearError: () => dispatch(clearAuthError())
  };
}

export default useAuth;
