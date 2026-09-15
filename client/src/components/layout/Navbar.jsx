import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth.js";
import { selectCartItemCount } from "../../features/cart/cartSlice.js";
import { selectWishlistItemCount } from "../../features/wishlist/wishlistSlice.js";
import { openAssistant } from "../../features/ai/aiSlice.js";
import {
  SearchIcon,
  CartIcon,
  HeartIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  SparklesIcon,
  CubeIcon
} from "../common/Icons.jsx";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, logout } = useAuth();

  const cartCount = useSelector(selectCartItemCount);
  const wishlistCount = useSelector(selectWishlistItemCount);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs font-medium tracking-wide transition ${
      isActive
        ? "text-neutral-900 font-semibold"
        : "text-neutral-500 hover:text-neutral-900"
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-neutral-200/70 transition shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group focus:outline-none rounded-lg shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
              <CubeIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-neutral-900">
                AETHERA
              </span>
              <span className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase -mt-1">
                Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Categories
            </NavLink>
            <NavLink to="/3d-demo" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <span>3D Lab</span>
              </span>
            </NavLink>
            <NavLink to="/products?discount=true" className={navLinkClass}>
              Deals
            </NavLink>
          </nav>

          {/* Search Bar (Center Pill) */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-sm hidden sm:flex items-center relative"
          >
            <SearchIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="search"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="w-full bg-neutral-100/90 hover:bg-neutral-100 focus:bg-white border border-neutral-200/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition"
            />
          </form>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* AI Assistant Quick Trigger */}
            <button
              type="button"
              onClick={() => dispatch(openAssistant())}
              className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/60 rounded-full transition flex items-center gap-1 text-xs font-semibold"
              title="Aethera AI Assistant"
            >
              <SparklesIcon className="w-4 h-4 text-indigo-600" />
              <span className="hidden xl:inline text-[11px]">AI Assistant</span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative flex items-center gap-1.5 py-1.5 px-2 text-neutral-600 hover:text-neutral-900 rounded-lg transition text-xs font-medium"
              title="Saved Wishlist"
            >
              <HeartIcon className="w-4 h-4" />
              <span className="hidden md:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-neutral-900 text-[10px] font-bold text-white flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 py-1.5 px-2 text-neutral-600 hover:text-neutral-900 rounded-lg transition text-xs font-medium"
              title="Shopping Cart"
            >
              <div className="relative">
                <CartIcon className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                  {cartCount}
                </span>
              </div>
              <span className="hidden md:inline ml-1">Cart</span>
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 hover:bg-neutral-200 transition focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] truncate hidden md:inline pr-1">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-neutral-200 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="text-[10px] text-neutral-400">Signed in as</p>
                      <p className="font-semibold text-neutral-800 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-xl transition mt-1"
                    >
                      My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-xl transition"
                    >
                      My Wishlist
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition mt-1 font-medium border-t border-neutral-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-neutral-700 hover:text-black px-2.5 py-1.5 rounded-full transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold transition shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-neutral-700 hover:text-black rounded-lg lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200/80 py-4 px-2 space-y-3 bg-white">
            <form onSubmit={handleSearchSubmit} className="flex sm:hidden items-center relative mb-3">
              <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
              <input
                type="search"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-neutral-100 border border-neutral-200 rounded-full pl-9 pr-4 py-2 text-xs text-neutral-800 placeholder-neutral-400"
              />
            </form>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-100"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-100"
              >
                Products
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-100"
              >
                Categories
              </Link>
              <Link
                to="/3d-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-100"
              >
                3D Lab
              </Link>
              <Link
                to="/products?discount=true"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-100"
              >
                Deals
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
