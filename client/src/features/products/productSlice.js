import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/productService.js";

// Async thunk to fetch catalog products with filters
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params, { rejectWithValue }) => {
    try {
      const data = await productService.getProducts(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

// Async thunk to fetch single product by slug
export const fetchProductBySlug = createAsyncThunk(
  "products/fetchProductBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const product = await productService.getProductBySlug(slug);
      return product;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch product details");
    }
  }
);

// Async thunk to fetch single product by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const product = await productService.getProductById(id);
      return product;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch product details");
    }
  }
);

// Async thunk to fetch all categories
export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await productService.getCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch categories");
    }
  }
);

// Async thunk to fetch featured products
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await productService.getFeaturedProducts(params);
      return data.products || [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch featured products");
    }
  }
);

// Async thunk to fetch trending products
export const fetchTrendingProducts = createAsyncThunk(
  "products/fetchTrendingProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await productService.getTrendingProducts(params);
      return data.products || [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch trending products");
    }
  }
);

const initialState = {
  products: [],
  selectedProduct: null,
  categories: [],
  featuredProducts: [],
  trendingProducts: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  },
  availableBrands: [],
  priceRange: { min: 0, max: 200000 },
  loading: false,
  detailLoading: false,
  error: null,
  detailError: null
};

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.detailError = null;
    },
    clearProductError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
        if (action.payload.brands) {
          state.availableBrands = action.payload.brands;
        }
        if (action.payload.priceRange) {
          state.priceRange = action.payload.priceRange;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchProductBySlug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // fetchCategories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload || [];
      })

      // fetchFeaturedProducts
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })

      // fetchTrendingProducts
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.trendingProducts = action.payload;
      });
  }
});

export const { clearSelectedProduct, clearProductError } = productSlice.actions;
export default productSlice.reducer;
