import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import recommendationService from "../../services/recommendationService.js";

/**
 * Fetch general personalized recommendations (e.g. for Home page).
 */
export const fetchHomeRecommendations = createAsyncThunk(
  "recommendations/fetchHomeRecommendations",
  async ({ limit = 8 } = {}, { rejectWithValue }) => {
    try {
      const data = await recommendationService.getRecommendations({ limit });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch recommendations");
    }
  }
);

/**
 * Fetch contextual recommendations based on a viewed product.
 */
export const fetchContextRecommendations = createAsyncThunk(
  "recommendations/fetchContextRecommendations",
  async ({ contextProductId, limit = 6 }, { rejectWithValue }) => {
    try {
      const data = await recommendationService.getRecommendations({
        contextProductId,
        limit
      });
      return { contextProductId, recommendations: data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch contextual recommendations");
    }
  }
);

const initialState = {
  homeRecommendations: [],
  homeLoading: false,
  homeError: null,

  // Map of contextProductId -> array of recommendations
  contextRecommendations: {},
  contextLoading: false,
  contextError: null
};

export const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.homeRecommendations = [];
      state.contextRecommendations = {};
      state.homeError = null;
      state.contextError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Home Recommendations
      .addCase(fetchHomeRecommendations.pending, (state) => {
        state.homeLoading = true;
        state.homeError = null;
      })
      .addCase(fetchHomeRecommendations.fulfilled, (state, action) => {
        state.homeLoading = false;
        state.homeRecommendations = action.payload;
      })
      .addCase(fetchHomeRecommendations.rejected, (state, action) => {
        state.homeLoading = false;
        state.homeError = action.payload;
      })

      // Contextual Recommendations
      .addCase(fetchContextRecommendations.pending, (state) => {
        state.contextLoading = true;
        state.contextError = null;
      })
      .addCase(fetchContextRecommendations.fulfilled, (state, action) => {
        state.contextLoading = false;
        const { contextProductId, recommendations } = action.payload;
        state.contextRecommendations[contextProductId] = recommendations;
      })
      .addCase(fetchContextRecommendations.rejected, (state, action) => {
        state.contextLoading = false;
        state.contextError = action.payload;
      });
  }
});

export const { clearRecommendations } = recommendationSlice.actions;

// Selectors
export const selectHomeRecommendations = (state) =>
  state.recommendations.homeRecommendations;
export const selectHomeRecommendationsLoading = (state) =>
  state.recommendations.homeLoading;
export const selectContextRecommendations = (state, contextProductId) =>
  state.recommendations.contextRecommendations[contextProductId] || [];
export const selectContextRecommendationsLoading = (state) =>
  state.recommendations.contextLoading;

export default recommendationSlice.reducer;
