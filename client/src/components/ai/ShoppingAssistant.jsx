import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth.js";
import {
  sendChatMessage,
  fetchAiSessions,
  loadAiSession,
  deleteAiSession,
  toggleAssistant,
  openAssistant,
  closeAssistant,
  startNewChat,
  clearError
} from "../../features/ai/aiSlice.js";
import {
  selectAiIsOpen,
  selectAiActiveSessionId,
  selectAiMessages,
  selectAiSessions,
  selectAiIsLoading,
  selectAiSessionsLoading,
  selectAiError
} from "../../features/ai/aiSelectors.js";
import ChatMessage from "./ChatMessage.jsx";
import ChatInput from "./ChatInput.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

/**
 * Main grounded AI Shopping Assistant widget.
 * Features a persistent floating action button and an interactive slide-over drawer.
 */
export default function ShoppingAssistant() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isOpen = useSelector(selectAiIsOpen);
  const activeSessionId = useSelector(selectAiActiveSessionId);
  const messages = useSelector(selectAiMessages);
  const sessions = useSelector(selectAiSessions);
  const isLoading = useSelector(selectAiIsLoading);
  const sessionsLoading = useSelector(selectAiSessionsLoading);
  const error = useSelector(selectAiError);

  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, showHistory]);

  // Fetch session history when opening the history tab
  useEffect(() => {
    if (isOpen && showHistory && isAuthenticated) {
      dispatch(fetchAiSessions());
    }
  }, [isOpen, showHistory, isAuthenticated, dispatch]);

  const handleSend = (text) => {
    if (!isAuthenticated) return;
    dispatch(
      sendChatMessage({
        message: text,
        sessionId: activeSessionId
      })
    );
  };

  const handleSelectSession = (sessionId) => {
    dispatch(loadAiSession(sessionId));
    setShowHistory(false);
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    dispatch(deleteAiSession(sessionId));
  };

  const handleStartNewChat = () => {
    dispatch(startNewChat());
    setShowHistory(false);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => dispatch(toggleAssistant())}
          className="relative group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-neutral-900 text-white font-medium shadow-xl hover:bg-neutral-800 border border-neutral-800 transition-all duration-300"
          aria-label="Open AI Shopping Assistant"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>

          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>

          <span className="text-xs font-semibold uppercase tracking-wider">
            Ask Aethera AI
          </span>
        </motion.button>
      </div>

      {/* Slide-Over Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeAssistant())}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Chat Drawer Container */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 right-0 top-0 md:top-6 md:bottom-6 md:right-6 w-full md:w-[440px] md:max-h-[calc(100vh-3rem)] z-50 flex flex-col bg-white border border-neutral-200/90 md:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-normal text-neutral-900 flex items-center gap-2">
                      Aethera Concierge
                      <span className="text-[10px] font-semibold font-sans px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                        Live Catalog
                      </span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Grounded in real-time inventory & verified reviews
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isAuthenticated && (
                    <>
                      {/* Toggle Sessions History */}
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        title={showHistory ? "Back to Chat" : "Chat History"}
                        className={`p-2 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors ${
                          showHistory ? "bg-neutral-100 text-neutral-900" : "hover:bg-neutral-100"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>

                      {/* New Chat Button */}
                      <button
                        onClick={handleStartNewChat}
                        title="Start New Chat"
                        className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Close Drawer */}
                  <button
                    onClick={() => dispatch(closeAssistant())}
                    title="Close"
                    className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]">
                {/* Session History View */}
                {showHistory ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Previous Conversations
                      </h4>
                      <button
                        onClick={handleStartNewChat}
                        className="text-xs text-neutral-900 hover:underline font-medium"
                      >
                        + New Chat
                      </button>
                    </div>

                    {sessionsLoading ? (
                      <div className="text-center py-8 text-xs text-neutral-400">
                        Loading conversations...
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-8 text-xs text-neutral-400">
                        No previous conversations found.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sessions.map((s) => (
                          <div
                            key={s._id}
                            onClick={() => handleSelectSession(s._id)}
                            className={`group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
                              activeSessionId === s._id
                                ? "bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-sm"
                                : "bg-white border-neutral-200/80 hover:border-neutral-300 text-neutral-800 shadow-sm"
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-semibold truncate text-neutral-900">
                                {s.title || "Chat Session"}
                              </p>
                              <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                                {s.lastMessage || `${s.messageCount} messages`}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteSession(e, s._id)}
                              title="Delete Session"
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-all"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Empty State / Welcome Screen */}
                    {messages.length === 0 && (
                      <div className="text-center py-8 px-2">
                        <div className="w-14 h-14 mx-auto rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mb-3.5 shadow-sm">
                          <svg
                            className="w-7 h-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                            />
                          </svg>
                        </div>
                        <h4 className="text-lg font-serif font-normal text-neutral-900 mb-1">
                          Welcome to Aethera Concierge
                        </h4>
                        <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed mb-5">
                          Explore verified inventory, compare materials, check stock, and analyze AI-synthesized reviews.
                        </p>

                        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 text-left max-w-xs mx-auto space-y-1.5 shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                            <span>🛡️</span> Grounded Intelligence
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-normal">
                            All responses and pricing reflect actual MongoDB Atlas database records. No synthetic hallucinations.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Messages Flow */}
                    {messages.map((msg, index) => (
                      <ChatMessage key={index} message={msg} />
                    ))}

                    {/* Typing / Loading indicator */}
                    {isLoading && <TypingIndicator />}

                    {/* Error Banner */}
                    {error && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between font-medium">
                        <span>{error}</span>
                        <button
                          onClick={() => dispatch(clearError())}
                          className="text-rose-500 hover:text-rose-800 font-bold ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Drawer Footer / Input Box */}
              {!isAuthenticated ? (
                <div className="p-5 border-t border-neutral-100 bg-white text-center">
                  <p className="text-xs text-neutral-500 mb-3">
                    Sign in to chat with our grounded AI and preserve your conversations.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: location }}
                    onClick={() => dispatch(closeAssistant())}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-neutral-800 transition-all"
                  >
                    Sign In to Continue
                  </Link>
                </div>
              ) : (
                <ChatInput
                  onSend={handleSend}
                  isLoading={isLoading}
                  disabled={showHistory}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
