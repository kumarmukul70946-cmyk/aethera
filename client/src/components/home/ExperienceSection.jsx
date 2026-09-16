import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CubeIcon, SparklesIcon, SlidersIcon, ArrowRightIcon } from "../common/Icons.jsx";

/**
 * ExperienceSection
 * Visual storytelling section highlighting Aethera's core differentiators:
 * 1. 3D Digital Twin Exploration
 * 2. Real-Time 3D Customization
 * 3. Next-Gen AI Concierge (clearly highlighted as Upcoming / Part 13)
 */
export default function ExperienceSection() {
  const experiences = [
    {
      id: "exploration",
      badge: "Production Ready",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      icon: <CubeIcon className="w-6 h-6 text-indigo-400" />,
      title: "Interactive 3D Product Twins",
      description:
        "Inspect flagship hardware with millimeter-accurate 360° rotation, physical zoom, and studio lighting simulation directly in your browser.",
      actionText: "Browse Catalog",
      actionLink: "/products",
      highlights: ["OrbitControls & Reset", "Studio Lighting Calibration", "Bounding Box Normalization"]
    },
    {
      id: "customization",
      badge: "Real-Time GPU",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      icon: <SlidersIcon className="w-6 h-6 text-cyan-400" />,
      title: "Real-Time 3D Customization",
      description:
        "Switch materials, fine-tune finishes, and preview bespoke hardware trims in real time without refreshing or reloading assets.",
      actionText: "Browse Catalog",
      actionLink: "/products",
      highlights: ["Live Material Swapping", "Cloned Scene Trees", "Zero-Lag State Dispatch"]
    },
    {
      id: "ai-assistant",
      badge: "Upcoming Feature",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      icon: <SparklesIcon className="w-6 h-6 text-purple-400" />,
      title: "Intelligent AI Concierge",
      description:
        "Next-generation conversational assistance, semantic product search, and automated review synthesis powered by embeddings and LLM reasoning.",
      actionText: "Roadmap Details",
      actionLink: "/products",
      highlights: ["Vector Semantic Search", "Automated Review Digests", "Smart Spec Comparison"]
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <SparklesIcon className="w-4 h-4" />
          <span>The Aethera Differentiator</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Engineered for the Modern Shopper
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
          Traditional e-commerce relies on flat 2D photography. Aethera merges
          high-fidelity WebGL graphics with modern web architecture to bring physical tactile certainty to online retail.
        </p>
      </div>

      {/* Experience Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="relative bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 group"
          >
            <div>
              {/* Header: Icon & Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {exp.icon}
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${exp.badgeColor}`}
                >
                  {exp.badge}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition">
                {exp.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                {exp.description}
              </p>

              {/* Technical Feature Bullets */}
              <ul className="space-y-2 mb-6">
                {exp.highlights.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Link */}
            <div className="pt-4 border-t border-slate-800/60">
              <Link
                to={exp.actionLink}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition group/link"
              >
                <span>{exp.actionText}</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
