import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Product } from "../models/index.js";

const EXACT_SLUG_MAP = {
  // Electronics
  "aether-corebook-pro-16": [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
  ],
  "lumina-ultraview-34-curved-monitor": [
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80"
  ],
  "apex-studio-mechanical-keyboard": [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80"
  ],
  "nova-precision-ergonomic-mouse": [
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80"
  ],

  // Mobile
  "aether-horizon-15-ultra-smartphone": [
    "/images/promo_iphone.jpg",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"
  ],
  "nova-pad-air-11-tablet": [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80"
  ],
  "vortex-magcharge-65w-wireless-station": [
    "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
  ],
  "kinesis-carbon-shield-phone-case": [
    "https://images.unsplash.com/photo-1601593346740-925612772716?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
  ],

  // Audio
  "aether-sonar-anc-headphones": [
    "/images/hero_headphones.jpg",
    "/images/prod_sony_headphones.jpg"
  ],
  "lumina-pulse-spatial-earbuds-pro": [
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80"
  ],
  "zenith-soundsphere-hi-res-speaker": [
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"
  ],
  "vortex-studio-condenser-usb-microphone": [
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=800&auto=format&fit=crop&q=80"
  ],

  // Gaming
  "apex-titan-rtx-4080-gaming-rig": [
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80"
  ],
  "vortex-phantom-wireless-pro-controller": [
    "/images/prod_controller.jpg",
    "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80"
  ],
  "kinesis-quantum-ergonomic-gaming-chair": [
    "/images/prod_chair.jpg",
    "https://images.unsplash.com/photo-1580481077195-c22ae2499d6a?w=800&auto=format&fit=crop&q=80"
  ],
  "solaria-warp-speed-1tb-nvme-ssd": [
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80"
  ],

  // Fashion
  "aether-aerotech-urban-bomber-jacket": [
    "/images/promo_streetwear.jpg",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80"
  ],
  "nova-heavyweight-oversized-hoodie": [
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80"
  ],
  "zenith-tailored-linen-chino-trousers": [
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80"
  ],
  "solaria-seamless-performance-tee": [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80"
  ],

  // Shoes
  "aether-velocity-knit-running-shoes": [
    "/images/showcase_sneaker.jpg",
    "/images/prod_nike_airmax.jpg"
  ],
  "apex-kinetic-streetwear-sneaker": [
    "/images/showcase_sneaker.jpg",
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80"
  ],
  "kinesis-alpine-hiking-boot": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80"
  ],
  "zenith-loafer-slip-on-shoes": [
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80"
  ],

  // Accessories
  "lumina-chrono-automatic-titanium-watch": [
    "/images/prod_galaxy_watch.jpg",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
  ],
  "nova-polarized-aviator-sunglasses": [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80"
  ],
  "apex-stealth-waterproof-roll-top-backpack": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80"
  ],
  "zenith-minimalist-rfid-wallet": [
    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80"
  ],

  // Home
  "aether-aura-ambient-smart-floor-lamp": [
    "/images/promo_home.jpg",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
  ],
  "zenith-ultrasonic-diffuser": [
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&auto=format&fit=crop&q=80"
  ],
  "solaria-barista-touch-espresso-machine": [
    "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
  ],
  "nova-ergonomic-electric-standing-desk": [
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80"
  ]
};

async function run() {
  await connectDB();
  const products = await Product.find({});
  console.log(`Found ${products.length} products to update with exact slugs.`);

  let updated = 0;
  for (const prod of products) {
    const slug = prod.slug.toLowerCase();
    const name = prod.name.toLowerCase();

    let newImages = EXACT_SLUG_MAP[slug];

    if (!newImages) {
      if (name.includes("mic") || name.includes("condenser")) {
        newImages = ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80"];
      } else if (name.includes("speaker") || name.includes("soundsphere")) {
        newImages = ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"];
      } else if (name.includes("headphone") || name.includes("sonar")) {
        newImages = ["/images/hero_headphones.jpg", "/images/prod_sony_headphones.jpg"];
      } else if (name.includes("earbud") || name.includes("pulse")) {
        newImages = ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"];
      } else if (name.includes("shoe") || name.includes("runner") || name.includes("marathon") || name.includes("cloud")) {
        newImages = ["/images/showcase_sneaker.jpg", "/images/prod_nike_airmax.jpg"];
      } else if (name.includes("watch")) {
        newImages = ["/images/prod_galaxy_watch.jpg"];
      } else if (name.includes("chair")) {
        newImages = ["/images/prod_chair.jpg"];
      } else if (name.includes("controller")) {
        newImages = ["/images/prod_controller.jpg"];
      } else if (name.includes("phone") || name.includes("smartphone")) {
        newImages = ["/images/promo_iphone.jpg"];
      } else if (name.includes("lamp") || name.includes("home")) {
        newImages = ["/images/promo_home.jpg"];
      } else {
        newImages = ["/images/hero_headphones.jpg", "/images/promo_streetwear.jpg"];
      }
    }

    prod.images = newImages;
    await prod.save();
    updated++;
  }

  console.log(`Successfully updated ${updated} products in database.`);
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
