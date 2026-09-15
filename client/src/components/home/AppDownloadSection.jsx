import React from "react";
import { motion } from "framer-motion";

export default function AppDownloadSection() {
  const perks = [
    {
      icon: (
        <svg className="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      text: "Exclusive App Deals"
    },
    {
      icon: (
        <svg className="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      text: "Faster Checkout"
    },
    {
      icon: (
        <svg className="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      text: "Order Tracking"
    },
    {
      icon: (
        <svg className="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      text: "Personalized Recommendations"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EEF2FC] via-[#F1F4FD] to-[#F6F4FD] border border-[#E3E8FA] p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (5 cols): Download Info */}
          <div className="lg:col-span-5 flex flex-col items-start z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight mb-3">
              Shop Anytime,
              <br />
              Anywhere
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-light mb-8 max-w-sm leading-relaxed">
              Download the Aethera app for a faster, smoother and more personalized experience.
            </p>

            {/* App Store & Google Play Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#download"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 transition shadow-sm"
              >
                {/* Apple icon */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.01-6.73-10.43-12.16-22.37-16.29-35.83-4.13-13.46-6.2-26.26-6.2-38.41 0-14.74 3.73-27.18 11.19-37.33 7.46-10.15 16.92-15.35 28.37-15.6 4.99 0 10.51 1.34 16.56 4.02 6.05 2.68 10.19 4.06 12.43 4.14 1.79 0 6.09-1.4 12.89-4.19 6.81-2.8 12.42-4.04 16.85-3.73 13.06.84 23.36 5.66 30.9 14.46-11.45 6.9-17.06 16.5-16.83 28.78.23 9.61 3.91 17.7 11.03 24.26 7.12 6.57 15.48 10.27 25.07 11.11-2.14 6.72-4.94 13.62-8.41 20.69zM119.22 33.64c0-7.39 2.65-14.33 7.95-20.82 5.3-6.49 11.83-10.74 19.58-12.76 1.01 7.73-1.07 15.11-6.23 22.13-5.16 7.03-11.75 11.23-19.78 12.61-.45-.38-.96-.75-1.52-1.16z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="block text-[8px] text-neutral-400 font-medium">Download on the</span>
                  <span className="block text-xs font-bold text-white mt-0.5">App Store</span>
                </div>
              </a>

              <a
                href="#download"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 transition shadow-sm"
              >
                {/* Play store icon */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.944 1.944 0 01-.61-1.424V3.238c0-.533.226-1.037.609-1.424zM15.207 13.414l2.586 2.586-11.9 6.84 9.314-9.426zm0-2.828L5.893 1.16l11.9 6.84-2.586 2.586zm1.414 1.414l3.586-2.062a1.5 1.5 0 010 2.538L16.62 12z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="block text-[8px] text-neutral-400 font-medium">GET IT ON</span>
                  <span className="block text-xs font-bold text-white mt-0.5">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Center Column (4 cols): Smartphone Mockup */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <motion.div
              whileHover={{ rotate: 0, scale: 1.03 }}
              initial={{ rotate: 3 }}
              transition={{ duration: 0.3 }}
              className="relative w-48 sm:w-56 shadow-2xl rounded-[2.5rem] p-2 bg-neutral-900 border-4 border-neutral-800/80 ring-1 ring-neutral-700/50"
            >
              <div className="w-full h-80 sm:h-96 rounded-[2rem] overflow-hidden bg-white">
                <img
                  src="/images/mobile_app_mockup.jpg"
                  alt="Aethera Mobile App"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column (3 cols): 4 Perk Checklist */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 border border-neutral-200/80 shadow-xs">
                  {perk.icon}
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-800">
                  {perk.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
