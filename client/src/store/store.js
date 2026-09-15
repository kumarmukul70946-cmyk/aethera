import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/products/productSlice.js";
import authReducer from "../features/auth/authSlice.js";
import cartReducer from "../features/cart/cartSlice.js";
import wishlistReducer from "../features/wishlist/wishlistSlice.js";
import addressReducer from "../features/address/addressSlice.js";
import orderReducer from "../features/orders/orderSlice.js";
import reviewReducer from "../features/reviews/reviewSlice.js";
import recommendationReducer from "../features/recommendations/recommendationSlice.js";
import aiReducer from "../features/ai/aiSlice.js";

/**
 * Aethera Commerce Central Redux Store
 */
export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    address: addressReducer,
    orders: orderReducer,
    reviews: reviewReducer,
    recommendations: recommendationReducer,
    ai: aiReducer
  },
  devTools: process.env.NODE_ENV !== "production"
});

export default store;
