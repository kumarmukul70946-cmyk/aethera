import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "../../services/orderService.js";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderPayload, { rejectWithValue }) => {
    try {
      const order = await orderService.createOrder(orderPayload);
      return order;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to place order");
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await orderService.getOrders(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch orders");
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const order = await orderService.getOrderById(id);
      return order;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch order details");
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (id, { rejectWithValue }) => {
    try {
      const order = await orderService.cancelOrder(id);
      return order;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to cancel order");
    }
  }
);

const initialState = {
  orders: [],
  selectedOrder: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  loading: false,
  detailLoading: false,
  checkoutLoading: false,
  cancelLoading: false,
  error: null,
  checkoutError: null
};

export const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
      state.checkoutError = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.selectedOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload;
      })

      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // cancelOrder
      .addCase(cancelOrder.pending, (state) => {
        state.cancelLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.selectedOrder = action.payload;
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrderError, clearSelectedOrder } = orderSlice.actions;

export const selectOrders = (state) => state.orders.orders;
export const selectSelectedOrder = (state) => state.orders.selectedOrder;
export const selectOrderPagination = (state) => state.orders.pagination;
export const selectOrderLoading = (state) => state.orders.loading;
export const selectOrderDetailLoading = (state) => state.orders.detailLoading;
export const selectCheckoutLoading = (state) => state.orders.checkoutLoading;
export const selectCheckoutError = (state) => state.orders.checkoutError;
export const selectCancelLoading = (state) => state.orders.cancelLoading;

export default orderSlice.reducer;
