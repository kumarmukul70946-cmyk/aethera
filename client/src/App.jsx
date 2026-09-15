import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import CustomerLayout from "./layouts/CustomerLayout.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";

// Lazy-loaded customer pages for code-splitting and performance
const Home = lazy(() => import("./pages/Home.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const ProductDetails = lazy(() => import("./pages/ProductDetails.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Wishlist = lazy(() => import("./pages/Wishlist.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.jsx"));
const Orders = lazy(() => import("./pages/Orders.jsx"));
const OrderDetails = lazy(() => import("./pages/OrderDetails.jsx"));
const ThreeDemo = lazy(() => import("./pages/ThreeDemo.jsx"));
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Minimal fallback loader during route transitions
function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * Root Application component.
 * Integrates Redux Provider, Error Boundary, and React Router routes.
 */
export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Customer Layout Nested Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/search" element={<Search />} />
                <Route path="/3d-demo" element={<ThreeDemo />} />
                <Route path="/3d-lab" element={<ThreeDemo />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success"
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}
