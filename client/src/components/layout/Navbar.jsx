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
    `text-sm font-medium transition ${
      isActive
        ? "text-indigo-400 font-semibold"
        : "text-slate-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 transition group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                AETHERA
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-indigo-400 uppercase -mt-1">
                Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Search
            </NavLink>
            <NavLink to="/3d-demo" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <span>3D Lab</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-sm shadow-indigo-500/30">
                  3D
                </span>
              </span>
            </NavLink>
          </nav>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-xs relative"
          >
            <input
              type="search"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon (Mobile/Tablet) */}
            <Link
              to="/search"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 lg:hidden transition"
              aria-label="Search page"
            >
              <SearchIcon className="w-5 h-5" />
            </Link>

            {/* AI Assistant Quick Trigger */}
            <button
              type="button"
              onClick={() => dispatch(openAssistant())}
              className="relative p-2 text-cyan-400 hover:text-cyan-300 rounded-xl hover:bg-slate-900 transition flex items-center gap-1.5"
              aria-label="Open AI Assistant"
              title="Aethera AI Assistant"
            >
              <SparklesIcon className="w-5 h-5 text-cyan-400" />
              <span className="hidden sm:inline text-xs font-semibold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Ask AI
              </span>
            </button>

            {/* Wishlist Link with Live Badge */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <HeartIcon className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-950">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link with Live Badge */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <CartIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-950">
                {cartCount}
              </span>
            </Link>

            {/* Authentication Section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-200 transition focus:outline-none"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-medium max-w-[80px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition mt-1 font-medium"
                    >
                      My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition font-medium"
                    >
                      My Wishlist
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition mt-1 font-medium border-t border-slate-800"
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
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white md:hidden rounded-xl hover:bg-slate-900 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 pt-3 pb-6 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="search"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          {/* Links */}
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 transition"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 transition"
            >
              All Products
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 transition"
            >
              Search Catalog
            </Link>
            <Link
              to="/3d-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:bg-slate-900 transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>3D Lab</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
                Interactive
              </span>
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 transition flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-xs font-bold text-white">
                {cartCount}
              </span>
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 transition flex items-center justify-between"
            >
              <span>Saved Wishlist</span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 transition"
              >
                My Orders
              </Link>
            )}
          </nav>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-sm font-medium rounded-xl border border-slate-800 text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-sm font-medium rounded-xl bg-indigo-600 text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
