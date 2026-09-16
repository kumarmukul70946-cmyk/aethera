import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRightIcon, SparklesIcon, CubeIcon, CheckIcon } from "../common/Icons.jsx";

/**
 * CTASection
 * High-converting final call-to-action banner linking to products and 3D studio.
 */
export default function CTASection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl bg-gradient-to-tr from-indigo-950/60 via-slate-900/90 to-purple-950/50 border border-indigo-500/20 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl backdrop-blur-xl"
      >
        {/* Ambient Decorative Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline and Value Proposition */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Shape the Future of Shopping</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Experience Commerce in Three Dimensions?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Step beyond static catalogs. Inspect digital twins, explore custom material
              configurations, and enjoy seamless checkout with instant order tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Explore Full Catalog</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>

              <Link
                to="/deals"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm transition border border-slate-700/80 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Browse Deals</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Newsletter Subscription Box */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-2">
              Stay Ahead of Tech Drops
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Receive notifications for newly converted 3D assets, seasonal hardware releases, and early beta access to the AI shopping assistant.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckIcon className="w-3.5 h-3.5" />
                </div>
                <span>You're on the list! We'll keep you notified.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-indigo-600/30 active:scale-[0.99]"
                >
                  Join VIP Insider List
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Zero spam. Unsubscribe anytime with 1-click.
                </p>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
