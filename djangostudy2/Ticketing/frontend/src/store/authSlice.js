import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiBaseUrl = 'http://127.0.0.1:8000';

// Initialize axios token header helper
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initial state from localStorage
const initialState = {
  token: localStorage.getItem('token') || null,
  userRole: localStorage.getItem('userRole') || null,
  userId: localStorage.getItem('userId') || null,
  username: localStorage.getItem('username') || null,
  loading: false,
  error: null,
  apiBaseUrl,
};

// Set initial axios token header if present
if (initialState.token) {
  setAuthHeader(initialState.token);
}

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/login`, credentials);
      const { token, userRole, userId } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', credentials.username);
      
      setAuthHeader(token);
      
      return { token, userRole, userId, username: credentials.username };
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.error || 'Invalid credentials or connection issue.';
      return rejectWithValue(errMsg);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
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
      return rejectWithValue(errMsg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      // Call logout on backend
      await axios.post(`${apiBaseUrl}/logout`);
    } catch (error) {
      console.error('Backend logout error:', error);
    } finally {
      // Clear local storage & state regardless of server outcome
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      setAuthHeader(null);
      dispatch(clearAuth());
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.token = null;
      state.userRole = null;
      state.userId = null;
      state.username = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login flow
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.userRole = action.payload.userRole;
        state.userId = action.payload.userId;
        state.username = action.payload.username;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup flow
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
