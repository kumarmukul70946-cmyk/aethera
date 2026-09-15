import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BRANDS = [
  {
    name: "Apple",
    svg: (
      <svg className="h-7 w-auto fill-current" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.01-6.73-10.43-12.16-22.37-16.29-35.83-4.13-13.46-6.2-26.26-6.2-38.41 0-14.74 3.73-27.18 11.19-37.33 7.46-10.15 16.92-15.35 28.37-15.6 4.99 0 10.51 1.34 16.56 4.02 6.05 2.68 10.19 4.06 12.43 4.14 1.79 0 6.09-1.4 12.89-4.19 6.81-2.8 12.42-4.04 16.85-3.73 13.06.84 23.36 5.66 30.9 14.46-11.45 6.9-17.06 16.5-16.83 28.78.23 9.61 3.91 17.7 11.03 24.26 7.12 6.57 15.48 10.27 25.07 11.11-2.14 6.72-4.94 13.62-8.41 20.69zM119.22 33.64c0-7.39 2.65-14.33 7.95-20.82 5.3-6.49 11.83-10.74 19.58-12.76 1.01 7.73-1.07 15.11-6.23 22.13-5.16 7.03-11.75 11.23-19.78 12.61-.45-.38-.96-.75-1.52-1.16z" />
      </svg>
    )
  },
  {
    name: "Nike",
    svg: (
      <svg className="h-5 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M21.707 5.293c-2.457 2.05-6.685 5.568-12.68 10.55-2.095 1.74-3.923 2.502-5.483 2.285-1.928-.268-2.544-1.905-1.848-4.912.696-3.007 2.23-5.328 4.603-6.963 1.948-1.342 3.655-1.741 5.122-1.198 1.157.428 1.836 1.258 2.037 2.49.201 1.232-.236 2.37-1.311 3.414-1.075 1.044-2.15 1.639-3.226 1.785-.859.117-1.311-.122-1.356-.717-.045-.595.275-1.295.96-2.1 1.075-1.266 1.346-2.083.813-2.45-.533-.367-1.58-.094-3.141.819-2.016 1.177-3.298 2.923-3.846 5.238-.548 2.315-.177 3.863 1.113 4.644 1.29.781 3.197.643 5.721-.414 4.793-2.008 10.158-6.143 16.096-12.406.402-.424.81-.41 1.226.042.416.452.378.86-.113 1.227z" />
      </svg>
    )
  },
  {
    name: "Samsung",
    svg: (
      <span className="font-extrabold tracking-widest text-sm text-neutral-800 uppercase px-2 py-0.5 rounded-full border border-neutral-300">
        SAMSUNG
      </span>
    )
  },
  {
    name: "Sony",
    svg: (
      <span className="font-serif font-black tracking-widest text-base text-neutral-900 uppercase">
        SONY
      </span>
    )
  },
  {
    name: "boAt",
    svg: (
      <div className="flex items-center gap-1 font-bold text-sm tracking-tight text-neutral-900">
        <span className="text-red-500 font-extrabold">b</span>
        <svg className="w-3.5 h-3.5 fill-red-500 inline" viewBox="0 0 24 24">
          <path d="M12 2L4 14h16L12 2zm0 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/>
        </svg>
        <span>oAt</span>
      </div>
    )
  },
  {
    name: "Adidas",
    svg: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M2.28 17.5l2.67-4.63 2.16 1.25-2.67 4.63H2.28zm5.72 0l4.33-7.5 2.16 1.25-4.33 7.5H8zm5.72 0l6-10.4 2.16 1.25-6 10.4h-2.16z" />
      </svg>
    )
  },
  {
    name: "Dyson",
    svg: (
      <span className="font-sans font-extrabold tracking-wider text-sm text-neutral-800 lowercase">
        dyson
      </span>
    )
  },
  {
    name: "The North Face",
    svg: (
      <div className="flex flex-col items-center leading-none">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 3.31 1.61 6.24 4.09 8.04L12 12h8c0-5.52-4.48-10-10-10z"/>
        </svg>
        <span className="text-[7px] font-bold tracking-tighter uppercase mt-0.5">THE NORTH FACE</span>
      </div>
    )
  }
];

export default function PopularBrands() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Popular Brands
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Trusted by Millions.
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition flex items-center gap-1"
        >
          <span>View All Brands</span>
          <span className="text-sm">→</span>
        </Link>
      </div>

      {/* 8 Brand Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {BRANDS.map((brand, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="h-20 bg-white rounded-2xl border border-neutral-100 shadow-xs hover:shadow-sm hover:border-neutral-300 transition flex items-center justify-center p-3 text-neutral-800 group cursor-pointer"
          >
            <div className="opacity-80 group-hover:opacity-100 transition flex items-center justify-center">
              {brand.svg}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
