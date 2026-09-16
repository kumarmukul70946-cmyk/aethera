import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { CubeIcon, AlertCircleIcon } from "../components/common/Icons.jsx";
import GoogleSignInButton from "../components/auth/GoogleSignInButton.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const { register, googleLogin, isAuthenticated, actionLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/products", { replace: true });
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const result = await register({ name, email, password });
    if (!result.error) {
      navigate("/products", { replace: true });
    }
  };

  const handleGoogleSuccess = async (googleData) => {
    setLocalError("");
    const result = await googleLogin(googleData);
    if (!result.error) {
      navigate("/products", { replace: true });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200/80 p-8 sm:p-10 rounded-3xl shadow-sm">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <CubeIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 block pt-1">Client Membership</span>
          <h2 className="text-3xl font-serif font-normal text-neutral-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-neutral-500">
            Join Aethera for bespoke shopping, saved favorites, and 3D spatial studio
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
          onError={(msg) => setLocalError(msg)}
          disabled={actionLoading}
          mode="signup"
        />

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-neutral-200/80 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
            or register with email
          </span>
          <div className="border-t border-neutral-200/80 w-full"></div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-full px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-full px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-full px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-full px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-widest transition shadow-sm mt-3"
          >
            {actionLoading ? "Creating account..." : "Register Account"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-neutral-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-neutral-900 hover:text-neutral-600 font-semibold underline underline-offset-4 ml-1"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
