import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService.js";

// Check authentication session via HTTP-only cookie
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getMe();
      return user;
    } catch (error) {
      // 401 is expected if not logged in; silently reject
      return rejectWithValue(null);
    }
  }
);

// Login with email and password
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to log in");
    }
  }
);

// Register new customer
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const user = await authService.register(userData);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create account");
    }
  }
);

// Google OAuth Login or Register
export const googleLoginUser = createAsyncThunk(
  "auth/googleLoginUser",
  async (googleData, { rejectWithValue }) => {
    try {
      const user = await authService.googleLogin(googleData);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to authenticate with Google");
    }
  }
);

// Logout customer
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to logout");
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Initial check in progress
  actionLoading: false, // Login/Register form submitting
  error: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // googleLoginUser
      .addCase(googleLoginUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
