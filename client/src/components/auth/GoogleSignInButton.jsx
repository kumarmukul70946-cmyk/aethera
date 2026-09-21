import React, { useState, useEffect, useRef } from "react";
import { GoogleIcon, AlertCircleIcon, CloseIcon } from "../common/Icons.jsx";

export default function GoogleSignInButton({ onSuccess, onError, disabled, mode = "signin", onDemoLogin = null }) {
  const [clientId, setClientId] = useState(() => {
    return localStorage.getItem("aethera_google_client_id") || import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempClientId, setTempClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [infoNotice, setInfoNotice] = useState("");
  const tokenClientRef = useRef(null);
  const googleBtnContainerRef = useRef(null);

  // Poll or check for Google Identity Services script
  useEffect(() => {
    const checkGis = () => {
      if (window.google?.accounts?.oauth2 && window.google?.accounts?.id) {
        setGisLoaded(true);
        return true;
      }
      return false;
    };

    if (!checkGis()) {
      const interval = setInterval(() => {
        if (checkGis()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // Initialize GIS when clientId and GIS script are both ready
  useEffect(() => {
    if (!gisLoaded || !clientId || !window.google?.accounts) return;

    try {
      // 1. Initialize Google ID (One Tap & rendered button)
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (response.credential) {
            setLoading(true);
            try {
              await onSuccess({ credential: response.credential });
            } catch (err) {
              if (onError) onError(err.message || "Google authentication failed");
            } finally {
              setLoading(false);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // 2. Initialize OAuth 2.0 Token Client for direct popup account chooser
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error("Google OAuth token error:", tokenResponse);
            setInfoNotice("Google blocked or closed the authorization window. See Troubleshoot guide below.");
            if (onError) onError(tokenResponse.error_description || "Google authorization failed or was blocked.");
            setLoading(false);
            return;
          }

          if (tokenResponse.access_token) {
            setLoading(true);
            try {
              // Fetch user profile from Google userinfo API
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              if (!res.ok) throw new Error("Failed to fetch Google profile");
              const profile = await res.json();

              await onSuccess({
                email: profile.email,
                name: profile.name,
                avatar: profile.picture,
                googleId: profile.sub
              });
            } catch (err) {
              console.error("Failed to complete Google sign-in:", err);
              if (onError) onError(err.message || "Failed to retrieve Google account info");
            } finally {
              setLoading(false);
            }
          }
        }
      });
    } catch (err) {
      console.error("GIS initialization error:", err);
    }
  }, [gisLoaded, clientId, onSuccess, onError]);

  const handleClick = () => {
    if (!clientId) {
      setTempClientId("");
      setShowConfigModal(true);
      return;
    }

    if (!gisLoaded || !tokenClientRef.current) {
      if (onError) onError("Google Identity Services are loading. Please try again in a moment.");
      return;
    }

    setInfoNotice("If Google displays 'Access blocked', click 'Troubleshoot' below to configure test users or authorized origins.");
    setLoading(true);
    tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleanId = tempClientId.trim();
    if (!cleanId) return;

    localStorage.setItem("aethera_google_client_id", cleanId);
    setClientId(cleanId);
    setShowConfigModal(false);
    setInfoNotice("Updated Google Client ID applied. You can now try signing in.");

    // Reinitialize token client with new Client ID
    setTimeout(() => {
      if (window.google?.accounts?.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: cleanId,
            scope: "openid email profile",
            callback: async (tokenResponse) => {
              if (tokenResponse.access_token) {
                setLoading(true);
                try {
                  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  const profile = await res.json();
                  await onSuccess({
                    email: profile.email,
                    name: profile.name,
                    avatar: profile.picture,
                    googleId: profile.sub
                  });
                } catch (err) {
                  if (onError) onError(err.message);
                } finally {
                  setLoading(false);
                }
              }
            }
          });
          tokenClientRef.current = client;
          client.requestAccessToken({ prompt: "select_account" });
        } catch (err) {
          console.error(err);
        }
      }
    }, 100);
  };

  const handleResetToDefault = () => {
    localStorage.removeItem("aethera_google_client_id");
    const defaultId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    setClientId(defaultId);
    setTempClientId(defaultId);
    setShowConfigModal(false);
    setInfoNotice("Reset Google Client ID to project default.");
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full py-3.5 px-6 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/80 text-neutral-800 font-medium text-xs tracking-wide transition shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <GoogleIcon className="w-4 h-4 shrink-0" />
        )}
        <span>
          {loading
            ? "Connecting to Google..."
            : mode === "signup"
            ? "Sign up with Google"
            : "Sign in with Google"}
        </span>
      </button>

      {/* Troubleshoot & Configuration Trigger */}
      <div className="flex items-center justify-between px-2 text-[11px] text-neutral-400">
        <button
          type="button"
          onClick={() => {
            setTempClientId(clientId);
            setShowConfigModal(true);
          }}
          className="hover:text-neutral-700 underline underline-offset-2 transition cursor-pointer flex items-center gap-1"
        >
          <span>Troubleshoot "Access blocked" / Setup Client ID</span>
        </button>
        {clientId && (
          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline" title={clientId}>
            Client ID configured
          </span>
        )}
      </div>

      {infoNotice && (
        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2">
          <AlertCircleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{infoNotice}</span>
        </div>
      )}

      {/* Hidden container for GIS rendered button if needed */}
      <div ref={googleBtnContainerRef} className="hidden"></div>

      {/* Google OAuth Troubleshoot & Client ID Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200/90 text-neutral-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 leading-tight">
                    Google OAuth Setup & Troubleshooter
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Fix "Access blocked" or configure your custom Client ID
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Why Access is Blocked Explanation */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
              <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                <AlertCircleIcon className="w-4 h-4 shrink-0" />
                Why does Google show "Access blocked"?
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>
                  <strong>OAuth App in Testing Mode:</strong> Google strictly blocks any account not listed under <strong>"Test users"</strong> in the Google Cloud Console project.
                </li>
                <li>
                  <strong>Origin Mismatch:</strong> Google requires <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono">http://localhost:5173</code> to be registered under <strong>Authorized JavaScript origins</strong>.
                </li>
                <li>
                  <strong>Shared Demo Client ID:</strong> The default client ID belongs to a shared development app whose test users list is restricted.
                </li>
              </ul>
            </div>

            {/* How to Fix in Google Cloud Console */}
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs text-neutral-700 space-y-1.5">
              <p className="font-semibold text-neutral-900">How to fix in 2 minutes:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-neutral-600">
                <li>
                  Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium">Google Cloud Console → Credentials</a>.
                </li>
                <li>
                  Create an <strong>OAuth Client ID</strong> with Application type <strong>Web Application</strong>.
                </li>
                <li>
                  Add to <strong>Authorized JavaScript origins</strong>:
                  <div className="mt-0.5 font-mono text-[10px] bg-neutral-200/60 px-2 py-1 rounded select-all text-neutral-800">
                    http://localhost:5173
                  </div>
                </li>
                <li>
                  Under <strong>OAuth consent screen → Test users</strong>, click <strong>Add Users</strong> and add your Gmail address.
                </li>
              </ol>
            </div>

            {/* Custom Client ID Form */}
            <form onSubmit={handleSaveClientId} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-neutral-500 uppercase mb-1.5">
                  Paste Your Google Client ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                  value={tempClientId}
                  onChange={(e) => setTempClientId(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                >
                  Save & Connect
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="py-3 px-4 rounded-full border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition cursor-pointer"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="py-3 px-4 rounded-full text-neutral-500 hover:text-neutral-800 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>

            {/* Quick Demo Login Option */}
            {onDemoLogin && (
              <div className="pt-3 border-t border-neutral-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Don't want to set up Google right now?
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Log in instantly with our verified pre-seeded demo account.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false);
                    onDemoLogin("customer@aethera.com", "Password123!");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition shrink-0"
                >
                  ⚡ Instant Demo Sign-In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
