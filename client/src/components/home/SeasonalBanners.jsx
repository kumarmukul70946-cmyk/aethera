import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useParallax from "../../hooks/useParallax.js";

export default function SeasonalBanners() {
  const { ref: summerBannerRef, offsetY: summerOffset } = useParallax(16);
  const { ref: homeBannerRef, offsetY: homeOffset } = useParallax(16);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Summer Essentials */}
        <motion.div
          ref={summerBannerRef}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="group relative overflow-hidden rounded-3xl bg-[#CFDFE8] p-8 sm:p-10 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] text-neutral-900 shadow-sm"
        >
          {/* Left Content */}
          <div className="relative z-10 max-w-[55%] flex flex-col items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
              UP TO 40% OFF
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-1.5 leading-tight">
              Summer Essentials
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 mb-6 font-light">
              Stay cool. Shop hot deals.
            </p>
            <Link
              to="/products?category=fashion"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-sm"
            >
              <span>Shop Now</span>
              <span className="text-sm btn-arrow">→</span>
            </Link>
          </div>

          {/* Right Image with subtle parallax */}
          <div className="absolute right-0 top-0 bottom-0 w-[50%] flex items-center justify-end overflow-hidden pointer-events-none">
            <img
              src="/images/promo_summer.jpg"
              alt="Summer Essentials"
              style={{
                transform: `translate3d(0, ${summerOffset}px, 0)`,
                transition: "transform 100ms ease-out"
              }}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#CFDFE8] to-transparent" />
          </div>
        </motion.div>

        {/* Card 2: Home & Living */}
        <motion.div
          ref={homeBannerRef}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="group relative overflow-hidden rounded-3xl bg-[#E8DFD5] p-8 sm:p-10 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] text-neutral-900 shadow-sm"
        >
          {/* Left Content */}
          <div className="relative z-10 max-w-[55%] flex flex-col items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
              MAKE IT YOURS
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-1.5 leading-tight">
              Home & Living
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 mb-6 font-light">
              Spaces that inspire.
            </p>
            <Link
              to="/products?category=home"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-sm"
            >
              <span>Explore Now</span>
              <span className="text-sm btn-arrow">→</span>
            </Link>
          </div>

          {/* Right Image with subtle parallax */}
          <div className="absolute right-0 top-0 bottom-0 w-[50%] flex items-center justify-end overflow-hidden pointer-events-none">
            <img
              src="/images/promo_home.jpg"
              alt="Home & Living"
              style={{
                transform: `translate3d(0, ${homeOffset}px, 0)`,
                transition: "transform 100ms ease-out"
              }}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#E8DFD5] to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
