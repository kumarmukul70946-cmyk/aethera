import React from "react";
import { Link } from "react-router-dom";
import { CubeIcon, ShieldCheckIcon, TruckIcon, RotateCcwIcon } from "../common/Icons.jsx";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-20">
      {/* Perks / Guarantees Banner */}
      <div className="border-b border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <CubeIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">3D Interactive Preview</h4>
                <p className="text-xs text-slate-400">Inspect dimensions & details with WebGL</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <TruckIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Fast Global Shipping</h4>
                <p className="text-xs text-slate-400">Expedited transit with live tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Guaranteed Authenticity</h4>
                <p className="text-xs text-slate-400">100% verified genuine products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <CubeIcon className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                AETHERA COMMERCE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation e-commerce platform blending AI personalization, high-fidelity 3D previews, and premium catalog curation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-indigo-400 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?sort=popular" className="hover:text-indigo-400 transition">
                  Trending Items
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-indigo-400 transition">
                  Catalog Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/products?category=electronics" className="hover:text-indigo-400 transition">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link to="/products?category=audio" className="hover:text-indigo-400 transition">
                  High-End Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=wearables" className="hover:text-indigo-400 transition">
                  Wearables & Smartwatches
                </Link>
              </li>
              <li>
                <Link to="/products?category=gaming" className="hover:text-indigo-400 transition">
                  Gaming Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & System */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built with React 19, Redux Toolkit, Express, MongoDB, and HTTP-only JWT security cookies.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Service Online
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Aethera Commerce. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed for high performance and visual excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
