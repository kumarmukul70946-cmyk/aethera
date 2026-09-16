import React from "react";
import { Link } from "react-router-dom";
import { CubeIcon, ArrowRightIcon, StarIcon } from "../common/Icons.jsx";
import useParallax from "../../hooks/useParallax.js";

export default function HeroSection() {
  const { ref: heroImageRef, offsetY: heroOffset } = useParallax(16);

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-10 pb-12 sm:pb-16 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Messaging & CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 z-10">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                Discover a new way to shop
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-extrabold text-neutral-900 tracking-tight leading-[1.08]">
              Real Products.
              <br />
              <span className="underline decoration-neutral-900 decoration-3 underline-offset-8">
                Real
              </span>{" "}
              Experiences.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-neutral-600 max-w-lg leading-relaxed font-normal">
              Explore premium products with interactive 3D views, detailed insights and a
              shopping experience built for the future.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold tracking-wide transition shadow-sm"
              >
                <span>Shop Now</span>
                <span className="btn-arrow"><ArrowRightIcon className="w-4 h-4" /></span>
              </Link>

              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 text-xs sm:text-sm font-semibold transition shadow-xs"
              >
                <span>Explore Categories</span>
              </Link>
            </div>

            {/* Social Proof Metric Counters */}
            <div className="grid grid-cols-3 gap-6 pt-6 sm:pt-8 border-t border-neutral-200/80 max-w-md">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                  50K+
                </p>
                <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                  Happy Customers
                </p>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                  1M+
                </p>
                <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                  Products
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                    4.8
                  </span>
                  <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500 mb-0.5" />
                </div>
                <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                  Average Rating
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Editorial Accent and Subtle Parallax */}
          <div ref={heroImageRef} className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-neutral-100 aspect-[4/3] group border border-neutral-200/60">
              <img
                src="/images/hero_headphones.jpg"
                alt="Premium wireless headphones on stone pedestal with book"
                style={{
                  transform: `translate3d(0, ${heroOffset}px, 0)`,
                  transition: "transform 100ms ease-out"
                }}
                className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Editorial script text overlay (matching 'Good Things Take Time') */}
              <div className="absolute top-8 right-8 text-right pointer-events-none">
                <span className="font-editorial italic text-2xl sm:text-3xl text-neutral-800 font-semibold tracking-wide block drop-shadow-xs">
                  Good
                </span>
                <span className="font-editorial italic text-2xl sm:text-3xl text-neutral-800 font-semibold tracking-wide block drop-shadow-xs -mt-1">
                  Things
                </span>
                <span className="font-editorial italic text-2xl sm:text-3xl text-neutral-800 font-semibold tracking-wide block drop-shadow-xs -mt-1">
                  Take Time
                </span>
                <span className="w-12 h-[1.5px] bg-neutral-700 block ml-auto mt-2 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

