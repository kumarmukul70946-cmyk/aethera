import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useParallax from "../../hooks/useParallax.js";

export default function WhyChooseSection() {
  const [activeAngle, setActiveAngle] = useState(0);
  const { ref: previewRef, offsetY } = useParallax(16);

  const angleImages = [
    "/images/showcase_sneaker.jpg",
    "/images/prod_nike_airmax.jpg",
    "/images/showcase_sneaker.jpg"
  ];

  const features = [
    {
      icon: (
        <svg className="w-5 h-5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m9-5.25v-9" />
        </svg>
      ),
      title: "Curated Quality",
      desc: "Authentic premium goods"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75m0 3.75h3.75m-3.75 0H7.5" />
        </svg>
      ),
      title: "Fast & Reliable",
      desc: "Pan-India delivery"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: "Secure Payments",
      desc: "100% safe & encrypted"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      ),
      title: "24/7 Support",
      desc: "We're always here"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column (5 cols): Title & 4 Feature Badges */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
            WHY CHOOSE AETHERA
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight mb-8">
            More Than Shopping.
            <br />
            A Better Experience.
          </h2>

          {/* 2x2 Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-0.5">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-neutral-500 font-light">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 cols): 3D Sneaker Showcase Card with subtle parallax */}
        <div ref={previewRef} className="lg:col-span-6">
          <div className="relative rounded-3xl bg-[#F3F3F5] border border-neutral-200/70 p-6 sm:p-8 flex items-center justify-center min-h-[340px] sm:min-h-[380px] shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Angle Preview Thumbnails on the left */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-10">
              {angleImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveAngle(i)}
                  className={`w-11 h-11 rounded-xl overflow-hidden bg-white border p-1 transition shadow-xs ${
                    activeAngle === i
                      ? "border-neutral-900 scale-105"
                      : "border-neutral-200 hover:border-neutral-400 opacity-70"
                  }`}
                >
                  <img src={src} alt={`Angle ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Centered Sneaker Angle Visual */}
            <motion.div
              key={activeAngle}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                transform: `translate3d(0, ${offsetY}px, 0)`,
                transition: "transform 100ms ease-out"
              }}
              className="w-full max-w-sm flex items-center justify-center pl-10"
            >
              <img
                src={angleImages[activeAngle]}
                alt="3D Sneaker Interactive"
                className="w-full h-auto max-h-64 object-contain drop-shadow-lg"
              />
            </motion.div>

            {/* Bottom-left: Featured badge */}
            <div className="absolute bottom-5 left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 text-xs font-bold text-neutral-800 shadow-xs">
              <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <span>Featured</span>
            </div>

            {/* Bottom-right: Explore Products button */}
            <Link
              to="/products"
              className="group absolute bottom-5 right-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-neutral-900 border border-neutral-200 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition shadow-sm"
            >
              <span>Explore Products</span>
              <span className="text-sm btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

