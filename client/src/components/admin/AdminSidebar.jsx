import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { CubeIcon } from "../common/Icons.jsx";

/**
 * Modern Admin Navigation Sidebar for administrative workspace.
 */
export default function AdminSidebar() {
  const { user } = useAuth();

  const navItems = [
    {
      name: "Dashboard & Insights",
      path: "/admin",
      exact: true,
      icon: "📊",
      badge: "AI Powered"
    },
    {
      name: "Media & 3D Assets",
      path: "/admin/assets",
      icon: "📦",
      badge: "Cloudinary"
    },
    {
      name: "Live Catalog",
      path: "/products",
      icon: "🛍️"
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-neutral-950/80 border-b lg:border-b-0 lg:border-r border-white/5 backdrop-blur-2xl flex flex-col justify-between shrink-0 p-4 lg:p-6 min-h-[auto] lg:min-h-screen">
      <div>
        {/* Brand / Admin Header */}
        <div className="flex items-center justify-between lg:justify-start gap-3 pb-6 border-b border-white/5 mb-6">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <CubeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                AETHERA
              </span>
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase -mt-0.5 block">
                Admin Suite
              </span>
            </div>
          </Link>
          <span className="lg:hidden text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Admin
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60 border border-transparent"
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="hidden lg:block pt-6 border-t border-white/5">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/50 border border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-neutral-400 font-mono truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            title="Return to Customer Storefront"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition text-xs"
          >
            ↗
          </Link>
        </div>
      </div>
    </aside>
  );
}
