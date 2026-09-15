/**
 * Redux selectors for the product domain.
 */
export const selectProducts = (state) => state.products.products;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectCategories = (state) => state.products.categories;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectTrendingProducts = (state) => state.products.trendingProducts;
export const selectPagination = (state) => state.products.pagination;
export const selectAvailableBrands = (state) => state.products.availableBrands;
export const selectPriceRange = (state) => state.products.priceRange;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductDetailLoading = (state) => state.products.detailLoading;
export const selectProductsError = (state) => state.products.error;
export const selectProductDetailError = (state) => state.products.detailError;
