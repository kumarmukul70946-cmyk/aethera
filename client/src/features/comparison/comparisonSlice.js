import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import comparisonService from "../../services/comparisonService.js";

// Helper to load persisted comparison items from localStorage
const loadPersistedCompareState = () => {
  try {
    const raw = localStorage.getItem("aethera_compare_items");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length <= 4) {
        return {
          selectedProductIds: parsed.map((p) => p._id || p.id),
          selectedProducts: parsed
        };
      }
    }
  } catch (err) {
    console.warn("[comparisonSlice] Failed to load persisted compare items:", err);
  }
  return {
    selectedProductIds: [],
    selectedProducts: []
  };
};

const savePersistedCompareState = (products) => {
  try {
    localStorage.setItem("aethera_compare_items", JSON.stringify(products.slice(0, 4)));
  } catch (err) {
    console.warn("[comparisonSlice] Failed to save compare items:", err);
  }
};

const initialPersisted = loadPersistedCompareState();

const initialState = {
  selectedProductIds: initialPersisted.selectedProductIds,
  selectedProducts: initialPersisted.selectedProducts,
  comparisonResult: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  activeQuestion: ""
};

/**
 * Async thunk to execute grounded multi-product comparison via AI API
 */
export const fetchProductComparison = createAsyncThunk(
  "comparison/fetchProductComparison",
  async ({ productIds, question = "" }, { rejectWithValue }) => {
    try {
      const data = await comparisonService.compareProducts({
        productIds,
        question
      });
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate product comparison. Please try again.";
      return rejectWithValue(msg);
    }
  }
);

export const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const product = action.payload;
      if (!product) return;

      const pid = (product._id || product.id).toString();

      // Check if already in comparison list
      const exists = state.selectedProductIds.some((id) => id.toString() === pid);
      if (exists) return;

      // Limit to max 4 products
      if (state.selectedProductIds.length >= 4) {
        return;
      }

      const safeSummary = {
        _id: pid,
        id: pid,
        name: product.name,
        slug: product.slug,
        brand: product.brand || "Aethera",
        price: product.price,
        finalPrice: product.finalPrice || product.price,
        discount: product.discount || 0,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        image:
          product.images && product.images.length > 0
            ? typeof product.images[0] === "string"
              ? product.images[0]
              : product.images[0].url
            : product.image || null,
        stock: product.stock
      };

      state.selectedProductIds.push(pid);
      state.selectedProducts.push(safeSummary);
      savePersistedCompareState(state.selectedProducts);
    },

    removeFromCompare: (state, action) => {
      const pid = action.payload?.toString();
      if (!pid) return;

      state.selectedProductIds = state.selectedProductIds.filter(
        (id) => id.toString() !== pid
      );
      state.selectedProducts = state.selectedProducts.filter(
        (p) => (p._id || p.id).toString() !== pid
      );

      // If comparison result has this product, remove it or invalidate if fewer than 2 remain
      if (state.comparisonResult) {
        if (state.selectedProductIds.length < 2) {
          state.comparisonResult = null;
        } else {
          state.comparisonResult.products = (state.comparisonResult.products || []).filter(
            (p) => (p._id || p.id).toString() !== pid
          );
          if (Array.isArray(state.comparisonResult.comparisonTable)) {
            state.comparisonResult.comparisonTable = state.comparisonResult.comparisonTable.map(
              (row) => ({
                ...row,
                values: row.values.filter((v) => v.productId !== pid)
              })
            );
          }
          if (Array.isArray(state.comparisonResult.tradeoffs)) {
            state.comparisonResult.tradeoffs = state.comparisonResult.tradeoffs.filter(
              (t) => t.productId !== pid
            );
          }
          if (Array.isArray(state.comparisonResult.reviewInsights)) {
            state.comparisonResult.reviewInsights = state.comparisonResult.reviewInsights.filter(
              (i) => i.productId !== pid
            );
          }
        }
      }

      savePersistedCompareState(state.selectedProducts);
    },

    clearCompare: (state) => {
      state.selectedProductIds = [];
      state.selectedProducts = [];
      state.comparisonResult = null;
      state.status = "idle";
      state.error = null;
      state.activeQuestion = "";
      try {
        localStorage.removeItem("aethera_compare_items");
      } catch (err) {
        // ignore
      }
    },

    setCompareItemsFromProducts: (state, action) => {
      const products = action.payload;
      if (!Array.isArray(products)) return;

      const validProducts = products.slice(0, 4).map((p) => {
        const pid = (p._id || p.id).toString();
        return {
          _id: pid,
          id: pid,
          name: p.name,
          slug: p.slug,
          brand: p.brand || "Aethera",
          price: p.price,
          finalPrice: p.finalPrice || p.price,
          discount: p.discount || 0,
          rating: p.rating || 0,
          reviewCount: p.reviewCount || 0,
          image:
            p.images && p.images.length > 0
              ? typeof p.images[0] === "string"
                ? p.images[0]
                : p.images[0].url
              : p.image || null,
          stock: p.stock
        };
      });

      state.selectedProducts = validProducts;
      state.selectedProductIds = validProducts.map((p) => p.id);
      savePersistedCompareState(state.selectedProducts);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductComparison.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.activeQuestion = action.meta.arg?.question || "";
      })
      .addCase(fetchProductComparison.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.comparisonResult = action.payload;
        state.error = null;

        // Sync selectedProducts with authoritative products returned
        if (Array.isArray(action.payload.products)) {
          state.selectedProducts = action.payload.products;
          state.selectedProductIds = action.payload.products.map((p) => p.id || p._id);
          savePersistedCompareState(state.selectedProducts);
        }
      })
      .addCase(fetchProductComparison.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to compare products.";
      });
  }
});

export const {
  addToCompare,
  removeFromCompare,
  clearCompare,
  setCompareItemsFromProducts
} = comparisonSlice.actions;

export default comparisonSlice.reducer;
