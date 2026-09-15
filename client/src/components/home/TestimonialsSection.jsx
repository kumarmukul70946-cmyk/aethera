import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { StarIcon } from "../common/Icons.jsx";

const TESTIMONIALS = [
  {
    name: "Riya Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    initials: "RS",
    role: "Verified Buyer",
    rating: 5,
    text: "Amazing quality and super fast delivery! The 3D view helped me choose the right product."
  },
  {
    name: "Arman Verma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "AV",
    role: "Verified Buyer",
    rating: 5,
    text: "Loved the shopping experience. Smooth checkout and genuine products."
  },
  {
    name: "Neha Gupta",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    initials: "NG",
    role: "Verified Buyer",
    rating: 5,
    text: "Finally a platform that makes online shopping feel real. The 3D view is a game changer!"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            What Our Customers Say
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real people. Real experiences.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition hidden sm:inline-flex items-center gap-1"
          >
            <span>View All Reviews</span>
            <span className="text-sm">→</span>
          </Link>

          {/* Nav Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition flex items-center justify-center text-xs shadow-xs"
              aria-label="Previous review"
            >
              ‹
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition flex items-center justify-center text-xs shadow-xs"
              aria-label="Next review"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 3 Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((review, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* User info row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-none mb-1">
                    {review.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-neutral-500">
                      {review.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <StarIcon key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-xs sm:text-sm text-neutral-700 font-light leading-relaxed">
                "{review.text}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
