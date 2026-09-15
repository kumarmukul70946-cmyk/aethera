import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../features/auth/authSlice.js";
import { fetchCategories } from "../features/products/productSlice.js";
import { fetchCart } from "../features/cart/cartSlice.js";
import { fetchWishlist } from "../features/wishlist/wishlistSlice.js";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import ShoppingAssistant from "../components/ai/ShoppingAssistant.jsx";

/**
 * Customer Layout wrapping all customer-facing routes.
 * Handles initial auth check, category loading, and cart/wishlist sync.
 */
export default function CustomerLayout() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Check if user session cookie exists
    dispatch(checkAuth());
    // Pre-fetch categories for navigation and filter bars
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ShoppingAssistant />
      <Footer />
    </div>
  );
}
