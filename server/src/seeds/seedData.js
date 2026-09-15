/**
 * Seed data for Aethera Commerce.
 * Contains 8 core categories and 32 realistic products with rich attributes,
 * specifications, discounts, and placeholder 3D model references.
 */

export const categoriesData = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "High-performance laptops, ultra-crisp monitors, and modern computing peripherals.",
    image: "/images/categories/electronics.jpg"
  },
  {
    name: "Mobile",
    slug: "mobile",
    description: "Next-generation smartphones, ultra-thin tablets, and premium charging accessories.",
    image: "/images/categories/mobile.jpg"
  },
  {
    name: "Audio",
    slug: "audio",
    description: "Audiophile-grade ANC headphones, spatial earbuds, and hi-res sound systems.",
    image: "/images/categories/audio.jpg"
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Immersive desktop battlestations, magnetic hall-effect controllers, and high-performance gaming gear.",
    image: "/images/categories/gaming.jpg"
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Contemporary techwear, heavyweight minimal essentials, and all-weather outer garments.",
    image: "/images/categories/fashion.jpg"
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Supercritical cushioned running shoes, handcrafted leather sneakers, and alpine boots.",
    image: "/images/categories/shoes.jpg"
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Grade-2 titanium watches, polarized eyewear, and waterproof utilitarian backpacks.",
    image: "/images/categories/accessories.jpg"
  },
  {
    name: "Home",
    slug: "home",
    description: "Ambient smart lighting, dual-thermojet espresso machines, and motorized ergonomic desks.",
    image: "/images/categories/home.jpg"
  }
];

