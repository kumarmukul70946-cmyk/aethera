import React, { useEffect, useState } from "react";
import api from "../services/api.js";

/**
 * HomePage Component for Part 1: Project Initialization.
 * Displays the core project heading, description, and verifies backend API connectivity.
 */
export default function HomePage() {
  const [apiStatus, setApiStatus] = useState({
    loading: true,
    data: null,
    error: null
  });

  useEffect(() => {
    // Verify communication with backend GET /api/health
    api
      .get("/health")
      .then((res) => {
        setApiStatus({
          loading: false,
          data: res.data,
          error: null
        });
      })
      .catch((err) => {
        setApiStatus({
          loading: false,
          data: null,
          error: err.message || "Failed to reach backend"
        });
      });
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient decorative glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl w-full text-center space-y-8 z-10">
        {/* Core required titles */}
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 shadow-inner">
            Part 1: Foundational Architecture
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Aethera Commerce
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-cyan-200/90 tracking-wide max-w-2xl mx-auto">
            AI-Powered E-Commerce with Immersive 3D Shopping
          </p>
        </div>

        {/* Informational Card & API Health Check */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl text-left space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-semibold text-slate-300">Backend API Verification</span>
            <span className="text-xs font-mono text-slate-400">GET /api/health</span>
          </div>

          <div className="flex items-center gap-3">
            {apiStatus.loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>Connecting to backend API...</span>
              </div>
            ) : apiStatus.error ? (
              <div className="flex items-center gap-2 text-sm text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>API Offline: {apiStatus.error} (Ensure backend server is running on port 5000)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>{apiStatus.data?.message || "Connected to Aethera Server"}</span>
              </div>
            )}
          </div>

          <div className="pt-2 text-xs text-slate-400 border-t border-slate-800/60 flex justify-between items-center">
            <span>Client: Vite + React</span>
            <span>State: Redux Toolkit</span>
            <span>Style: Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
