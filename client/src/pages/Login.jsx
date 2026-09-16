import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { CubeIcon, AlertCircleIcon } from "../components/common/Icons.jsx";
import GoogleSignInButton from "../components/auth/GoogleSignInButton.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customError, setCustomError] = useState("");
  const { login, googleLogin, isAuthenticated, actionLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/products";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, from, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError("");
    if (!email || !password) return;

    const result = await login({ email, password });
    if (!result.error) {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleSuccess = async (googleData) => {
    setCustomError("");
    const result = await googleLogin(googleData);
    if (!result.error) {
      navigate(from, { replace: true });
    }
  };

  const displayError = customError || error;

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200/80 p-8 sm:p-10 rounded-3xl shadow-sm">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <CubeIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 block pt-1">Account Access</span>
          <h2 className="text-3xl font-serif font-normal text-neutral-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-neutral-500">
            Sign in to access your curated orders, saved curations, and 3D studio
          </p>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
            <AlertCircleIcon className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Real Google Authentication Button */}
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={(msg) => setCustomError(msg)}
          disabled={actionLoading}
          mode="signin"
        />

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-neutral-200/80 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
            or continue with email
          </span>
          <div className="border-t border-neutral-200/80 w-full"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@aethera.com"
              className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-full px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                Password
              </label>
              <span className="text-[11px] text-neutral-400">
                Min. 8 characters
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-full px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-widest transition shadow-sm mt-3"
          >
            {actionLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-neutral-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-neutral-900 hover:text-neutral-600 font-semibold underline underline-offset-4 ml-1"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
