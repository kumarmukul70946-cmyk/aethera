import React from "react";
import HeroSection from "../components/home/HeroSection.jsx";
import CategoryShowcase from "../components/home/CategoryShowcase.jsx";
import PromoBanners from "../components/home/PromoBanners.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import WhyChooseSection from "../components/home/WhyChooseSection.jsx";
import SeasonalBanners from "../components/home/SeasonalBanners.jsx";
import PopularBrands from "../components/home/PopularBrands.jsx";
import TestimonialsSection from "../components/home/TestimonialsSection.jsx";
import AppDownloadSection from "../components/home/AppDownloadSection.jsx";
import NewsletterSection from "../components/home/NewsletterSection.jsx";
import ScrollReveal from "../components/common/ScrollReveal.jsx";

/**
 * Home Page
 *
 * Implements the complete Japandi/warm-light minimalist design matching the target mockup:
 * 1. HeroSection — Headline, statistics, and high-end headphone lifestyle visual
 * 2. CategoryShowcase — 8 circular/pill category cards
 * 3. PromoBanners — iPhone 16 Pro and Streetwear Collection 2-column cards
 * 4. FeaturedProducts — 6 flagship product cards with ratings, discounts, and quick cart action
 * 5. ThreeDimensionBanner — "Bring Products to Life" 3D interactive highlight
 * 6. WhyChooseSection — 4 feature pillars and interactive 360° sneaker preview
 * 7. SeasonalBanners — Summer Essentials & Home and Living banners
 * 8. PopularBrands — 8 clean brand logo cards
 * 9. TestimonialsSection — Verified customer reviews
 * 10. AppDownloadSection — Mobile app download banner with phone mockup
 * 11. NewsletterSection — "Stay in the Loop" email subscription bar
 */
export default function Home() {
  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24 pb-20 overflow-x-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Shop By Category */}
      <ScrollReveal delay={0}>
        <CategoryShowcase />
      </ScrollReveal>

      {/* 3. Promotional Banners (iPhone 16 Pro & Streetwear) */}
      <ScrollReveal delay={40}>
        <PromoBanners />
      </ScrollReveal>

      {/* 4. Featured Products (6 items) */}
      <ScrollReveal delay={40}>
        <FeaturedProducts />
      </ScrollReveal>

      {/* 5. Why Choose Aethera */}
      <ScrollReveal delay={40}>
        <WhyChooseSection />
      </ScrollReveal>

      {/* 7. Seasonal Banners (Summer Essentials & Home Living) */}
      <ScrollReveal delay={40}>
        <SeasonalBanners />
      </ScrollReveal>

      {/* 8. Popular Brands */}
      <ScrollReveal delay={40}>
        <PopularBrands />
      </ScrollReveal>

      {/* 9. Customer Testimonials */}
      <ScrollReveal delay={40}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* 10. Mobile App Download */}
      <ScrollReveal delay={40}>
        <AppDownloadSection />
      </ScrollReveal>

      {/* 11. Stay in the Loop Newsletter */}
      <ScrollReveal delay={40}>
        <NewsletterSection />
      </ScrollReveal>
    </div>
  );
}

