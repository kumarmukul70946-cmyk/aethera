import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "../common/Icons.jsx";

const CATEGORIES = [
  {
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Beauty",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Home & Living",
    slug: "home",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Gaming",
    slug: "gaming",
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Sports",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "More",
    slug: "all",
    isMore: true
  }
];

export default function CategoryShowcase() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            Shop by Category
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mt-0.5">
            Find What You Love
          </h2>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-neutral-200 hover:border-neutral-900 flex items-center justify-center text-neutral-700 hover:text-black transition"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-neutral-200 hover:border-neutral-900 flex items-center justify-center text-neutral-700 hover:text-black transition"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 overflow-x-auto pb-4 scrollbar-none snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((cat, idx) => (
          <Link
            key={idx}
            to={cat.isMore ? "/products" : `/products?category=${cat.slug}`}
            className="shrink-0 w-32 sm:w-36 group"
          >
            <div className="h-28 rounded-2xl bg-[#F4F4F5] border border-neutral-200/50 p-3 flex items-center justify-center group-hover:bg-neutral-200/80 transition-all duration-300 shadow-2xs group-hover:shadow-xs overflow-hidden">
              {cat.isMore ? (
                <div className="grid grid-cols-2 gap-1.5 p-2">
                  <div className="w-3.5 h-3.5 rounded bg-neutral-400 group-hover:bg-neutral-800 transition" />
                  <div className="w-3.5 h-3.5 rounded bg-neutral-400 group-hover:bg-neutral-800 transition" />
                  <div className="w-3.5 h-3.5 rounded bg-neutral-400 group-hover:bg-neutral-800 transition" />
                  <div className="w-3.5 h-3.5 rounded bg-neutral-400 group-hover:bg-neutral-800 transition" />
                </div>
              ) : (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-300"
                />
              )}
            </div>
            <p className="text-xs font-semibold text-center text-neutral-800 mt-2.5 group-hover:text-black transition">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
