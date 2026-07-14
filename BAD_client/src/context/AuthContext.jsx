import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount and verify it
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('bad_token');
      if (storedToken) {
        try {
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setToken(storedToken);
            // Refresh local storage user representation
            localStorage.setItem('bad_user', JSON.stringify(response.data));
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to restore session:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * Log in a user.
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe - Handled standard token storage
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { token: userToken, user: loggedInUser } = res.data;
        setUser(loggedInUser);
        setToken(userToken);

        localStorage.setItem('bad_token', userToken);
        localStorage.setItem('bad_user', JSON.stringify(loggedInUser));
        setLoading(false);
        return loggedInUser;
      } else {
        setLoading(false);
        throw new Error(res.message || 'Login failed.');
      }
    } catch (error) {
      setLoading(false);
      const errMsg = error.response?.data?.message || error.message || 'Login failed.';
      throw new Error(errMsg);
    }
  };

  /**
   * Register a new patient.
   * @param {object} userData
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        const { token: userToken, user: registeredUser } = res.data;
        setUser(registeredUser);
        setToken(userToken);

        localStorage.setItem('bad_token', userToken);
        localStorage.setItem('bad_user', JSON.stringify(registeredUser));
        setLoading(false);
        return registeredUser;
      } else {
        setLoading(false);
        throw new Error(res.message || 'Registration failed.');
      }
    } catch (error) {
      setLoading(false);
      const errMsg = error.response?.data?.message || error.message || 'Registration failed.';
      throw new Error(errMsg);
    }
  };

  /**
   * Log out currently authenticated session.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bad_user');
    localStorage.removeItem('bad_token');
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
