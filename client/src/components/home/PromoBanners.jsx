import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: iPhone 16 Pro */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c0f2b] via-[#150a21] to-[#0e0616] p-8 sm:p-10 flex flex-col justify-between min-h-[300px] sm:min-h-[320px] text-white shadow-sm hover:shadow-xl transition"
        >
          {/* Content Left */}
          <div className="relative z-10 max-w-[55%] flex flex-col items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-2">
              NEW ARRIVAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 leading-tight">
              iPhone 16 Pro
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mb-6 font-light">
              Built for what's next.
            </p>
            <Link
              to="/products?search=iPhone"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition shadow-sm"
            >
              <span>Shop Now</span>
              <span className="text-sm">→</span>
            </Link>
          </div>

          {/* Right Product Image */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] flex items-center justify-end overflow-hidden pointer-events-none">
            <img
              src="/images/promo_iphone.jpg"
              alt="iPhone 16 Pro"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Soft edge blend gradient */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#1c0f2b] via-[#1c0f2b]/70 to-transparent" />
          </div>
        </motion.div>

        {/* Card 2: Streetwear Collection */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-3xl bg-[#EBE4DC] p-8 sm:p-10 flex flex-col justify-between min-h-[300px] sm:min-h-[320px] text-neutral-900 shadow-sm hover:shadow-xl transition"
        >
          {/* Content Left */}
          <div className="relative z-10 max-w-[55%] flex flex-col items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
              TRENDING NOW
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2 leading-tight">
              Streetwear Collection
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mb-6 font-light">
              Style that speaks you.
            </p>
            <Link
              to="/products?category=fashion"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-neutral-800 text-neutral-900 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition shadow-sm"
            >
              <span>Explore Collection</span>
              <span className="text-sm">→</span>
            </Link>
          </div>

          {/* Right Lifestyle Image */}
          <div className="absolute right-0 top-0 bottom-0 w-[52%] flex items-center justify-end overflow-hidden pointer-events-none">
            <img
              src="/images/promo_streetwear.jpg"
              alt="Streetwear Collection"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#EBE4DC] to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
