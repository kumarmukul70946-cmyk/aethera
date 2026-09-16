import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { addItemToCart } from "../../features/cart/cartSlice.js";
import { addToWishlist, removeFromWishlist, selectWishlistItems } from "../../features/wishlist/wishlistSlice.js";
import { StarIcon, HeartIcon } from "../common/Icons.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const CURATED_FEATURED = [
  {
    id: "nike-air-max-270",
    name: "Nike Air Max 270",
    subtitle: "Heavy Cushioning Shoes",
    price: 6199,
    originalPrice: 8499,
    discount: "24% OFF",
    rating: 4.8,
    reviews: 124,
    image: "/images/prod_nike_airmax.jpg",
    slug: "nike-air-max-270"
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    subtitle: "Wireless Headphones",
    price: 24990,
    originalPrice: 26990,
    discount: "7% OFF",
    rating: 4.9,
    reviews: 892,
    image: "/images/prod_sony_headphones.jpg",
    slug: "sony-wh-1000xm5"
  },
  {
    id: "samsung-galaxy-watch-6",
    name: "Samsung Galaxy Watch 6",
    subtitle: "Smartwatch",
    price: 22399,
    originalPrice: 25999,
    discount: "11% OFF",
    rating: 4.6,
    reviews: 510,
    image: "/images/prod_galaxy_watch.jpg",
    slug: "samsung-galaxy-watch-6"
  },
  {
    id: "bleu-de-chanel-edp",
    name: "Bleu de Chanel",
    subtitle: "Eau de Parfum",
    price: 9450,
    originalPrice: 12999,
    discount: "24% OFF",
    rating: 4.7,
    reviews: 812,
    image: "/images/prod_perfume.jpg",
    slug: "bleu-de-chanel-edp"
  },
  {
    id: "elar-sauvage-chair",
    name: "Elar Savage Chair",
    subtitle: "Modern Living Accent",
    price: 8499,
    originalPrice: 14999,
    discount: "39% OFF",
    rating: 4.6,
    reviews: 922,
    image: "/images/prod_chair.jpg",
    slug: "elar-sauvage-chair"
  },
  {
    id: "xbox-wireless-controller",
    name: "Xbox Wireless",
    subtitle: "Controller",
    price: 6499,
    originalPrice: 8499,
    discount: "21% OFF",
    rating: 4.8,
    reviews: 126,
    image: "/images/prod_controller.jpg",
    slug: "xbox-wireless-controller"
  }
];

export default function FeaturedProducts() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector(selectWishlistItems) || [];
  const [addedIds, setAddedIds] = useState({});
  const [tiltMap, setTiltMap] = useState({});

  const handleCardMouseMove = (id, e) => {
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 3;
    const rotateY = ((x - centerX) / centerX) * 5;
    setTiltMap((prev) => ({ ...prev, [id]: { x: rotateX, y: rotateY } }));
  };

  const handleCardMouseLeave = (id) => {
    setTiltMap((prev) => ({ ...prev, [id]: { x: 0, y: 0 } }));
  };

  const handleAddToCart = (item) => {
    dispatch(addItemToCart({ productId: item.id, quantity: 1 }));
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const isWishlisted = (id) =>
    wishlistItems.some((item) => (item.product?._id || item.product || item._id) === id);

  const toggleWishlist = (id) => {
    if (!isAuthenticated) return;
    if (isWishlisted(id)) {
      dispatch(removeFromWishlist(id));
    } else {
      dispatch(addToWishlist(id));
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Featured Products
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Handpicked just for you.
          </p>
        </div>
        <Link
          to="/products"
          className="group text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition flex items-center gap-1.5"
        >
          <span>View All Products</span>
          <span className="text-sm btn-arrow">→</span>
        </Link>
      </div>

      {/* 6 Products Grid with Staggered Scroll Reveal & 3D Tilt */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CURATED_FEATURED.map((product, idx) => {
          const wishlisted = isWishlisted(product.id);
          const isAdded = addedIds[product.id];
          const cardTilt = tiltMap[product.id] || { x: 0, y: 0 };

          return (
            <div key={product.id} style={{ perspective: 1000 }} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  opacity: { duration: 0.7, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 0.7, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }
                }}
                animate={{
                  rotateX: cardTilt.x,
                  rotateY: cardTilt.y
                }}
                onMouseMove={(e) => handleCardMouseMove(product.id, e)}
                onMouseLeave={() => handleCardMouseLeave(product.id)}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative h-full bg-white hover:bg-white/85 hover:backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-neutral-100 hover:border-neutral-300 shadow-sm hover:shadow-lg transition-colors duration-300 flex flex-col justify-between"
              >
              {/* Wishlist Button Top Right */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:border-rose-200 transition shadow-xs"
              >
                <HeartIcon className={`w-3.5 h-3.5 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>

              {/* Product Image with depth movement */}
              <Link
                to={`/products?search=${encodeURIComponent(product.name)}`}
                style={{
                  transform: `translate3d(${cardTilt.y * 1.2}px, ${-cardTilt.x * 1.2}px, 12px)`,
                  transition: "transform 150ms ease-out"
                }}
                className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-50 flex items-center justify-center mb-3"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </Link>

              {/* Details */}
              <div className="flex flex-col flex-1">
                <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 leading-snug line-clamp-1">
                  <Link to={`/products?search=${encodeURIComponent(product.name)}`}>
                    {product.name}
                  </Link>
                </h3>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mb-1.5 font-light">
                  {product.subtitle}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-700 mb-2">
                  <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-neutral-400 text-[10px]">({product.reviews})</span>
                </div>

                {/* Price & Discount */}
                <div className="flex items-baseline gap-1.5 flex-wrap mb-3 mt-auto">
                  <span className="text-xs sm:text-sm font-bold text-neutral-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-neutral-400 line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded">
                    {product.discount}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className={`w-full py-1.5 sm:py-2 rounded-full border text-xs font-semibold transition flex items-center justify-center gap-1 shadow-xs ${
                    isAdded
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-neutral-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-800 bg-white"
                  }`}
                >
                  <span>{isAdded ? "✓ Added" : "+ Add to Cart"}</span>
                </button>
              </div>
            </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
