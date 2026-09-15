import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../../services/cartService.js";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const cart = await cartService.getCart();
      return cart;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch cart");
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity, customization }, { rejectWithValue }) => {
    try {
      const cart = await cartService.addItem({ productId, quantity, customization });
      return cart;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to add item to cart");
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const cart = await cartService.updateItem(productId, { quantity });
      return cart;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update item quantity");
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      const cart = await cartService.removeItem(productId);
      return cart;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to remove item from cart");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const cart = await cartService.clearCart();
      return cart;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to clear cart");
    }
  }
);

const initialState = {
  items: [],
  cartSubtotal: 0,
  itemCount: 0,
  loading: false,
  actionLoading: false,
  error: null
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.cartSubtotal = action.payload.cartSubtotal || 0;
        state.itemCount = action.payload.itemCount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addItemToCart
      .addCase(addItemToCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload.items || [];
        state.cartSubtotal = action.payload.cartSubtotal || 0;
        state.itemCount = action.payload.itemCount || 0;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // updateCartItem
      .addCase(updateCartItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload.items || [];
        state.cartSubtotal = action.payload.cartSubtotal || 0;
        state.itemCount = action.payload.itemCount || 0;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // removeCartItem
      .addCase(removeCartItem.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload.items || [];
        state.cartSubtotal = action.payload.cartSubtotal || 0;
        state.itemCount = action.payload.itemCount || 0;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // clearCart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.cartSubtotal = 0;
        state.itemCount = 0;
      });
  }
});

export const { clearCartError } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartSubtotal = (state) => state.cart.cartSubtotal;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartActionLoading = (state) => state.cart.actionLoading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