export const productsData = [
  // ── 1. Electronics ──────────────────────────────────────────────────────────
  {
    name: "Aether Corebook Pro 16",
    slug: "aether-corebook-pro-16",
    categorySlug: "electronics",
    brand: "Aether",
    price: 129999,
    discount: 10,
    finalPrice: 116999,
    description: "Flagship 16-inch creator laptop powered by an advanced octa-core processor and brilliant 3.2K Mini-LED display.",
    images: ["/images/products/corebook-1.jpg", "/images/products/corebook-2.jpg"],
    model3D: "/models/products/aether-corebook-pro.glb",
    colors: ["Space Gray", "Silver", "Midnight Blue"],
    sizes: ["16-inch"],
    specifications: {
      "Processor": "Octa-Core M3 Architecture",
      "RAM": "32GB Unified Memory",
      "Storage": "1TB NVMe Gen4 SSD",
      "Display": "16-inch 3.2K 120Hz Mini-LED",
      "Battery": "99.6Wh Up to 18 Hours"
    },
    stock: 25,
    rating: 4.8,
    reviewCount: 42,
    tags: ["laptop", "ultrabook", "creator", "electronics"]
  },
  {
    name: "Lumina UltraView 34 Curved Monitor",
    slug: "lumina-ultraview-34-curved-monitor",
    categorySlug: "electronics",
    brand: "Lumina",
    price: 54999,
    discount: 15,
    finalPrice: 46749,
    description: "Panoramic 1500R curved gaming and productivity monitor with 165Hz refresh rate and HDR600 color fidelity.",
    images: ["/images/products/monitor-1.jpg"],
    model3D: "/models/products/lumina-ultraview-34.glb",
    colors: ["Matte Black", "Lunar White"],
    sizes: ["34-inch"],
    specifications: {
      "Screen Size": "34-inch Ultrawide",
      "Curvature": "1500R Immersion Curve",
      "Refresh Rate": "165Hz (1ms MPRT)",
      "Resolution": "3440 x 1440 WQHD",
      "Color Gamut": "98% DCI-P3"
    },
    stock: 18,
    rating: 4.7,
    reviewCount: 29,
    tags: ["monitor", "curved", "4k", "ultrawide", "electronics"]
  },
  {
    name: "Apex Studio Mechanical Keyboard",
    slug: "apex-studio-mechanical-keyboard",
    categorySlug: "electronics",
    brand: "Apex",
    price: 12499,
    discount: 5,
    finalPrice: 11874,
    description: "Custom-tuned mechanical keyboard featuring hot-swappable switches, gasket mount acoustics, and tri-mode connectivity.",
    images: ["/images/products/keyboard-1.jpg"],
    model3D: "/models/products/apex-mechanical-keyboard.glb",
    colors: ["Retro Beige", "Cyberpunk Black", "Glacier White"],
    sizes: ["75% Layout"],
    specifications: {
      "Switch Type": "Gateron Hot-Swappable Pre-Lubed",
      "Connectivity": "Bluetooth 5.3 / 2.4GHz / USB-C",
      "Battery": "4000mAh Lithium Ion",
      "Keycaps": "Double-Shot PBT Cherry Profile"
    },
    stock: 45,
    rating: 4.9,
    reviewCount: 88,
    tags: ["keyboard", "mechanical", "wireless", "electronics"]
  },
  {
    name: "Nova Precision Ergonomic Mouse",
    slug: "nova-precision-ergonomic-mouse",
    categorySlug: "electronics",
    brand: "Nova",
    price: 6999,
    discount: 20,
    finalPrice: 5599,
    description: "Sculpted ergonomic wireless mouse engineered for natural hand posture and quiet electromagnetic scrolling.",
    images: ["/images/products/mouse-1.jpg"],
    model3D: null,
    colors: ["Graphite", "Off-White"],
    sizes: ["Standard"],
    specifications: {
      "Sensor": "Darkfield Optical 16,000 DPI",
      "Weight": "92g Lightweight Frame",
      "Battery Life": "Up to 70 days on full charge",
      "Connectivity": "Logi Bolt & Bluetooth LE"
    },
    stock: 60,
    rating: 4.6,
    reviewCount: 54,
    tags: ["mouse", "ergonomic", "wireless", "electronics"]
  },

  // ── 2. Mobile ───────────────────────────────────────────────────────────────
  {
    name: "Aether Horizon 15 Ultra Smartphone",
    slug: "aether-horizon-15-ultra-smartphone",
    categorySlug: "mobile",
    brand: "Aether",
    price: 89999,
    discount: 8,
    finalPrice: 82799,
    description: "Premium titanium flagship smartphone equipped with a 200MP periscope sensor and ultra-bright LTPO AMOLED panel.",
    images: ["/images/products/phone-1.jpg"],
    model3D: "/models/products/aether-horizon-phone.glb",
    colors: ["Obsidian Black", "Titanium Gray", "Aurora Green"],
    sizes: ["256GB", "512GB"],
    specifications: {
      "Chipset": "Snapdragon 8 Gen 3 (4nm)",
      "Camera": "200MP Wide + 50MP Periscope + 48MP Ultrawide",
      "Display": "6.8-inch Dynamic AMOLED 1-120Hz",
      "Battery": "5400mAh 100W SuperCharge"
    },
    stock: 35,
    rating: 4.9,
    reviewCount: 110,
    tags: ["smartphone", "5g", "flagship", "camera", "mobile"]
  },
  {
    name: "Nova Pad Air 11 Tablet",
    slug: "nova-pad-air-11-tablet",
    categorySlug: "mobile",
    brand: "Nova",
    price: 44999,
    discount: 12,
    finalPrice: 39599,
    description: "Featherlight 11-inch productivity tablet designed for sketch artists, students, and mobile professionals.",
    images: ["/images/products/tablet-1.jpg"],
    model3D: null,
    colors: ["Space Gray", "Sky Blue", "Rose Gold"],
    sizes: ["128GB", "256GB"],
    specifications: {
      "Screen Size": "11-inch 2.5K Resolution (2560x1600)",
      "Weight": "470g Ultrathin Profile (6.1mm)",
      "RAM": "8GB LPDDR5X",
      "Stylus Support": "Magnetic 4096-Level Stylus"
    },
    stock: 22,
    rating: 4.7,
    reviewCount: 37,
    tags: ["tablet", "stylus", "portable", "mobile"]
  },
  {
    name: "Vortex MagCharge 65W Wireless Station",
    slug: "vortex-magcharge-65w-wireless-station",
    categorySlug: "mobile",
    brand: "Vortex",
    price: 4999,
    discount: 25,
    finalPrice: 3749,
    description: "3-in-1 magnetic fast wireless charging dock for phone, smartwatch, and earbuds simultaneously.",
    images: ["/images/products/charger-1.jpg"],
    model3D: null,
    colors: ["Gunmetal", "Matte White"],
    sizes: ["One Size"],
    specifications: {
      "Output": "65W Total GaN Fast Charging",
      "Standard": "Qi2 & MagSafe Certified",
      "Safety": "Foreign Object Detection & Overheat Cutoff"
    },
    stock: 80,
    rating: 4.5,
    reviewCount: 65,
    tags: ["charger", "wireless", "fast-charge", "mobile"]
  },
  {
    name: "Kinesis Carbon Shield Phone Case",
    slug: "kinesis-carbon-shield-phone-case",
    categorySlug: "mobile",
    brand: "Kinesis",
    price: 1999,
    discount: 0,
    finalPrice: 1999,
    description: "Aerospace-grade woven aramid fiber case offering military drop protection without adding bulk.",
    images: ["/images/products/case-1.jpg"],
    model3D: null,
    colors: ["Forged Carbon", "Matte Kevlar"],
    sizes: ["Slim"],
    specifications: {
      "Material": "1500D Real Aramid Fiber",
      "Thickness": "0.85mm Ultra Thin",
      "Drop Rating": "10ft Impact Tested"
    },
    stock: 120,
    rating: 4.8,
    reviewCount: 92,
    tags: ["case", "protective", "carbon-fiber", "mobile"]
  },

  // ── 3. Audio ────────────────────────────────────────────────────────────────
  {
    name: "Aether Sonar ANC Over-Ear Headphones",
    slug: "aether-sonar-anc-headphones",
    categorySlug: "audio",
    brand: "Aether",
    price: 28999,
    discount: 15,
    finalPrice: 24649,
    description: "Studio-grade planar magnetic headphones with adaptive hybrid noise cancelling and immersive spatial tracking.",
    images: ["/images/products/headphones-1.jpg"],
    model3D: "/models/products/aether-sonar-headphones.glb",
    customization: {
      enabled: true,
      areas: [
        {
          id: "body",
          name: "Headband & Shell",
          meshNames: ["Headband", "LeftCup", "RightCup"],
          type: "color",
          defaultOption: "midnight_black",
          options: [
            { id: "midnight_black", name: "Midnight Black", value: "#0f172a", color: "#0f172a", roughness: 0.25, metalness: 0.8 },
            { id: "lunar_white", name: "Lunar White", value: "#f8fafc", color: "#f8fafc", roughness: 0.2, metalness: 0.3 },
            { id: "cyber_cyan", name: "Cyber Cyan", value: "#06b6d4", color: "#06b6d4", roughness: 0.2, metalness: 0.7 },
            { id: "champagne_gold", name: "Champagne Gold", value: "#d97706", color: "#d97706", roughness: 0.15, metalness: 0.95 }
          ]
        },
        {
          id: "cushions",
          name: "Ear Cushions",
          meshNames: ["LeftCushion", "RightCushion"],
          type: "color",
          defaultOption: "slate_charcoal",
          options: [
            { id: "slate_charcoal", name: "Slate Charcoal", value: "#334155", color: "#334155", roughness: 0.8, metalness: 0.05 },
            { id: "obsidian_black", name: "Obsidian Black", value: "#020617", color: "#020617", roughness: 0.85, metalness: 0.05 },
            { id: "cream_leather", name: "Cream Leather", value: "#fef3c7", color: "#fef3c7", roughness: 0.75, metalness: 0.05 },
            { id: "crimson_red", name: "Crimson Red", value: "#b91c1c", color: "#b91c1c", roughness: 0.7, metalness: 0.05 }
          ]
        },
        {
          id: "trim",
          name: "Accent Trim Rings",
          meshNames: ["LeftTrim", "RightTrim"],
          type: "color",
          defaultOption: "electric_indigo",
          options: [
            { id: "electric_indigo", name: "Electric Indigo", value: "#6366f1", color: "#6366f1", roughness: 0.1, metalness: 0.9 },
            { id: "neon_cyan", name: "Neon Cyan", value: "#06b6d4", color: "#06b6d4", roughness: 0.1, metalness: 0.9 },
            { id: "plasma_pink", name: "Plasma Pink", value: "#ec4899", color: "#ec4899", roughness: 0.1, metalness: 0.9 },
            { id: "solar_gold", name: "Solar Gold", value: "#f59e0b", color: "#f59e0b", roughness: 0.1, metalness: 0.95 }
          ]
        }
      ]
    },
    colors: ["Midnight Black", "Champagne Gold", "Slate Gray"],
    sizes: ["Over-Ear"],
    specifications: {
      "Transducer": "45mm Custom Planar Magnetic Driver",
      "ANC": "Adaptive Hybrid Quad-Microphone Active Noise Cancellation",
      "Battery Life": "55 Hours (ANC On)",
      "Wireless Codecs": "LDAC, LHDC, AAC, SBC"
    },
    stock: 30,
    rating: 4.9,
    reviewCount: 76,
    tags: ["headphones", "audiophile", "anc", "wireless", "audio"]
  },
  {
    name: "Lumina Pulse Spatial Earbuds Pro",
    slug: "lumina-pulse-spatial-earbuds-pro",
    categorySlug: "audio",
    brand: "Lumina",
    price: 14999,
    discount: 10,
    finalPrice: 13499,
    description: "True wireless earbuds featuring graphene dynamic drivers, dynamic head-tracking, and IPX7 water resistance.",
    images: ["/images/products/earbuds-1.jpg"],
    model3D: null,
    colors: ["Polar White", "Onyx Black", "Ember Red"],
    sizes: ["In-Ear (S/M/L Tips)"],
    specifications: {
      "Drivers": "11mm Dual Graphene Diaphragm",
      "Waterproofing": "IPX7 Sweat & Water Protection",
      "Total Playtime": "8 Hours + 32 Hours Case",
      "Latency": "45ms Low Latency Game Mode"
    },
    stock: 50,
    rating: 4.6,
    reviewCount: 58,
    tags: ["earbuds", "spatial-audio", "waterproof", "audio"]
  },
  {
    name: "Zenith SoundSphere Hi-Res Bluetooth Speaker",
    slug: "zenith-soundsphere-hi-res-speaker",
    categorySlug: "audio",
    brand: "Zenith",
    price: 18999,
    discount: 20,
    finalPrice: 15199,
    description: "Acoustically tuned circular home speaker encased in handcrafted walnut wood and acoustic mesh.",
    images: ["/images/products/speaker-1.jpg"],
    model3D: "/models/products/zenith-soundsphere.glb",
    colors: ["Walnut Wood", "Charcoal Fabric"],
    sizes: ["Medium"],
    specifications: {
      "Output Power": "80W RMS Bi-Amplified",
      "Frequency Response": "35Hz - 24,000Hz",
      "Connectivity": "Wi-Fi 6, AirPlay 2, Spotify Connect, Bluetooth 5.3"
    },
    stock: 20,
    rating: 4.8,
    reviewCount: 44,
    tags: ["speaker", "hi-res", "home-audio", "audio"]
  },
  {
    name: "Vortex Studio Condenser USB Microphone",
    slug: "vortex-studio-condenser-usb-microphone",
    categorySlug: "audio",
    brand: "Vortex",
    price: 8999,
    discount: 10,
    finalPrice: 8099,
    description: "Broadcast-quality USB condenser microphone for high-fidelity streaming, podcasting, and vocal tracking.",
    images: ["/images/products/mic-1.jpg"],
    model3D: null,
    colors: ["Cast Iron Black", "Satin Silver"],
    sizes: ["Desktop Stand"],
    specifications: {
      "Capsules": "3 x 14mm Condenser Array",
      "Polar Patterns": "Cardioid, Omnidirectional, Bidirectional",
      "Resolution": "192kHz / 24-bit Studio Grade"
    },
    stock: 40,
    rating: 4.7,
    reviewCount: 63,
    tags: ["microphone", "streaming", "podcast", "audio"]
  },

  // ── 4. Gaming ───────────────────────────────────────────────────────────────
  {
    name: "Apex Titan RTX 4080 Gaming Rig",
    slug: "apex-titan-rtx-4080-gaming-rig",
    categorySlug: "gaming",
    brand: "Apex",
    price: 219999,
    discount: 5,
    finalPrice: 208999,
    description: "Uncompromised gaming desktop featuring custom liquid cooling, RTX 4080 Super, and 64GB DDR5 memory.",
    images: ["/images/products/desktop-1.jpg"],
    model3D: "/models/products/apex-titan-gaming-pc.glb",
    colors: ["Obsidian RGB", "Glacier White RGB"],
    sizes: ["Mid Tower"],
    specifications: {
      "GPU": "NVIDIA GeForce RTX 4080 Super 16GB",
      "CPU": "Intel Core i9-14900K 24-Core",
      "RAM": "64GB DDR5 6000MHz RGB",
      "Cooling": "360mm AIO Liquid Closed Loop",
      "Power": "1000W 80-Plus Gold Modular"
    },
    stock: 12,
    rating: 4.9,
    reviewCount: 31,
    tags: ["desktop", "gaming", "pc", "rtx", "vr-ready"]
  },
  {
    name: "Vortex Phantom Wireless Pro Controller",
    slug: "vortex-phantom-wireless-pro-controller",
    categorySlug: "gaming",
    brand: "Vortex",
    price: 5999,
    discount: 10,
    finalPrice: 5399,
    description: "Pro-tier competition gamepad with anti-drift hall-effect sticks, mechanical buttons, and remappable rear paddles.",
    images: ["/images/products/controller-1.jpg"],
    model3D: "/models/products/vortex-controller.glb",
    colors: ["Cyber Lime", "Midnight Shadow", "Crimson Red"],
    sizes: ["Standard Ergonomic"],
    specifications: {
      "Thumbsticks": "Contactless Hall-Effect Sensors",
      "Polling Rate": "1000Hz Tournament Grade",
      "Trigger Stop": "2-Stage Hair Trigger Adjusters"
    },
    stock: 65,
    rating: 4.8,
    reviewCount: 85,
    tags: ["controller", "gamepad", "customizable", "gaming"]
  },
  {
    name: "Kinesis Quantum Ergonomic Gaming Chair",
    slug: "kinesis-quantum-ergonomic-gaming-chair",
    categorySlug: "gaming",
    brand: "Kinesis",
    price: 24999,
    discount: 15,
    finalPrice: 21249,
    description: "Ergonomic high-back gaming chair crafted with cold-cured foam and adaptive magnetic memory foam headrest.",
    images: ["/images/products/chair-1.jpg"],
    model3D: null,
    colors: ["All Black", "Stealth Gray & Cyan", "Dark Slate"],
    sizes: ["XL Frame"],
    specifications: {
      "Upholstery": "Breathable SoftWeave Plus Fabric",
      "Recline": "85° to 165° Multi-Tilt Lock",
      "Armrests": "4D Metal Internal Adjusters",
      "Capacity": "Up to 150 kg"
    },
    stock: 15,
    rating: 4.6,
    reviewCount: 49,
    tags: ["chair", "ergonomic", "lumbar-support", "gaming"]
  },
  {
    name: "Solaria Warp Speed 1TB NVMe Gen5 SSD",
    slug: "solaria-warp-speed-1tb-nvme-ssd",
    categorySlug: "gaming",
    brand: "Solaria",
    price: 13999,
    discount: 20,
    finalPrice: 11199,
    description: "Next-gen PCIe 5.0 solid state drive reaching unprecedented transfer speeds up to 12,400 MB/s.",
    images: ["/images/products/ssd-1.jpg"],
    model3D: null,
    colors: ["Anodized Heatsink Black"],
    sizes: ["1TB", "2TB"],
    specifications: {
      "Sequential Read": "Up to 12,400 MB/s",
      "Sequential Write": "Up to 11,800 MB/s",
      "Form Factor": "M.2 2280 with Thermal Heat Spreader"
    },
    stock: 55,
    rating: 4.9,
    reviewCount: 67,
    tags: ["ssd", "storage", "fast", "gaming"]
  },

  // ── 5. Fashion ──────────────────────────────────────────────────────────────
  {
    name: "Aether Aerotech Urban Bomber Jacket",
    slug: "aether-aerotech-urban-bomber-jacket",
    categorySlug: "fashion",
    brand: "Aether",
    price: 8999,
    discount: 10,
    finalPrice: 8099,
    description: "Technical weatherproof bomber jacket engineered with breathable membrane fabric and magnetic storm flaps.",
    images: ["/images/products/jacket-1.jpg"],
    model3D: "/models/products/aether-aerotech-jacket.glb",
    colors: ["Matte Black", "Desert Olive", "Deep Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    specifications: {
      "Fabric": "3-Layer DWR Hydrophobic Shell",
      "Pockets": "6 Waterproof YKK Aquaguard Pockets",
      "Insulation": "Primaloft Gold Lightweight Core"
    },
    stock: 35,
    rating: 4.7,
    reviewCount: 41,
    tags: ["jacket", "streetwear", "waterproof", "fashion"]
  },
  {
    name: "Nova Minimalist Heavyweight Oversized Hoodie",
    slug: "nova-heavyweight-oversized-hoodie",
    categorySlug: "fashion",
    brand: "Nova",
    price: 3999,
    discount: 15,
    finalPrice: 3399,
    description: "Luxuriously thick 480 GSM organic cotton hoodie with dropped shoulders and double-layered structured hood.",
    images: ["/images/products/hoodie-1.jpg"],
    model3D: null,
    colors: ["Washed Charcoal", "Oatmeal Melange", "Forest Moss"],
    sizes: ["XS", "S", "M", "L", "XL"],
    specifications: {
      "Weight": "480 GSM Heavy French Terry",
      "Material": "100% GOTS Certified Organic Cotton",
      "Fit": "Modern Boxy Relaxed Silhouette"
    },
    stock: 70,
    rating: 4.8,
    reviewCount: 95,
    tags: ["hoodie", "oversized", "cotton", "fashion"]
  },
  {
    name: "Zenith Tailored Linen Chino Trousers",
    slug: "zenith-tailored-linen-chino-trousers",
    categorySlug: "fashion",
    brand: "Zenith",
    price: 4499,
    discount: 0,
    finalPrice: 4499,
    description: "Refined European linen-blend chinos combining tailored sharp lines with summer breathability.",
    images: ["/images/products/chinos-1.jpg"],
    model3D: null,
    colors: ["Sand Khaki", "Navy Blue", "Olive Drab"],
    sizes: ["30", "32", "34", "36"],
    specifications: {
      "Composition": "60% Normandy Linen / 40% Combed Cotton",
      "Closure": "Horn Button with YKK Brass Zipper",
      "Rise": "Mid-Rise Clean Front"
    },
    stock: 45,
    rating: 4.5,
    reviewCount: 28,
    tags: ["chinos", "trousers", "linen", "fashion"]
  },
  {
    name: "Solaria Seamless Activewear Performance Tee",
    slug: "solaria-seamless-performance-tee",
    categorySlug: "fashion",
    brand: "Solaria",
    price: 2199,
    discount: 20,
    finalPrice: 1759,
    description: "Laser-perforated running t-shirt featuring 4-way mechanical stretch and antibacterial odor protection.",
    images: ["/images/products/tee-1.jpg"],
    model3D: null,
    colors: ["Cobalt Blue", "Stealth Black", "Hyper Coral"],
    sizes: ["S", "M", "L", "XL"],
    specifications: {
      "Fabric Weight": "130 GSM Featherweight",
      "Technology": "Silver-Ion Anti-Odor Treatment",
      "Reflectivity": "360-Degree 3M Luminescent Accents"
    },
    stock: 90,
    rating: 4.6,
    reviewCount: 52,
    tags: ["activewear", "gym", "breathable", "fashion"]
  },

  // ── 6. Shoes ────────────────────────────────────────────────────────────────
  {
    name: "Aether Velocity Knit Running Shoes",
    slug: "aether-velocity-knit-running-shoes",
    categorySlug: "shoes",
    brand: "Aether",
    price: 9499,
    discount: 12,
    finalPrice: 8359,
    description: "Ultra-responsive marathon road shoes featuring nitrogen-infused supercritical foam and carbon propulsion plate.",
    images: ["/images/products/running-shoes-1.jpg"],
    model3D: "/models/products/aether-velocity-shoes.glb",
    colors: ["Phantom Black / Neon", "Cloud White / Silver", "Sunset Gradient"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    specifications: {
      "Midsole": "Supercritical Nitrogen Foam with Full-Length Carbon Plate",
      "Upper": "Engineered Jacquard Breathable Knit",
      "Drop": "8mm Heel-to-Toe",
      "Weight": "205g per shoe"
    },
    stock: 40,
    rating: 4.8,
    reviewCount: 78,
    tags: ["running", "sneakers", "cushioning", "shoes"]
  },
  {
    name: "Apex Kinetic Streetwear Sneaker",
    slug: "apex-kinetic-streetwear-sneaker",
    categorySlug: "shoes",
    brand: "Apex",
    price: 7999,
    discount: 10,
    finalPrice: 7199,
    description: "Handcrafted low-top lifestyle sneakers combining butter-soft Italian calfskin with vulcanized cupsoles.",
    images: ["/images/products/sneaker-1.jpg"],
    model3D: null,
    colors: ["Chalk White / Grey", "Triple Black", "Retro Blue"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    specifications: {
      "Leather": "Top-Grain Italian Nappa Leather",
      "Sole": "Non-Marking Natural Gum Rubber",
      "Insole": "Molded Cork and Poron Footbed"
    },
    stock: 30,
    rating: 4.7,
    reviewCount: 61,
    tags: ["sneakers", "streetwear", "leather", "shoes"]
  },
  {
    name: "Kinesis Alpine All-Weather Hiking Boot",
    slug: "kinesis-alpine-hiking-boot",
    categorySlug: "shoes",
    brand: "Kinesis",
    price: 12999,
    discount: 15,
    finalPrice: 11049,
    description: "Rugged backcountry boot with Vibram Megagrip traction lugging and waterproof breathable membrane.",
    images: ["/images/products/boot-1.jpg"],
    model3D: null,
    colors: ["Earth Brown", "Shadow Grey"],
    sizes: ["UK 8", "UK 9", "UK 10", "UK 11"],
    specifications: {
      "Outsole": "Vibram Megagrip 5mm Deep Lugs",
      "Membrane": "HydroShield 100% Waterproof Sock",
      "Hardware": "Corrosion-Proof Anodized Lace Hooks"
    },
    stock: 25,
    rating: 4.9,
    reviewCount: 43,
    tags: ["boots", "hiking", "waterproof", "shoes"]
  },
  {
    name: "Zenith Loafer Slip-On Leather Shoes",
    slug: "zenith-loafer-slip-on-shoes",
    categorySlug: "shoes",
    brand: "Zenith",
    price: 6499,
    discount: 5,
    finalPrice: 6174,
    description: "Timeless penny loafers hand-stitched from full-grain burnished leather with flexible cushioned soles.",
    images: ["/images/products/loafers-1.jpg"],
    model3D: null,
    colors: ["Cognac Tan", "Espresso Brown", "Black"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10"],
    specifications: {
      "Construction": "Traditional Blake Welted",
      "Upper": "Hand-Polished Full-Grain Leather",
      "Cushioning": "Arch-Support Memory Foam Insole"
    },
    stock: 35,
    rating: 4.6,
    reviewCount: 39,
    tags: ["loafers", "formal", "leather", "shoes"]
  },

  // ── 7. Accessories ──────────────────────────────────────────────────────────
  {
    name: "Lumina Chrono Automatic Titanium Watch",
    slug: "lumina-chrono-automatic-titanium-watch",
    categorySlug: "accessories",
    brand: "Lumina",
    price: 34999,
    discount: 10,
    finalPrice: 31499,
    description: "41mm aerospace titanium field watch with Japanese 24-jewel automatic movement and double-domed sapphire crystal.",
    images: ["/images/products/watch-1.jpg"],
    model3D: "/models/products/lumina-chrono-watch.glb",
    colors: ["Brushed Titanium", "DLC Midnight Black"],
    sizes: ["41mm Case"],
    specifications: {
      "Movement": "Miyota 9039 Premium Automatic 28,800 BPH",
      "Power Reserve": "42 Hours",
      "Water Resistance": "200M / 20 ATM with Screw-Down Crown",
      "Glass": "Anti-Reflective Double-Domed Sapphire"
    },
    stock: 15,
    rating: 4.9,
    reviewCount: 51,
    tags: ["watch", "automatic", "luxury", "accessories"]
  },
  {
    name: "Nova Polarized Aviator Sunglasses",
    slug: "nova-polarized-aviator-sunglasses",
    categorySlug: "accessories",
    brand: "Nova",
    price: 4999,
    discount: 20,
    finalPrice: 3999,
    description: "Classic teardrop aviators redesigned with ultra-thin memory metal frames and polarized UV400 lenses.",
    images: ["/images/products/sunglasses-1.jpg"],
    model3D: null,
    colors: ["Gunmetal / Green Lens", "Gold / Brown Lens", "Matte Black / Smoke"],
    sizes: ["Medium"],
    specifications: {
      "Lens": "9-Layer Polarized High-Contrast Triacetate",
      "UV Rating": "100% UV400 Protection",
      "Frame": "Corrosion-Resistant Beta-Titanium Wire"
    },
    stock: 50,
    rating: 4.7,
    reviewCount: 68,
    tags: ["sunglasses", "polarized", "eyewear", "accessories"]
  },
  {
    name: "Apex Stealth Waterproof Roll-Top Backpack",
    slug: "apex-stealth-waterproof-roll-top-backpack",
    categorySlug: "accessories",
    brand: "Apex",
    price: 7499,
    discount: 15,
    finalPrice: 6374,
    description: "Expandable 28L commuter pack featuring seam-sealed Cordura ballistic fabric and magnetic Fidlock buckles.",
    images: ["/images/products/backpack-1.jpg"],
    model3D: null,
    colors: ["Matte Black", "Storm Grey"],
    sizes: ["28L - 34L"],
    specifications: {
      "Volume": "28 Liters (Expands to 34L)",
      "Laptop Compartment": "Suspended False-Bottom for 16-inch Laptops",
      "Hardware": "German Engineered Fidlock Magnetic Clasps"
    },
    stock: 38,
    rating: 4.8,
    reviewCount: 82,
    tags: ["backpack", "waterproof", "travel", "accessories"]
  },
  {
    name: "Zenith Minimalist RFID Aluminum Wallet",
    slug: "zenith-minimalist-rfid-wallet",
    categorySlug: "accessories",
    brand: "Zenith",
    price: 2499,
    discount: 20,
    finalPrice: 1999,
    description: "Anodized aluminum cardholder featuring one-click stepped card ejection and integral RFID blocking.",
    images: ["/images/products/wallet-1.jpg"],
    model3D: null,
    colors: ["Space Grey", "Matte Black", "Rose Gold"],
    sizes: ["Compact"],
    specifications: {
      "Capacity": "Up to 10 Cards + Carbon Money Clip",
      "Mechanism": "Quick-Draw Stepped Fan Lever",
      "Weight": "58 grams"
    },
    stock: 85,
    rating: 4.6,
    reviewCount: 104,
    tags: ["wallet", "rfid", "minimalist", "accessories"]
  },

  // ── 8. Home ─────────────────────────────────────────────────────────────────
  {
    name: "Aether Aura Ambient Smart LED Floor Lamp",
    slug: "aether-aura-ambient-smart-floor-lamp",
    categorySlug: "home",
    brand: "Aether",
    price: 11999,
    discount: 15,
    finalPrice: 10199,
    description: "Architectural corner floor lamp with dynamic RGBIC gradient diffusion and smart home voice integration.",
    images: ["/images/products/lamp-1.jpg"],
    model3D: "/models/products/aether-aura-lamp.glb",
    colors: ["Matte Black", "Brushed Brass"],
    sizes: ["145cm Height"],
    specifications: {
      "Luminance": "1800 Lumens Output",
      "Color Capabilities": "16 Million Colors + 2200K-6500K Tunable White",
      "Protocol": "Matter, Apple HomeKit, Google Home, Alexa"
    },
    stock: 22,
    rating: 4.8,
    reviewCount: 36,
    tags: ["smart-home", "lighting", "rgb", "home"]
  },
  {
    name: "Zenith Ultrasonic Aromatherapy Diffuser",
    slug: "zenith-ultrasonic-diffuser",
    categorySlug: "home",
    brand: "Zenith",
    price: 3499,
    discount: 10,
    finalPrice: 3149,
    description: "Handcrafted ceramic ultrasonic diffuser delivering continuous whisper-quiet essential oil atomization.",
    images: ["/images/products/diffuser-1.jpg"],
    model3D: null,
    colors: ["Natural Oak", "Dark Walnut"],
    sizes: ["400ml Capacity"],
    specifications: {
      "Run Time": "Up to 12 Hours Continuous",
      "Coverage": "Up to 450 sq ft",
      "Safety": "Waterless Auto-Shutoff Protection"
    },
    stock: 60,
    rating: 4.7,
    reviewCount: 72,
    tags: ["wellness", "diffuser", "home-decor", "home"]
  },
  {
    name: "Solaria Barista Touch Espresso Machine",
    slug: "solaria-barista-touch-espresso-machine",
    categorySlug: "home",
    brand: "Solaria",
    price: 42999,
    discount: 8,
    finalPrice: 39559,
    description: "Semi-automatic Italian 19-bar espresso maker with precision PID temperature regulation and microfoam steam wand.",
    images: ["/images/products/espresso-1.jpg"],
    model3D: null,
    colors: ["Stainless Steel", "Matte Truffle Black"],
    sizes: ["Countertop"],
    specifications: {
      "Pump Pressure": "19-Bar Italian ULKA Precision Pump",
      "Heating": "Thermo-Jet Rapid 3-Second Startup",
      "Portafilter": "54mm Commercial Grade Stainless Steel"
    },
    stock: 14,
    rating: 4.9,
    reviewCount: 49,
    tags: ["coffee", "espresso", "kitchen", "home"]
  },
  {
    name: "Nova Ergonomic Electric Standing Desk",
    slug: "nova-ergonomic-electric-standing-desk",
    categorySlug: "home",
    brand: "Nova",
    price: 27999,
    discount: 10,
    finalPrice: 25199,
    description: "Solid wood electric sit-stand desk equipped with whisper-quiet dual motors and 4 customizable memory presets.",
    images: ["/images/products/desk-1.jpg"],
    model3D: null,
    colors: ["Rustic Solid Walnut / Black Legs", "Clean Maple / White Legs"],
    sizes: ["140cm x 70cm"],
    specifications: {
      "Height Range": "62cm to 128cm Seamless Elevation",
      "Motors": "Dual Synchronous Quiet Motors (<45dB)",
      "Lifting Capacity": "125 kg (275 lbs)",
      "Safety": "Gyroscope Anti-Collision Sensor"
    },
    stock: 16,
    rating: 4.8,
    reviewCount: 53,
    tags: ["desk", "standing-desk", "ergonomic", "home-office", "home"]
  }
];

export const couponsData = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minimumOrderAmount: 1000,
    maximumDiscount: 2000,
    expiryDate: new Date("2030-12-31"),
    usageLimit: 1000,
    usedCount: 0,
    isActive: true
  },
  {
    code: "AETHERA20",
    type: "percentage",
    value: 20,
    minimumOrderAmount: 5000,
    maximumDiscount: 5000,
    expiryDate: new Date("2030-12-31"),
    usageLimit: 500,
    usedCount: 0,
    isActive: true
  },
  {
    code: "FLAT500",
    type: "fixed",
    value: 500,
    minimumOrderAmount: 2000,
    maximumDiscount: null,
    expiryDate: new Date("2030-12-31"),
    usageLimit: 200,
    usedCount: 0,
    isActive: true
  },
  {
    code: "EXPIRED50",
    type: "percentage",
    value: 50,
    minimumOrderAmount: 500,
    maximumDiscount: 1000,
    expiryDate: new Date("2020-01-01"),
    usageLimit: 50,
    usedCount: 0,
    isActive: true
  },
  {
    code: "INACTIVE30",
    type: "percentage",
    value: 30,
    minimumOrderAmount: 1000,
    maximumDiscount: 3000,
    expiryDate: new Date("2030-12-31"),
    usageLimit: 100,
    usedCount: 0,
    isActive: false
  },
  {
    code: "MAXEDOUT",
    type: "fixed",
    value: 300,
    minimumOrderAmount: 1000,
    maximumDiscount: null,
    expiryDate: new Date("2030-12-31"),
    usageLimit: 5,
    usedCount: 5,
    isActive: true
  }
];
