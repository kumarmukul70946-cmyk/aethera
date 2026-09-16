import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useParallax from "../../hooks/useParallax.js";

export default function ThreeDimensionBanner() {
  const { ref: bannerRef, offsetY } = useParallax(16);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        ref={bannerRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EAE7F6] via-[#EFEBF8] to-[#F6F3FB] border border-[#E4DFFA]/60 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between min-h-[220px] shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {/* Left Content */}
        <div className="relative z-10 max-w-md text-left mb-6 md:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
            Bring Products to Life
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-light mb-6">
            View in 3D. Explore every detail. Shop with confidence.
          </p>
          <Link
            to="/3d-demo"
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-sm"
          >
            <span>Try 3D Lab</span>
            <span className="text-sm btn-arrow">→</span>
          </Link>
        </div>

        {/* Right 3D Visual with floating spheres and sneaker with subtle parallax */}
        <div className="relative w-full md:w-[48%] h-48 sm:h-56 flex items-center justify-center md:justify-end overflow-hidden">
          {/* Ambient soft glow */}
          <div className="absolute w-44 h-44 rounded-full bg-purple-300/30 blur-2xl" />

          {/* Floating sphere 1 */}
          <motion.div
            animate={{ y: [-4, 6, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-6 top-6 w-12 h-12 rounded-full bg-gradient-to-tr from-[#9B87F5] to-[#D6BCFA] shadow-md opacity-80"
          />

          {/* Floating sphere 2 */}
          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-20 bottom-4 w-8 h-8 rounded-full bg-gradient-to-tr from-[#B794F4] to-[#E9D8FD] shadow-sm opacity-70"
          />

          {/* Floating 3D Sneaker Graphic with Parallax */}
          <motion.img
            style={{
              transform: `translate3d(0, ${offsetY}px, 0)`,
              transition: "transform 100ms ease-out"
            }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            src="/images/showcase_sneaker.jpg"
            alt="3D Interactive Sneaker"
            className="relative z-10 max-h-48 w-auto object-contain drop-shadow-xl rounded-2xl cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
}

