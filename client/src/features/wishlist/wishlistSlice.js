import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistService from "../../services/wishlistService.js";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const wishlist = await wishlistService.getWishlist();
      return wishlist;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch wishlist");
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const wishlist = await wishlistService.addItem(productId);
      return wishlist;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to add to wishlist");
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const wishlist = await wishlistService.removeItem(productId);
      return wishlist;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to remove from wishlist");
    }
  }
);

export const moveWishlistItemToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async ({ productId, customization }, { rejectWithValue }) => {
    try {
      const result = await wishlistService.moveToCart(productId, customization);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to move item to cart");
    }
  }
);

const initialState = {
  items: [],
  itemCount: 0,
  loading: false,
  actionLoading: false,
  error: null
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.itemCount = (action.payload.products || []).length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addToWishlist
      .addCase(addToWishlist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload.products || [];
        state.itemCount = (action.payload.products || []).length;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // removeFromWishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload.products || [];
        state.itemCount = (action.payload.products || []).length;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // moveWishlistItemToCart
      .addCase(moveWishlistItemToCart.fulfilled, (state, action) => {
        state.items = action.payload.wishlist?.products || [];
        state.itemCount = (action.payload.wishlist?.products || []).length;
      });
  }
});

export const { clearWishlistError } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistItemCount = (state) => state.wishlist.itemCount;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;

export default wishlistSlice.reducer;
