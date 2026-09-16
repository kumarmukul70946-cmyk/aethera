import React, { useState, useEffect, useRef } from "react";
import { GoogleIcon, AlertCircleIcon, CloseIcon } from "../common/Icons.jsx";

export default function GoogleSignInButton({ onSuccess, onError, disabled, mode = "signin" }) {
  const [clientId, setClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem("aethera_google_client_id") || "";
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempClientId, setTempClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
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
            if (onError) onError(tokenResponse.error_description || "Google authorization failed");
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
      // Prompt user to enter their Google Client ID
      setShowConfigModal(true);
      return;
    }

    if (!gisLoaded || !tokenClientRef.current) {
      if (onError) onError("Google services are loading. Please try again in a moment.");
      return;
    }

    // Launch real Google OAuth popup with account selection prompt
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

    // Give it a tick to initialize and trigger
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

  return (
    <>
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

      {/* Hidden container for GIS rendered button if used */}
      <div ref={googleBtnContainerRef} className="hidden"></div>

      {/* Google Client ID Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200/90 text-neutral-900 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-neutral-900 leading-tight">
                    Google OAuth Setup
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Connect real Google Account Chooser
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

            <p className="text-xs text-neutral-600 leading-relaxed">
              To show your <strong>real Google accounts popup</strong> directly from{" "}
              <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] font-mono">accounts.google.com</code>,
              enter your Google Cloud OAuth Client ID below:
            </p>

            <form onSubmit={handleSaveClientId} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                  Google Client ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="1234567890-abc123xyz.apps.googleusercontent.com"
                  value={tempClientId}
                  onChange={(e) => setTempClientId(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] text-neutral-500 space-y-1">
                <p className="font-semibold text-neutral-700">How to get one in 1 minute:</p>
                <p>1. Go to Google Cloud Console → APIs & Services → Credentials</p>
                <p>2. Create OAuth Client ID (Web Application)</p>
                <p>3. Add Authorized JavaScript origin: <code className="font-mono text-neutral-800">http://localhost:5173</code></p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                >
                  Save & Open Google Popup
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="py-3 px-5 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-100 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
