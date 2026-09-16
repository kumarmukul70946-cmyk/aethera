import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../features/products/productSlice.js";
import { selectCategories, selectProductsLoading } from "../features/products/productSelectors.js";
import { productService } from "../services/productService.js";
import { formatCurrency } from "../utils/formatters.js";
import { ArrowRightIcon, CubeIcon, SparklesIcon } from "../components/common/Icons.jsx";

// Curated luxury Japandi category imagery map
const CATEGORY_MEDIA = {
  electronics: {
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
    tagline: "Computing & Visual Displays",
    accent: "bg-stone-100 text-stone-800"
  },
  mobile: {
    image: "/images/promo_iphone.jpg",
    tagline: "Spatial Devices & Smart Power",
    accent: "bg-neutral-100 text-neutral-800"
  },
  audio: {
    image: "/images/hero_headphones.jpg",
    tagline: "Acoustic Fidelity & ANC Digital Twins",
    accent: "bg-zinc-100 text-zinc-800"
  },
  gaming: {
    image: "/images/prod_controller.jpg",
    tagline: "Battlestations & Precision Controls",
    accent: "bg-slate-100 text-slate-800"
  },
  fashion: {
    image: "/images/promo_streetwear.jpg",
    tagline: "Technical Apparel & Minimalist Outerwear",
    accent: "bg-stone-100 text-stone-800"
  },
  shoes: {
    image: "/images/showcase_sneaker.jpg",
    tagline: "Supercritical Foam & Bespoke Runners",
    accent: "bg-neutral-100 text-neutral-800"
  },
  footwear: {
    image: "/images/prod_nike_airmax.jpg",
    tagline: "Handcrafted Sneakers & Trail Boots",
    accent: "bg-zinc-100 text-zinc-800"
  },
  accessories: {
    image: "/images/prod_galaxy_watch.jpg",
    tagline: "Titanium Timepieces & Everyday Carry",
    accent: "bg-neutral-100 text-neutral-800"
  },
  home: {
    image: "/images/promo_home.jpg",
    tagline: "Atmospheric Lighting & Living Pieces",
    accent: "bg-stone-100 text-stone-800"
  }
};

export default function Categories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectProductsLoading);

  const [activeCategorySlug, setActiveCategorySlug] = useState("");
  const [previewProducts, setPreviewProducts] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Set default active category for preview once loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategorySlug) {
      setActiveCategorySlug(categories[0].slug);
    }
  }, [categories, activeCategorySlug]);

  // Fetch top 4 preview products when active category changes
  useEffect(() => {
    if (!activeCategorySlug) return;
    let isCancelled = false;

    if (previewProducts[activeCategorySlug]) {
      return;
    }

    setPreviewLoading(true);
    productService
      .getProducts({ category: activeCategorySlug, limit: 4 })
      .then((data) => {
        if (!isCancelled) {
          setPreviewProducts((prev) => ({
            ...prev,
            [activeCategorySlug]: data.products || []
          }));
        }
      })
      .catch((err) => console.warn("[Categories] Preview load failed:", err.message))
      .finally(() => {
        if (!isCancelled) setPreviewLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeCategorySlug, previewProducts]);

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const currentPreview = previewProducts[activeCategorySlug] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-neutral-200/80 mb-10 gap-6">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
            Curated Departments
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-neutral-900 tracking-tight mt-1.5">
            Explore Categories
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl mt-2 leading-relaxed">
            Browse our collections organized by specialty — from precision acoustic audio and computational hardware to minimalist apparel and living spaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
          >
            All Products ({categories.reduce((acc, c) => acc + (c.productCount || 0), 0)})
          </Link>
          <Link
            to="/deals"
            className="px-6 py-3 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider transition"
          >
            View Deals
          </Link>
        </div>
      </div>

      {/* Quick Jump Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => setActiveCategorySlug(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategorySlug === cat.slug
                ? "bg-neutral-900 text-white shadow-xs font-semibold"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
            }`}
          >
            {cat.name}
            {typeof cat.productCount === "number" && (
              <span className={`ml-1.5 text-[10px] ${activeCategorySlug === cat.slug ? "text-neutral-300" : "text-neutral-400"}`}>
                ({cat.productCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
        {categories.map((cat) => {
          const media =
            CATEGORY_MEDIA[cat.slug.toLowerCase()] ||
            CATEGORY_MEDIA[cat.slug.split("-")[0].toLowerCase()] || {
              image: cat.image || "/images/hero_headphones.jpg",
              tagline: "Curated Specialty Collection",
              accent: "bg-neutral-100 text-neutral-800"
            };

          const isSelected = activeCategorySlug === cat.slug;

          return (
            <div
              key={cat._id}
              onClick={() => setActiveCategorySlug(cat.slug)}
              className={`group cursor-pointer bg-white border rounded-3xl overflow-hidden p-4 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
                isSelected
                  ? "border-neutral-900 ring-2 ring-neutral-900/10"
                  : "border-neutral-200/80 hover:border-neutral-300"
              }`}
            >
              <div>
                {/* Category Image */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF9F6] mb-4">
                  <img
                    src={media.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-neutral-800 shadow-xs">
                    {cat.productCount || 0} Pieces
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1.5 px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    {media.tagline}
                  </span>
                  <h3 className="font-serif text-xl font-normal text-neutral-900 group-hover:text-neutral-700 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {cat.description || "Discover exclusive releases and premium lifestyle essentials."}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900 group-hover:underline">
                  Browse Catalog
                </span>
                <Link
                  to={`/products?category=${cat.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-neutral-900 group-hover:bg-neutral-800 text-white flex items-center justify-center shadow-xs transition"
                  aria-label={`Browse all ${cat.name}`}
                >
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Spotlight / Live Preview Section */}
      {activeCategory && (
        <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-neutral-100 gap-4">
            <div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
                Spotlight Department
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900 mt-1">
                {activeCategory.name} Collection
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-lg">
                {activeCategory.description}
              </p>
            </div>

            <Link
              to={`/products?category=${activeCategory.slug}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition self-start sm:self-auto shadow-sm"
            >
              <span>View All {activeCategory.name}</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {previewLoading && currentPreview.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-neutral-400">Loading {activeCategory.name} pieces...</p>
            </div>
          ) : currentPreview.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              No products found in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {currentPreview.map((product) => {
                const productUrl = product.slug ? `/product/${product.slug}` : `/products/${product._id}`;
                const imgUrl =
                  product.images?.[0] && typeof product.images[0] === "string"
                    ? product.images[0]
                    : product.images?.[0]?.url;

                return (
                  <Link
                    key={product._id}
                    to={productUrl}
                    className="group bg-[#FAF9F6] border border-neutral-200/70 hover:border-neutral-300 rounded-2xl p-3.5 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square bg-white rounded-xl overflow-hidden mb-3 flex items-center justify-center relative">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <span className="text-2xl">✨</span>
                        )}
                        {product.discount > 0 && (
                          <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                        {product.brand}
                      </span>
                      <h4 className="text-xs font-medium text-neutral-900 truncate mt-0.5 group-hover:text-neutral-600">
                        {product.name}
                      </h4>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-neutral-200/60 flex items-center justify-between">
                      <span className="text-sm font-serif font-medium text-neutral-900">
                        {formatCurrency(product.finalPrice || product.price)}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-700 group-hover:underline">
                        Details →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
