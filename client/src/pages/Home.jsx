import React from "react";
import HeroSection from "../components/home/HeroSection.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import CategoryShowcase from "../components/home/CategoryShowcase.jsx";
import TrendingProducts from "../components/home/TrendingProducts.jsx";
import ExperienceSection from "../components/home/ExperienceSection.jsx";
import CTASection from "../components/home/CTASection.jsx";
import RecommendedProducts from "../components/product/RecommendedProducts.jsx";

/**
 * Home Page (Part 11 — Immersive 3D Homepage & Part 13 — Recommendations)
 *
 * Architectural Composition:
 * 1. HeroSection — 3D interactive hero with progressive enhancement and device fallbacks
 * 2. FeaturedProducts — Curated staff-pick catalog items
 * 3. CategoryShowcase — Dynamic category cards linked to filtered listings
 * 4. TrendingProducts — High-converting, top-rated products from GET /api/products/trending
 * 5. RecommendedProducts — Personalized AI recommendations based on user interactions
 * 6. ExperienceSection — Differentiators (3D digital twins, 3D customization, AI preview)
 * 7. CTASection — Conversion banner and insider newsletter
 *
 * Notice: 3D logic, API logic, and UI components are strictly separated.
 * Each section is isolated so an individual API fault never crashes the page.
 */
export default function Home() {
  return (
    <div className="space-y-20 sm:space-y-24 lg:space-y-32 pb-20 overflow-x-hidden">
      {/* 1. Immersive 3D Hero */}
      <HeroSection />

      {/* 2. Featured Products (Staff Picks) */}
      <FeaturedProducts />

      {/* 3. Category Showcase */}
      <CategoryShowcase />

      {/* 4. Trending Products (Top Sellers) */}
      <TrendingProducts />

      {/* 5. Personalized Recommendations for Authenticated Users */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecommendedProducts
          title="Recommended for You"
          subtitle="Curated gear matching your browsing, cart, and purchase history"
          limit={4}
        />
      </div>

      {/* 6. 3D Experience Story & Differentiators */}
      <ExperienceSection />

      {/* 7. Conversion CTA & Insider Signup */}
      <CTASection />
    </div>
  );
}
