import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import addressService from "../../services/addressService.js";

export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const addresses = await addressService.getAddresses();
      return addresses;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch addresses");
    }
  }
);

export const createAddress = createAsyncThunk(
  "address/createAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const address = await addressService.createAddress(addressData);
      return address;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create address");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const address = await addressService.updateAddress(id, addressData);
      return address;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete address");
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefaultAddress",
  async (id, { rejectWithValue }) => {
    try {
      const address = await addressService.setDefaultAddress(id);
      return address;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to set default address");
    }
  }
);

const initialState = {
  addresses: [],
  selectedAddressId: null,
  loading: false,
  actionLoading: false,
  error: null
};

export const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    selectAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    },
    clearAddressError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAddresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        // Auto-select default address if none selected
        if (!state.selectedAddressId) {
          const defaultAddr = action.payload.find((a) => a.isDefault);
          state.selectedAddressId = defaultAddr ? defaultAddr._id : action.payload[0]?._id || null;
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createAddress
      .addCase(createAddress.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((a) => ({ ...a, isDefault: false }));
        }
        state.addresses.unshift(action.payload);
        state.selectedAddressId = action.payload._id;
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // updateAddress
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.addresses = state.addresses.map((a) =>
          a._id === action.payload._id ? action.payload : a
        );
      })

      // deleteAddress
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = state.addresses[0]?._id || null;
        }
      })

      // setDefaultAddress
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isDefault: a._id === action.payload._id
        }));
        state.selectedAddressId = action.payload._id;
      });
  }
});

export const { selectAddress, clearAddressError } = addressSlice.actions;

export const selectAddresses = (state) => state.address.addresses;
export const selectSelectedAddressId = (state) => state.address.selectedAddressId;
export const selectAddressLoading = (state) => state.address.loading;
export const selectAddressActionLoading = (state) => state.address.actionLoading;

export default addressSlice.reducer;
