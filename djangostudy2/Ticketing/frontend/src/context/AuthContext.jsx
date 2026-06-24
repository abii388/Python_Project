import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = 'http://127.0.0.1:8000';

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const loginUser = async (userCredentials) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/login`, userCredentials);
      const { token, userRole, userId } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', userCredentials.username);
      
      setToken(token);
      setUserRole(userRole);
      setUserId(userId);
      setUsername(userCredentials.username);
      
      return { success: true, userRole };
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.error || 'Invalid credentials or connection issue.';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const signupUser = async (userData) => {
    setLoading(true);
    try {
      await axios.post(`${apiBaseUrl}/signup`, userData);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      let errMsg = 'Something went wrong during sign up.';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errMsg = Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
        } else {
          errMsg = error.response.data;
        }
      }
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      // call logout on backend
      await axios.post(`${apiBaseUrl}/logout`);
    } catch (error) {
      console.error('Backend logout error:', error);
    } finally {
      // Clear local state regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      
      setToken(null);
      setUserRole(null);
      setUserId(null);
      setUsername(null);
    }
  };

  const isAuthenticated = !!token;
  const isAdmin = userRole === 'admin';

  return (
    <AuthContext.Provider value={{
      token,
      userRole,
      userId,
      username,
      loading,
      isAuthenticated,
      isAdmin,
      apiBaseUrl,
      loginUser,
      signupUser,
      logoutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
