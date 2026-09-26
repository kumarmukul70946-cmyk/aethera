import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";

/**
 * Common Admin Layout framing all administrative dashboard and asset management pages.
 * Embeds the shared AdminSidebar and provides a cohesive dark-mode executive aesthetic.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row antialiased selection:bg-indigo-600 selection:text-white">
      {/* Shared Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Administrative Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
