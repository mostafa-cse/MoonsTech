import { getDb } from "../api/queries/connection";
import {
  categories, brands, products, productImages, productSpecifications,
  megaCoinSettings, siteSettings, banners, coupons, deliveryZones
} from "./schema";

const db = getDb();

async function seed() {
  console.log("Starting seed...");

  // ===== MegaCoin Settings =====
  await db.insert(megaCoinSettings).values({
    coinsPerTaka: "1.00",
    takaPerCoin: "0.10",
    minimumRedeem: 100,
    maximumRedeemPerOrder: 1000,
    expiryDays: 365,
    welcomeBonus: 50,
    referralBonus: 100,
    reviewBonus: 20,
    isActive: true,
  });
  console.log("MegaCoin settings seeded");

  // ===== Site Settings =====
  const settings = [
    { key: "store_name", value: "Aesthetic Tech Store", group: "general" },
    { key: "store_logo", value: "", group: "general" },
    { key: "contact_email", value: "support@aesthetictech.com", group: "general" },
    { key: "contact_phone", value: "+880 1XXX-XXXXXX", group: "general" },
    { key: "currency", value: "BDT", group: "general" },
    { key: "currency_symbol", value: "৳", group: "general" },
    { key: "tax_rate", value: "0", group: "tax" },
    { key: "free_shipping_threshold", value: "5000", group: "shipping" },
    { key: "default_shipping_charge", value: "60", group: "shipping" },
    { key: "express_shipping_charge", value: "120", group: "shipping" },
    { key: "return_window_days", value: "7", group: "returns" },
    { key: "maintenance_mode", value: "false", group: "system" },
  ];
  await db.insert(siteSettings).values(settings);
  console.log("Site settings seeded");

  // ===== Categories (Multi-level: Main > Sub > Child) =====
  // Main Categories
  const mainCats = await db.insert(categories).values([
    { name: "Computing & Components", slug: "computing-components", description: "PC components, processors, motherboards, and more", icon: "Cpu", level: 1, sortOrder: 1, isActive: true },
    { name: "Display & Audio", slug: "display-audio", description: "Monitors, TVs, headphones, speakers", icon: "Monitor", level: 1, sortOrder: 2, isActive: true },
    { name: "Mobile & Gadgets", slug: "mobile-gadgets", description: "Smartphones, tablets, smartwatches, accessories", icon: "Smartphone", level: 1, sortOrder: 3, isActive: true },
    { name: "Gaming", slug: "gaming", description: "Gaming consoles, chairs, controllers, accessories", icon: "Gamepad2", level: 1, sortOrder: 4, isActive: true },
    { name: "Networking & Security", slug: "networking-security", description: "Routers, switches, security cameras, smart locks", icon: "Wifi", level: 1, sortOrder: 5, isActive: true },
    { name: "Office & Equipment", slug: "office-equipment", description: "Printers, UPS, projectors, office furniture", icon: "Printer", level: 1, sortOrder: 6, isActive: true },
    { name: "Accessories", slug: "accessories", description: "Keyboards, mice, webcams, cables, bags", icon: "Keyboard", level: 1, sortOrder: 7, isActive: true },
  ]).$returningId();
  console.log("Main categories seeded");

  // Sub Categories
  const computingId = mainCats[0].id;
  const displayId = mainCats[1].id;
  const mobileId = mainCats[2].id;
  const gamingId = mainCats[3].id;
  const networkingId = mainCats[4].id;
  const officeId = mainCats[5].id;
  const accessoriesId = mainCats[6].id;

  const subCats = await db.insert(categories).values([
    // Computing sub-categories
    { name: "Desktop PC", slug: "desktop-pc", description: "Pre-built and custom desktop computers", parentId: computingId, level: 2, sortOrder: 1, isActive: true },
    { name: "Laptop", slug: "laptop", description: "Gaming, business, ultrabook laptops", parentId: computingId, level: 2, sortOrder: 2, isActive: true },
    { name: "Processor (CPU)", slug: "processor-cpu", description: "Intel and AMD processors", parentId: computingId, level: 2, sortOrder: 3, isActive: true },
    { name: "Motherboard", slug: "motherboard", description: "Intel and AMD motherboards", parentId: computingId, level: 2, sortOrder: 4, isActive: true },
    { name: "Graphics Card (GPU)", slug: "graphics-card-gpu", description: "NVIDIA, AMD, Intel graphics cards", parentId: computingId, level: 2, sortOrder: 5, isActive: true },
    { name: "RAM", slug: "ram", description: "DDR4, DDR5 memory modules", parentId: computingId, level: 2, sortOrder: 6, isActive: true },
    { name: "SSD / HDD / NVMe", slug: "storage", description: "Internal and external storage drives", parentId: computingId, level: 2, sortOrder: 7, isActive: true },
    { name: "CPU Cooler", slug: "cpu-cooler", description: "Air and liquid cooling solutions", parentId: computingId, level: 2, sortOrder: 8, isActive: true },
    { name: "PC Casing", slug: "pc-casing", description: "Computer cases and chassis", parentId: computingId, level: 2, sortOrder: 9, isActive: true },
    { name: "Power Supply (PSU)", slug: "power-supply", description: "PSU units for all builds", parentId: computingId, level: 2, sortOrder: 10, isActive: true },

    // Display & Audio
    { name: "Monitor", slug: "monitor", description: "Gaming, ultrawide, 4K monitors", parentId: displayId, level: 2, sortOrder: 1, isActive: true },
    { name: "TV", slug: "tv", description: "Smart TV, 4K, OLED, QLED", parentId: displayId, level: 2, sortOrder: 2, isActive: true },
    { name: "Headphone / Headset", slug: "headphone-headset", description: "Wired, wireless, gaming headsets", parentId: displayId, level: 2, sortOrder: 3, isActive: true },
    { name: "Earbuds / TWS", slug: "earbuds-tws", description: "True wireless earbuds", parentId: displayId, level: 2, sortOrder: 4, isActive: true },
    { name: "Speaker", slug: "speaker", description: "Bluetooth and wired speakers", parentId: displayId, level: 2, sortOrder: 5, isActive: true },

    // Mobile & Gadgets
    { name: "Mobile Phone", slug: "mobile-phone", description: "Smartphones and feature phones", parentId: mobileId, level: 2, sortOrder: 1, isActive: true },
    { name: "Tablet PC", slug: "tablet-pc", description: "Android and iOS tablets", parentId: mobileId, level: 2, sortOrder: 2, isActive: true },
    { name: "Smart Watch", slug: "smart-watch", description: "Fitness bands and smartwatches", parentId: mobileId, level: 2, sortOrder: 3, isActive: true },
    { name: "Power Bank", slug: "power-bank", description: "Portable chargers", parentId: mobileId, level: 2, sortOrder: 4, isActive: true },
    { name: "Mobile Accessories", slug: "mobile-accessories", description: "Cases, screen protectors, cables", parentId: mobileId, level: 2, sortOrder: 5, isActive: true },

    // Gaming
    { name: "Gaming Console", slug: "gaming-console", description: "PlayStation, Xbox, Nintendo", parentId: gamingId, level: 2, sortOrder: 1, isActive: true },
    { name: "Gaming Chair", slug: "gaming-chair", description: "Ergonomic gaming chairs", parentId: gamingId, level: 2, sortOrder: 2, isActive: true },
    { name: "Gaming Controller", slug: "gaming-controller", description: "Controllers and joysticks", parentId: gamingId, level: 2, sortOrder: 3, isActive: true },
    { name: "Gaming Mouse Pad", slug: "gaming-mouse-pad", description: "RGB and extended mouse pads", parentId: gamingId, level: 2, sortOrder: 4, isActive: true },

    // Networking
    { name: "Router", slug: "router", description: "WiFi 5, 6, 6E, 7 routers", parentId: networkingId, level: 2, sortOrder: 1, isActive: true },
    { name: "Network Switch", slug: "network-switch", description: "Managed and unmanaged switches", parentId: networkingId, level: 2, sortOrder: 2, isActive: true },
    { name: "Security Camera", slug: "security-camera", description: "IP cameras and CCTV systems", parentId: networkingId, level: 2, sortOrder: 3, isActive: true },

    // Office
    { name: "Printer", slug: "printer", description: "Inkjet, laser, all-in-one", parentId: officeId, level: 2, sortOrder: 1, isActive: true },
    { name: "UPS / IPS", slug: "ups-ips", description: "Power backup solutions", parentId: officeId, level: 2, sortOrder: 2, isActive: true },
    { name: "Projector", slug: "projector", description: "Home and office projectors", parentId: officeId, level: 2, sortOrder: 3, isActive: true },

    // Accessories
    { name: "Keyboard", slug: "keyboard", description: "Mechanical, membrane, gaming", parentId: accessoriesId, level: 2, sortOrder: 1, isActive: true },
    { name: "Mouse", slug: "mouse", description: "Wired, wireless, gaming mice", parentId: accessoriesId, level: 2, sortOrder: 2, isActive: true },
    { name: "Webcam", slug: "webcam", description: "HD and 4K webcams", parentId: accessoriesId, level: 2, sortOrder: 3, isActive: true },
    { name: "Cable & Adapter", slug: "cable-adapter", description: "USB, HDMI, Type-C cables", parentId: accessoriesId, level: 2, sortOrder: 4, isActive: true },
    { name: "Backpack / Bag", slug: "backpack-bag", description: "Laptop bags and backpacks", parentId: accessoriesId, level: 2, sortOrder: 5, isActive: true },
  ]).$returningId();
  console.log("Sub categories seeded");

  // ===== Brands =====
  const brandData = [
    // Computing
    { name: "Intel", slug: "intel", description: "Leading processor manufacturer", isFeatured: true, isActive: true },
    { name: "AMD", slug: "amd", description: "Processors and graphics cards", isFeatured: true, isActive: true },
    { name: "ASUS", slug: "asus", description: "Motherboards, GPUs, laptops", isFeatured: true, isActive: true },
    { name: "Gigabyte", slug: "gigabyte", description: "Motherboards and graphics cards", isFeatured: true, isActive: true },
    { name: "MSI", slug: "msi", description: "Gaming components and laptops", isFeatured: true, isActive: true },
    { name: "Corsair", slug: "corsair", description: "RAM, PSU, coolers, peripherals", isFeatured: true, isActive: true },
    { name: "Kingston", slug: "kingston", description: "Memory and storage solutions", isFeatured: true, isActive: true },
    { name: "Samsung", slug: "samsung", description: "SSDs, monitors, phones, TVs", isFeatured: true, isActive: true },
    { name: "Cooler Master", slug: "cooler-master", description: "Cooling and PC cases", isFeatured: true, isActive: true },
    { name: "NZXT", slug: "nzxt", description: "PC cases and components", isFeatured: true, isActive: true },
    { name: "Thermaltake", slug: "thermaltake", description: "PSU, cases, cooling", isFeatured: true, isActive: true },
    { name: "Western Digital", slug: "western-digital", description: "HDD and SSD storage", isFeatured: true, isActive: true },
    { name: "Seagate", slug: "seagate", description: "Hard drives and storage", isFeatured: true, isActive: true },
    { name: "Noctua", slug: "noctua", description: "Premium CPU coolers and fans", isFeatured: true, isActive: true },
    { name: "Lian Li", slug: "lian-li", description: "Premium PC cases", isFeatured: true, isActive: true },
    { name: "ASRock", slug: "asrock", description: "Motherboards", isFeatured: true, isActive: true },

    // Laptops
    { name: "Apple", slug: "apple", description: "MacBooks and iPads", isFeatured: true, isActive: true },
    { name: "Dell", slug: "dell", description: "Business and gaming laptops", isFeatured: true, isActive: true },
    { name: "HP", slug: "hp", description: "Laptops and printers", isFeatured: true, isActive: true },
    { name: "Lenovo", slug: "lenovo", description: "ThinkPad and Legion series", isFeatured: true, isActive: true },
    { name: "Acer", slug: "acer", description: "Aspire and Predator series", isFeatured: true, isActive: true },
    { name: "Microsoft", slug: "microsoft", description: "Surface devices", isFeatured: true, isActive: true },

    // Peripherals & Audio
    { name: "Logitech", slug: "logitech", description: "Keyboards, mice, webcams", isFeatured: true, isActive: true },
    { name: "Razer", slug: "razer", description: "Gaming peripherals", isFeatured: true, isActive: true },
    { name: "SteelSeries", slug: "steelseries", description: "Gaming peripherals", isFeatured: true, isActive: true },
    { name: "HyperX", slug: "hyperx", description: "Gaming headsets and RAM", isFeatured: true, isActive: true },
    { name: "Redragon", slug: "redragon", description: "Budget gaming peripherals", isFeatured: true, isActive: true },
    { name: "Sony", slug: "sony", description: "Headphones, consoles, TVs", isFeatured: true, isActive: true },
    { name: "JBL", slug: "jbl", description: "Speakers and headphones", isFeatured: true, isActive: true },
    { name: "Sennheiser", slug: "sennheiser", description: "Premium audio equipment", isFeatured: true, isActive: true },
    { name: "Audio-Technica", slug: "audio-technica", description: "Professional audio", isFeatured: true, isActive: true },
    { name: "Edifier", slug: "edifier", description: "Speakers and headphones", isFeatured: true, isActive: true },
    { name: "Bose", slug: "bose", description: "Premium audio equipment", isFeatured: true, isActive: true },
    { name: "Havit", slug: "havit", description: "Budget peripherals and audio", isFeatured: true, isActive: true },
    { name: "Baseus", slug: "baseus", description: "Mobile accessories", isFeatured: true, isActive: true },
    { name: "Ugreen", slug: "ugreen", description: "Cables and adapters", isFeatured: true, isActive: true },

    // Mobile
    { name: "Xiaomi", slug: "xiaomi", description: "Smartphones and accessories", isFeatured: true, isActive: true },
    { name: "OnePlus", slug: "oneplus", description: "Premium smartphones", isFeatured: true, isActive: true },
    { name: "Realme", slug: "realme", description: "Budget smartphones", isFeatured: true, isActive: true },
    { name: "Vivo", slug: "vivo", description: "Camera-focused smartphones", isFeatured: true, isActive: true },
    { name: "Oppo", slug: "oppo", description: "Camera-focused smartphones", isFeatured: true, isActive: true },
    { name: "Walton", slug: "walton", description: "Bangladeshi electronics brand", isFeatured: true, isActive: true },
    { name: "Symphony", slug: "symphony", description: "Bangladeshi mobile brand", isFeatured: true, isActive: true },

    // Networking
    { name: "TP-Link", slug: "tp-link", description: "Networking equipment", isFeatured: true, isActive: true },
    { name: "D-Link", slug: "d-link", description: "Networking solutions", isFeatured: true, isActive: true },
    { name: "Tenda", slug: "tenda", description: "Budget networking gear", isFeatured: true, isActive: true },
    { name: "Netgear", slug: "netgear", description: "Premium networking", isFeatured: true, isActive: true },
    { name: "MikroTik", slug: "mikrotik", description: "Enterprise networking", isFeatured: true, isActive: true },
    { name: "Ubiquiti", slug: "ubiquiti", description: "UniFi networking", isFeatured: true, isActive: true },
    { name: "Hikvision", slug: "hikvision", description: "Security cameras", isFeatured: true, isActive: true },
    { name: "Dahua", slug: "dahua", description: "Security cameras", isFeatured: true, isActive: true },

    // Gaming
    { name: "PlayStation", slug: "playstation", description: "Sony gaming consoles", isFeatured: true, isActive: true },
    { name: "Xbox", slug: "xbox", description: "Microsoft gaming consoles", isFeatured: true, isActive: true },
    { name: "Nintendo", slug: "nintendo", description: "Nintendo consoles and games", isFeatured: true, isActive: true },
    { name: "Fantech", slug: "fantech", description: "Budget gaming gear", isFeatured: true, isActive: true },
    { name: "A4Tech", slug: "a4tech", description: "Budget peripherals", isFeatured: true, isActive: true },
    { name: "Rapoo", slug: "rapoo", description: "Wireless peripherals", isFeatured: true, isActive: true },

    // Office & Power
    { name: "APC", slug: "apc", description: "UPS and power solutions", isFeatured: true, isActive: true },
    { name: "CyberPower", slug: "cyberpower", description: "UPS systems", isFeatured: true, isActive: true },
    { name: "MaxGreen", slug: "maxgreen", description: "UPS and power backup", isFeatured: true, isActive: true },
    { name: "Canon", slug: "canon", description: "Printers and cameras", isFeatured: true, isActive: true },
    { name: "Epson", slug: "epson", description: "Printers and projectors", isFeatured: true, isActive: true },
  ];

  const insertedBrands = await db.insert(brands).values(brandData).$returningId();
  console.log(`Seeded ${brandData.length} brands`);

  // Helper to find brand ID
  const brandMap = new Map(brandData.map((b, i) => [b.slug, insertedBrands[i].id]));

  // ===== Products =====
  const getBrandId = (slug: string) => brandMap.get(slug) || null;

  // Get subcategory IDs
  const subCategoryMap = new Map<number, number>();
  for (let i = 0; i < subCats.length; i++) {
    subCategoryMap.set(i, subCats[i].id);
  }

  const productsData = [
    // === PROCESSORS ===
    {
      sku: "CPU-INT-I9-14900K", name: "Intel Core i9-14900K 14th Gen Processor (36M Cache, up to 6.00 GHz)",
      slug: "intel-core-i9-14900k-14th-gen", categoryId: subCategoryMap.get(2), brandId: getBrandId("intel"),
      modelNumber: "BX8071514900K", shortDescription: "Intel's flagship 14th Gen processor with 24 cores and 32 threads",
      fullDescription: "The Intel Core i9-14900K is the flagship processor of Intel's 14th Generation. Featuring 24 cores (8 Performance + 16 Efficient) and 32 threads, this processor delivers unmatched performance for gaming, content creation, and professional workloads. With a maximum turbo frequency of up to 6.00 GHz, it handles the most demanding applications with ease.",
      regularPrice: "65000.00", salePrice: "62500.00", stockQuantity: 15, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.05", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "processor,cpu,intel,14th gen,i9,gaming,high performance",
      megaCoinReward: 625, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 24,
    },
    {
      sku: "CPU-INT-I7-14700K", name: "Intel Core i7-14700K 14th Gen Processor (33M Cache, up to 5.60 GHz)",
      slug: "intel-core-i7-14700k-14th-gen", categoryId: subCategoryMap.get(2), brandId: getBrandId("intel"),
      modelNumber: "BX8071514700K", shortDescription: "High-performance 14th Gen processor with 20 cores",
      fullDescription: "The Intel Core i7-14700K features 20 cores (8P+12E) and 28 threads, offering exceptional multi-threaded performance. With Intel Turbo Boost Max Technology 3.0 reaching up to 5.60 GHz, it's perfect for gaming and heavy productivity tasks.",
      regularPrice: "45000.00", salePrice: "42500.00", stockQuantity: 20, lowStockThreshold: 5,
      stockStatus: "in_stock" as const, weight: "0.05", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "processor,cpu,intel,14th gen,i7,gaming",
      megaCoinReward: 425, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.7", reviewCount: 18,
    },
    {
      sku: "CPU-AMD-R9-7950X", name: "AMD Ryzen 9 7950X 16-Core 32-Thread Processor",
      slug: "amd-ryzen-9-7950x", categoryId: subCategoryMap.get(2), brandId: getBrandId("amd"),
      modelNumber: "100-100000514WOF", shortDescription: "16-core powerhouse with Zen 4 architecture",
      fullDescription: "The AMD Ryzen 9 7950X features 16 cores and 32 threads based on the Zen 4 architecture. With boost clocks up to 5.7 GHz and support for DDR5 memory and PCIe 5.0, it's built for the most demanding workloads including gaming, streaming, and professional content creation.",
      regularPrice: "58000.00", salePrice: "55000.00", stockQuantity: 10, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.05", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "processor,cpu,amd,ryzen 9,zen 4,gaming",
      megaCoinReward: 550, couponEligible: true, isFeatured: true,
      status: "published" as const, avgRating: "4.9", reviewCount: 15,
    },
    {
      sku: "CPU-AMD-R7-7800X3D", name: "AMD Ryzen 7 7800X3D 8-Core Processor with 3D V-Cache",
      slug: "amd-ryzen-7-7800x3d", categoryId: subCategoryMap.get(2), brandId: getBrandId("amd"),
      modelNumber: "100-100000910WOF", shortDescription: "The ultimate gaming processor with 3D V-Cache technology",
      fullDescription: "The AMD Ryzen 7 7800X3D is widely regarded as the best gaming processor on the market. With 8 cores, 16 threads, and AMD's revolutionary 3D V-Cache technology delivering 96MB of L3 cache, it provides unmatched gaming performance.",
      regularPrice: "42000.00", salePrice: "39500.00", stockQuantity: 8, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.05", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "processor,cpu,amd,ryzen 7,3d v-cache,gaming,best",
      megaCoinReward: 395, couponEligible: true, isFeatured: true, isBestSeller: true, isNewArrival: true,
      status: "published" as const, avgRating: "5.0", reviewCount: 32,
    },

    // === GRAPHICS CARDS ===
    {
      sku: "GPU-RTX-4090-24G", name: "ASUS ROG Strix RTX 4090 OC 24GB GDDR6X Graphics Card",
      slug: "asus-rog-strix-rtx-4090-24gb", categoryId: subCategoryMap.get(4), brandId: getBrandId("asus"),
      modelNumber: "ROG-STRIX-RTX4090-O24G-GAMING", shortDescription: "NVIDIA's flagship GPU with 24GB GDDR6X memory",
      fullDescription: "The ASUS ROG Strix GeForce RTX 4090 OC Edition delivers the ultimate gaming and creative performance. Powered by NVIDIA's Ada Lovelace architecture with 16384 CUDA cores and 24GB of GDDR6X memory, it handles 4K gaming, ray tracing, and AI workloads with ease.",
      regularPrice: "225000.00", salePrice: "218000.00", stockQuantity: 5, lowStockThreshold: 2,
      stockStatus: "in_stock" as const, weight: "2.50", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "gpu,graphics card,nvidia,rtx 4090,gaming,high end",
      megaCoinReward: 2180, couponEligible: true, isFeatured: true,
      status: "published" as const, avgRating: "4.9", reviewCount: 8,
    },
    {
      sku: "GPU-RTX-4070-12G", name: "MSI Gaming X Trio RTX 4070 12GB GDDR6X Graphics Card",
      slug: "msi-gaming-x-trio-rtx-4070-12gb", categoryId: subCategoryMap.get(4), brandId: getBrandId("msi"),
      modelNumber: "RTX 4070 GAMING X TRIO 12G", shortDescription: "High-performance 1440p gaming GPU",
      fullDescription: "The MSI GeForce RTX 4070 Gaming X Trio 12G delivers exceptional 1440p and entry-level 4K gaming performance. With NVIDIA's Ada Lovelace architecture, 12GB GDDR6X memory, and MSI's renowned Tri Frozr 3 cooling solution.",
      regularPrice: "85000.00", salePrice: "79000.00", stockQuantity: 12, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "1.60", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "gpu,graphics card,nvidia,rtx 4070,gaming,1440p",
      megaCoinReward: 790, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.7", reviewCount: 22,
    },
    {
      sku: "GPU-RX-7800XT-16G", name: "Sapphire PULSE RX 7800 XT 16GB GDDR6 Graphics Card",
      slug: "sapphire-pulse-rx-7800-xt-16gb", categoryId: subCategoryMap.get(4), brandId: getBrandId("amd"),
      modelNumber: "11330-02-40G", shortDescription: "AMD's 1440p gaming champion with 16GB VRAM",
      fullDescription: "The Sapphire PULSE AMD Radeon RX 7800 XT features 16GB of GDDR6 memory and is designed for exceptional 1440p gaming. With AMD RDNA 3 architecture and impressive price-to-performance ratio.",
      regularPrice: "62000.00", salePrice: "58500.00", stockQuantity: 8, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "1.40", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "gpu,graphics card,amd,rx 7800 xt,gaming",
      megaCoinReward: 585, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.6", reviewCount: 14,
    },

    // === RAM ===
    {
      sku: "RAM-COR-32G-D5", name: "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz C36",
      slug: "corsair-vengeance-rgb-32gb-ddr5-6000", categoryId: subCategoryMap.get(5), brandId: getBrandId("corsair"),
      modelNumber: "CMH32GX5M2E6000C36", shortDescription: "High-speed DDR5 RGB memory kit",
      fullDescription: "Corsair Vengeance RGB DDR5 memory delivers high performance with speeds up to 6000MHz. This 32GB (2x16GB) kit features stunning dynamic RGB lighting, optimized for Intel and AMD DDR5 platforms.",
      regularPrice: "18500.00", salePrice: "16800.00", stockQuantity: 25, lowStockThreshold: 5,
      stockStatus: "in_stock" as const, weight: "0.10", warrantyDuration: 120, warrantyType: "replacement" as const,
      returnPolicyDays: 7, tags: "ram,memory,ddr5,corsair,rgb,gaming,32gb",
      megaCoinReward: 168, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 30,
    },
    {
      sku: "RAM-KST-32G-D5", name: "Kingston Fury Beast 32GB (2x16GB) DDR5 5600MHz",
      slug: "kingston-fury-beast-32gb-ddr5-5600", categoryId: subCategoryMap.get(5), brandId: getBrandId("kingston"),
      modelNumber: "KF556C40BBK2-32", shortDescription: "Reliable DDR5 performance memory",
      fullDescription: "Kingston FURY Beast DDR5 memory brings the latest cutting-edge technology for next-gen gaming platforms. With speeds up to 5600MHz, this 32GB kit ensures smooth multitasking and gaming performance.",
      regularPrice: "15000.00", salePrice: "13800.00", stockQuantity: 30, lowStockThreshold: 5,
      stockStatus: "in_stock" as const, weight: "0.10", warrantyDuration: 120, warrantyType: "replacement" as const,
      returnPolicyDays: 7, tags: "ram,memory,ddr5,kingston,32gb,gaming",
      megaCoinReward: 138, couponEligible: true, isFeatured: true,
      status: "published" as const, avgRating: "4.6", reviewCount: 12,
    },

    // === SSD ===
    {
      sku: "SSD-SAM-1TB-990", name: "Samsung 990 PRO 1TB NVMe Gen4 M.2 SSD",
      slug: "samsung-990-pro-1tb-nvme", categoryId: subCategoryMap.get(6), brandId: getBrandId("samsung"),
      modelNumber: "MZ-V9P1T0BW", shortDescription: "Ultra-fast Gen4 NVMe with up to 7450MB/s read",
      fullDescription: "The Samsung 990 PRO 1TB delivers unprecedented speeds with sequential read up to 7,450 MB/s and write up to 6,900 MB/s. Powered by Samsung's Pascal controller, it's the ultimate SSD for gaming and professional workloads.",
      regularPrice: "16500.00", salePrice: "14800.00", stockQuantity: 40, lowStockThreshold: 5,
      stockStatus: "in_stock" as const, weight: "0.05", warrantyDuration: 60, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "ssd,nvme,samsung,990 pro,1tb,gen4,gaming,fast",
      megaCoinReward: 148, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.9", reviewCount: 45,
    },
    {
      sku: "SSD-WD-1TB-SN850X", name: "Western Digital Black SN850X 1TB NVMe Gen4 M.2 SSD",
      slug: "wd-black-sn850x-1tb-nvme", categoryId: subCategoryMap.get(6), brandId: getBrandId("western-digital"),
      modelNumber: "WDS100T2X0E", shortDescription: "Gaming-focused NVMe SSD with up to 7300MB/s",
      fullDescription: "The WD_BLACK SN850X NVMe SSD delivers top-tier performance for gaming with read speeds up to 7,300 MB/s. With Game Mode 2.0 and predictive loading, it reduces game load times significantly.",
      regularPrice: "14000.00", salePrice: "12500.00", stockQuantity: 35, lowStockThreshold: 5,
      stockStatus: "in_stock" as const, weight: "0.05", warrantyDuration: 60, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "ssd,nvme,wd,black,sn850x,1tb,gaming",
      megaCoinReward: 125, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.7", reviewCount: 20,
    },

    // === MOTHERBOARD ===
    {
      sku: "MB-ASUS-Z790-H", name: "ASUS ROG Strix Z790-H Gaming WiFi DDR5 Motherboard",
      slug: "asus-rog-strix-z790-h-gaming", categoryId: subCategoryMap.get(3), brandId: getBrandId("asus"),
      modelNumber: "ROG STRIX Z790-H GAMING WIFI", shortDescription: "Intel 12th/13th/14th Gen DDR5 motherboard",
      fullDescription: "The ROG Strix Z790-H Gaming WiFi is built for performance with DDR5 support, PCIe 5.0, WiFi 6E, and robust power delivery. Features AI overclocking, comprehensive cooling, and Aura Sync RGB lighting.",
      regularPrice: "48000.00", salePrice: "45000.00", stockQuantity: 10, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "1.80", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "motherboard,intel,z790,asus,rog,ddr5,wifi",
      megaCoinReward: 450, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.7", reviewCount: 10,
    },

    // === MONITOR ===
    {
      sku: "MON-LG-27GP850", name: "LG UltraGear 27GP850 27\" QHD 165Hz Nano IPS Gaming Monitor",
      slug: "lg-ultragear-27gp850-27-qhd-165hz", categoryId: subCategoryMap.get(10), brandId: getBrandId("lg"),
      modelNumber: "27GP850-B", shortDescription: "1ms GtG, G-Sync Compatible, HDR400",
      fullDescription: "The LG UltraGear 27GP850 features a 27-inch QHD Nano IPS panel with 165Hz refresh rate (OC 180Hz), 1ms GtG response time, and 98% DCI-P3 color gamut. NVIDIA G-Sync Compatible and AMD FreeSync Premium certified.",
      regularPrice: "52000.00", salePrice: "48500.00", stockQuantity: 8, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "5.20", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "614.4 x 574.9 x 293.0 mm",
      tags: "monitor,gaming,lg,ultragear,165hz,qhd,ips",
      megaCoinReward: 485, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 28,
    },
    {
      sku: "MON-SAM-32-Odyssey", name: "Samsung Odyssey G5 32\" QHD 165Hz Curved Gaming Monitor",
      slug: "samsung-odyssey-g5-32-qhd-165hz", categoryId: subCategoryMap.get(10), brandId: getBrandId("samsung"),
      modelNumber: "LS32AG550ENMXUE", shortDescription: "1000R curved, 1ms MPRT, HDR10",
      fullDescription: "The Samsung Odyssey G5 features a 32-inch QHD VA panel with 1000R curvature, 165Hz refresh rate, and 1ms MPRT response time. AMD FreeSync Premium support ensures smooth, tear-free gaming.",
      regularPrice: "42000.00", salePrice: "38500.00", stockQuantity: 12, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "6.50", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "710.3 x 586.3 x 272.6 mm",
      tags: "monitor,gaming,samsung,odyssey,165hz,curved,qhd",
      megaCoinReward: 385, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.6", reviewCount: 16,
    },

    // === LAPTOP ===
    {
      sku: "LAP-ASUS-G15-2024", name: "ASUS ROG Strix G15 2024 Ryzen 9 RTX 4070 Gaming Laptop",
      slug: "asus-rog-strix-g15-2024-ryzen-9-rtx4070", categoryId: subCategoryMap.get(1), brandId: getBrandId("asus"),
      modelNumber: "G513QY-HF002W", shortDescription: "Ryzen 9 7945HX, RTX 4070, 16GB DDR5, 1TB SSD",
      fullDescription: "The ASUS ROG Strix G15 (2024) is a powerhouse gaming laptop featuring AMD Ryzen 9 7945HX processor, NVIDIA GeForce RTX 4070 laptop GPU, 16GB DDR5 RAM, and 1TB NVMe SSD. The 15.6-inch QHD 165Hz display delivers stunning visuals.",
      regularPrice: "195000.00", salePrice: "182000.00", stockQuantity: 5, lowStockThreshold: 2,
      stockStatus: "in_stock" as const, weight: "2.50", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "354 x 259 x 22.6~27.2 mm",
      tags: "laptop,gaming,asus,rog,rtx 4070,ryzen 9",
      megaCoinReward: 1820, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 7,
    },
    {
      sku: "LAP-LENO-L5-2024", name: "Lenovo Legion 5 2024 i7-13700H RTX 4060 Gaming Laptop",
      slug: "lenovo-legion-5-2024-i7-rtx4060", categoryId: subCategoryMap.get(1), brandId: getBrandId("lenovo"),
      modelNumber: "82WK00K1US", shortDescription: "i7-13700H, RTX 4060, 16GB DDR5, 512GB SSD",
      fullDescription: "The Lenovo Legion 5 features Intel Core i7-13700H, NVIDIA RTX 4060, 16GB DDR5 RAM, and a 15.6-inch FHD 165Hz display. With Legion Coldfront 5.0 cooling and AI tuning, it delivers exceptional gaming performance.",
      regularPrice: "155000.00", salePrice: "142000.00", stockQuantity: 7, lowStockThreshold: 2,
      stockStatus: "in_stock" as const, weight: "2.40", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "359.6 x 262.4 x 22.45-25.2 mm",
      tags: "laptop,gaming,lenovo,legion,rtx 4060,intel",
      megaCoinReward: 1420, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.7", reviewCount: 12,
    },

    // === MOBILE PHONE ===
    {
      sku: "MOB-XIA-14T-PRO", name: "Xiaomi 14T Pro 5G (12GB/512GB) - Titan Black",
      slug: "xiaomi-14t-pro-5g-12gb-512gb", categoryId: subCategoryMap.get(15), brandId: getBrandId("xiaomi"),
      modelNumber: "2407FPN8EG", shortDescription: "Dimensity 9300+, Leica camera, 144Hz AMOLED",
      fullDescription: "The Xiaomi 14T Pro features MediaTek Dimensity 9300+ chipset, a stunning 6.67-inch 144Hz AMOLED display co-engineered with Leica, and a 50MP Leica main camera. With 12GB RAM and 512GB storage, IP68 rating, and 5000mAh battery with 120W charging.",
      regularPrice: "72000.00", salePrice: "68500.00", stockQuantity: 15, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.21", warrantyDuration: 12, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "160.4 x 75.1 x 8.39 mm",
      tags: "mobile,smartphone,xiaomi,5g,leica,144hz,flagship",
      megaCoinReward: 685, couponEligible: true, isFeatured: true, isNewArrival: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.7", reviewCount: 35,
    },
    {
      sku: "MOB-SAM-S24U-512", name: "Samsung Galaxy S24 Ultra 5G (12GB/512GB) - Titanium Gray",
      slug: "samsung-galaxy-s24-ultra-12gb-512gb", categoryId: subCategoryMap.get(15), brandId: getBrandId("samsung"),
      modelNumber: "SM-S928BZTCXME", shortDescription: "Snapdragon 8 Gen 3, S Pen, 200MP camera, AI",
      fullDescription: "The Samsung Galaxy S24 Ultra is the ultimate AI-powered smartphone. Features Snapdragon 8 Gen 3 for Galaxy, a stunning 6.8-inch QHD+ 120Hz AMOLED display, 200MP adaptive pixel camera, built-in S Pen, and Galaxy AI features.",
      regularPrice: "195000.00", salePrice: "178000.00", stockQuantity: 10, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.23", warrantyDuration: 12, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "162.3 x 79.0 x 8.6 mm",
      tags: "mobile,smartphone,samsung,galaxy s24 ultra,ai,s pen,200mp",
      megaCoinReward: 1780, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 42,
    },

    // === KEYBOARD ===
    {
      sku: "KB-LOG-G715", name: "Logitech G715 Wireless Mechanical Gaming Keyboard",
      slug: "logitech-g715-wireless-mechanical", categoryId: subCategoryMap.get(30), brandId: getBrandId("logitech"),
      modelNumber: "920-010519", shortDescription: "GX Brown Tactile, LIGHTSYNC RGB, Palm rest",
      fullDescription: "The Logitech G715 is a compact wireless mechanical gaming keyboard featuring GX Brown tactile switches, LIGHTSYNC RGB lighting, and a cloud-shaped palm rest. Connect via LIGHTSPEED wireless, Bluetooth, or USB-C.",
      regularPrice: "22000.00", salePrice: "19500.00", stockQuantity: 15, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.98", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "360 x 150 x 38 mm",
      tags: "keyboard,mechanical,gaming,logitech,wireless,rgb",
      megaCoinReward: 195, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.6", reviewCount: 9,
    },
    {
      sku: "KB-RED-K530", name: "Redragon K530 Draconic 60% Wireless Mechanical Keyboard",
      slug: "redragon-k530-draconic-60-wireless", categoryId: subCategoryMap.get(30), brandId: getBrandId("redragon"),
      modelNumber: "K530-RGB-PRO", shortDescription: "Brown switches, tri-mode connectivity, RGB",
      fullDescription: "The Redragon K530 Draconic Pro is a compact 60% wireless mechanical keyboard with Outemu Brown switches. Features tri-mode connectivity (2.4G, Bluetooth 5.0, wired), hot-swappable switches, and vibrant RGB backlighting.",
      regularPrice: "5500.00", salePrice: "4200.00", stockQuantity: 25, lowStockThreshold: 5,
      stockStatus: "in_stock" as const, weight: "0.60", warrantyDuration: 12, warrantyType: "replacement" as const,
      returnPolicyDays: 7, dimensions: "295 x 105 x 38 mm",
      tags: "keyboard,mechanical,gaming,redragon,60%,wireless,budget",
      megaCoinReward: 42, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.5", reviewCount: 18,
    },

    // === MOUSE ===
    {
      sku: "MOU-LOG-GPROX", name: "Logitech G Pro X Superlight 2 Wireless Gaming Mouse",
      slug: "logitech-g-pro-x-superlight-2", categoryId: subCategoryMap.get(31), brandId: getBrandId("logitech"),
      modelNumber: "910-006636", shortDescription: "60g, HERO 2 32K sensor, LIGHTSPEED, 88hr battery",
      fullDescription: "The Logitech G Pro X Superlight 2 is an ultra-lightweight wireless gaming mouse weighing just 60g. Features the HERO 2 32K DPI sensor, LIGHTSPEED wireless technology, and up to 88 hours of battery life. Trusted by esports professionals worldwide.",
      regularPrice: "17500.00", salePrice: "15800.00", stockQuantity: 20, lowStockThreshold: 5,
      stockStatus: "in_stock" as const, weight: "0.06", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "125.0 x 63.5 x 40.0 mm",
      tags: "mouse,gaming,logitech,wireless,ultralight,esports",
      megaCoinReward: 158, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.9", reviewCount: 25,
    },
    {
      sku: "MOU-RAZ-V3PRO", name: "Razer DeathAdder V3 Pro Wireless Gaming Mouse",
      slug: "razer-deathadder-v3-pro-wireless", categoryId: subCategoryMap.get(31), brandId: getBrandId("razer"),
      modelNumber: "RZ01-04630100-R3A1", shortDescription: "63g, Focus Pro 30K optical sensor, 90hr battery",
      fullDescription: "The Razer DeathAdder V3 Pro features an ultra-lightweight 63g design, Focus Pro 30K Optical Sensor, and Razer HyperSpeed Wireless. With up to 90 hours of battery life and ergonomic right-handed design, it's built for competitive gaming.",
      regularPrice: "19500.00", salePrice: "17500.00", stockQuantity: 15, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.063", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "128.0 x 68.0 x 44.0 mm",
      tags: "mouse,gaming,razer,wireless,deathadder,esports",
      megaCoinReward: 175, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 20,
    },

    // === HEADSET ===
    {
      sku: "HS-HYP-CA2", name: "HyperX Cloud Alpha II Wireless Gaming Headset",
      slug: "hyperx-cloud-alpha-ii-wireless", categoryId: subCategoryMap.get(12), brandId: getBrandId("hyperx"),
      modelNumber: "727A9AA", shortDescription: "DTS Headphone:X, 300hr battery, noise-cancelling mic",
      fullDescription: "The HyperX Cloud Alpha II Wireless delivers exceptional audio with custom-tuned 50mm drivers and DTS Headphone:X spatial audio. Features an incredible 300-hour battery life, memory foam ear cushions, and a detachable noise-cancelling microphone.",
      regularPrice: "16500.00", salePrice: "14800.00", stockQuantity: 12, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.32", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "188 x 97 x 205 mm",
      tags: "headset,gaming,hyperx,wireless,dts,300hr battery",
      megaCoinReward: 148, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.7", reviewCount: 14,
    },

    // === ROUTER ===
    {
      sku: "RT-TP-AX6000", name: "TP-Link Archer AX6000 WiFi 6 Router",
      slug: "tp-link-archer-ax6000-wifi6", categoryId: subCategoryMap.get(20), brandId: getBrandId("tp-link"),
      modelNumber: "Archer AX6000", shortDescription: "Dual-band WiFi 6, 8-stream, 2.5G WAN port",
      fullDescription: "The TP-Link Archer AX6000 delivers next-gen WiFi 6 speeds up to 5952 Mbps with OFDMA and MU-MIMO technology. Features a 1.8GHz quad-core CPU, 8 high-gain antennas, and a 2.5G WAN port for ultra-fast internet.",
      regularPrice: "22000.00", salePrice: "19500.00", stockQuantity: 10, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "0.92", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "router,wifi 6,tp-link,ax6000,gaming,mesh",
      megaCoinReward: 195, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.6", reviewCount: 8,
    },

    // === GAMING CONSOLE ===
    {
      sku: "CON-PS5-SLIM", name: "Sony PlayStation 5 Slim Disc Edition",
      slug: "sony-playstation-5-slim-disc", categoryId: subCategoryMap.get(19), brandId: getBrandId("playstation"),
      modelNumber: "CFI-2016A", shortDescription: "Ultra-HD Blu-ray, 1TB SSD, haptic feedback, ray tracing",
      fullDescription: "The PS5 Slim offers the same powerful gaming experience in a more compact design. Features a custom AMD Zen 2 CPU, RDNA 2 GPU for ray tracing, 1TB custom SSD for lightning-fast load times, and the innovative DualSense controller with haptic feedback.",
      regularPrice: "72000.00", salePrice: "68500.00", stockQuantity: 8, lowStockThreshold: 2,
      stockStatus: "in_stock" as const, weight: "3.20", warrantyDuration: 12, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "358 x 96 x 216 mm",
      tags: "console,playstation,ps5,sony,gaming,ray tracing",
      megaCoinReward: 685, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.9", reviewCount: 56,
    },

    // === UPS ===
    {
      sku: "UPS-APC-1100", name: "APC Back-UPS 1100VA 230V AVR - BX1100C-IN",
      slug: "apc-back-ups-1100va-bx1100c", categoryId: subCategoryMap.get(26), brandId: getBrandId("apc"),
      modelNumber: "BX1100C-IN", shortDescription: "4 universal sockets, AVR, 1100VA/660W",
      fullDescription: "The APC Back-UPS 1100VA provides battery backup and surge protection for your electronics. Features 4 universal sockets, Automatic Voltage Regulation (AVR), and PowerChute software for safe system shutdown.",
      regularPrice: "12500.00", salePrice: "10800.00", stockQuantity: 15, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "8.50", warrantyDuration: 24, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "190 x 100 x 300 mm",
      tags: "ups,power backup,apc,1100va,avr,protection",
      megaCoinReward: 108, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.5", reviewCount: 22,
    },

    // === CPU COOLER ===
    {
      sku: "COOL-NH-D15", name: "Noctua NH-D15 Chromax.Black Dual-Tower CPU Cooler",
      slug: "noctua-nh-d15-chromax-black", categoryId: subCategoryMap.get(7), brandId: getBrandId("noctua"),
      modelNumber: "NH-D15 chromax.black", shortDescription: "Dual NF-A15 fans, 6 heatpipes, 250W TDP",
      fullDescription: "The Noctua NH-D15 chromax.black is the ultimate air cooler with a dual-tower design, 6 heatpipes, and two premium NF-A15 140mm fans. Capable of cooling CPUs up to 250W TDP while maintaining whisper-quiet operation.",
      regularPrice: "13500.00", salePrice: "12000.00", stockQuantity: 8, lowStockThreshold: 2,
      stockStatus: "in_stock" as const, weight: "1.32", warrantyDuration: 72, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "165 x 150 x 161 mm",
      tags: "cooler,cpu cooler,noctua,nh-d15,air cooling,premium",
      megaCoinReward: 120, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.9", reviewCount: 11,
    },

    // === PC CASING ===
    {
      sku: "CASE-LAN-215", name: "Lian Li O11 Dynamic EVO Mid Tower Case - Black",
      slug: "lian-li-o11-dynamic-evo-mid-tower-black", categoryId: subCategoryMap.get(8), brandId: getBrandId("lian-li"),
      modelNumber: "O11DEX", shortDescription: "Dual chamber, tempered glass, E-ATX support, reversible",
      fullDescription: "The Lian Li O11 Dynamic EVO is a premium dual-chamber mid-tower case featuring reversible layout, extensive radiator support, and stunning tempered glass panels. Supports E-ATX motherboards and offers excellent cable management.",
      regularPrice: "19500.00", salePrice: "17800.00", stockQuantity: 6, lowStockThreshold: 2,
      stockStatus: "in_stock" as const, weight: "11.86", warrantyDuration: 12, warrantyType: "replacement" as const,
      returnPolicyDays: 7, dimensions: "478 x 290 x 471 mm",
      tags: "casing,pc case,lian li,o11 dynamic,atx,dual chamber",
      megaCoinReward: 178, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 9,
    },

    // === POWER SUPPLY ===
    {
      sku: "PSU-COR-RM850", name: "Corsair RM850x (2021) 850W 80+ Gold Full Modular PSU",
      slug: "corsair-rm850x-2021-850w-gold", categoryId: subCategoryMap.get(9), brandId: getBrandId("corsair"),
      modelNumber: "CP-9020200-NA", shortDescription: "850W, 80+ Gold, Zero RPM fan, 10yr warranty",
      fullDescription: "The Corsair RM850x (2021) delivers 850W of reliable, efficient power with 80+ Gold certification. Features fully modular cables, a 135mm magnetic levitation fan with Zero RPM mode, and Japanese capacitors for long-term reliability.",
      regularPrice: "16500.00", salePrice: "14800.00", stockQuantity: 12, lowStockThreshold: 3,
      stockStatus: "in_stock" as const, weight: "1.70", warrantyDuration: 120, warrantyType: "official" as const,
      returnPolicyDays: 7, tags: "psu,power supply,corsair,850w,gold,modular",
      megaCoinReward: 148, couponEligible: true, isFeatured: true, isBestSeller: true,
      status: "published" as const, avgRating: "4.8", reviewCount: 15,
    },

    // === GAMING CHAIR ===
    {
      sku: "CHAIR-RAZ-ISKUR", name: "Razer Iskur V2 Ergonomic Gaming Chair - Black/Green",
      slug: "razer-iskur-v2-gaming-chair-black-green", categoryId: subCategoryMap.get(21), brandId: getBrandId("razer"),
      modelNumber: "RZ38-03970100-R3U1", shortDescription: "Lumbar support, 4D armrests, multi-tilt, faux leather",
      fullDescription: "The Razer Iskur V2 features an ergonomic lumbar support system, 4D adjustable armrests, and high-density foam cushions wrapped in premium faux leather. Supports up to 136kg and is built for all-day comfort during gaming sessions.",
      regularPrice: "55000.00", salePrice: "48000.00", stockQuantity: 5, lowStockThreshold: 2,
      stockStatus: "in_stock" as const, weight: "30.0", warrantyDuration: 36, warrantyType: "official" as const,
      returnPolicyDays: 7, dimensions: "700 x 680 x 1380 mm",
      tags: "chair,gaming chair,razer,iskur,ergonomic",
      megaCoinReward: 480, couponEligible: true, isFeatured: true, isBestSeller: false,
      status: "published" as const, avgRating: "4.5", reviewCount: 6,
    },
  ];

  // Insert products
  for (const product of productsData as any[]) {
    await db.insert(products).values(product);
  }
  console.log(`Seeded ${productsData.length} products`);

  // ===== Insert product specifications for key products =====
  const allProducts = await db.select({ id: products.id, sku: products.sku }).from(products);

  for (const prod of allProducts) {
    const specs: { specKey: string; specValue: string; specGroup: string }[] = [];

    if (prod.sku.includes("CPU-INT-I9")) {
      specs.push(
        { specKey: "Brand", specValue: "Intel", specGroup: "General" },
        { specKey: "Series", specValue: "Core i9", specGroup: "General" },
        { specKey: "Generation", specValue: "14th Gen (Raptor Lake Refresh)", specGroup: "General" },
        { specKey: "Socket", specValue: "LGA1700", specGroup: "General" },
        { specKey: "Core Count", specValue: "24 (8P + 16E)", specGroup: "Performance" },
        { specKey: "Thread Count", specValue: "32", specGroup: "Performance" },
        { specKey: "Base Frequency", specValue: "3.20 GHz (P-core)", specGroup: "Performance" },
        { specKey: "Max Turbo", specValue: "Up to 6.00 GHz", specGroup: "Performance" },
        { specKey: "Cache", specValue: "36MB Intel Smart Cache", specGroup: "Performance" },
        { specKey: "TDP", specValue: "125W (Base) / 253W (Max Turbo)", specGroup: "Power" },
        { specKey: "Memory Support", specValue: "DDR5-5600 / DDR4-3200", specGroup: "Memory" },
        { specKey: "Integrated Graphics", specValue: "Intel UHD Graphics 770", specGroup: "Graphics" },
      );
    } else if (prod.sku.includes("CPU-AMD-R7-7800X3D")) {
      specs.push(
        { specKey: "Brand", specValue: "AMD", specGroup: "General" },
        { specKey: "Series", specValue: "Ryzen 7", specGroup: "General" },
        { specKey: "Architecture", specValue: "Zen 4 (5nm)", specGroup: "General" },
        { specKey: "Socket", specValue: "AM5", specGroup: "General" },
        { specKey: "Core Count", specValue: "8", specGroup: "Performance" },
        { specKey: "Thread Count", specValue: "16", specGroup: "Performance" },
        { specKey: "Base Frequency", specValue: "4.20 GHz", specGroup: "Performance" },
        { specKey: "Max Boost", specValue: "Up to 5.00 GHz", specGroup: "Performance" },
        { specKey: "L3 Cache", specValue: "96MB (3D V-Cache)", specGroup: "Performance" },
        { specKey: "TDP", specValue: "120W", specGroup: "Power" },
        { specKey: "Memory Support", specValue: "DDR5-5200 (Dual Channel)", specGroup: "Memory" },
        { specKey: "PCIe Support", specValue: "PCIe 5.0", specGroup: "Connectivity" },
      );
    } else if (prod.sku.includes("GPU-RTX-4090")) {
      specs.push(
        { specKey: "Brand", specValue: "NVIDIA", specGroup: "General" },
        { specKey: "GPU", specValue: "GeForce RTX 4090", specGroup: "General" },
        { specKey: "Architecture", specValue: "Ada Lovelace", specGroup: "General" },
        { specKey: "CUDA Cores", specValue: "16,384", specGroup: "Performance" },
        { specKey: "VRAM", specValue: "24GB GDDR6X", specGroup: "Memory" },
        { specKey: "Memory Bus", specValue: "384-bit", specGroup: "Memory" },
        { specKey: "Boost Clock", specValue: "Up to 2610 MHz (OC Mode)", specGroup: "Performance" },
        { specKey: "TDP", specValue: "450W (Recommended 850W PSU)", specGroup: "Power" },
        { specKey: "Power Connectors", specValue: "1x 16-pin (12VHPWR)", specGroup: "Power" },
        { specKey: "Display Outputs", specValue: "2x HDMI 2.1a, 3x DP 1.4a", specGroup: "Connectivity" },
        { specKey: "Dimensions", specValue: "357.6 x 149.3 x 70.1 mm", specGroup: "Physical" },
      );
    } else if (prod.sku.includes("GPU-RTX-4070")) {
      specs.push(
        { specKey: "Brand", specValue: "NVIDIA", specGroup: "General" },
        { specKey: "GPU", specValue: "GeForce RTX 4070", specGroup: "General" },
        { specKey: "Architecture", specValue: "Ada Lovelace", specGroup: "General" },
        { specKey: "CUDA Cores", specValue: "5,888", specGroup: "Performance" },
        { specKey: "VRAM", specValue: "12GB GDDR6X", specGroup: "Memory" },
        { specKey: "Memory Bus", specValue: "192-bit", specGroup: "Memory" },
        { specKey: "Boost Clock", specValue: "Up to 2610 MHz", specGroup: "Performance" },
        { specKey: "TDP", specValue: "200W (Recommended 650W PSU)", specGroup: "Power" },
        { specKey: "Display Outputs", specValue: "1x HDMI 2.1a, 3x DP 1.4a", specGroup: "Connectivity" },
      );
    } else if (prod.sku.includes("RAM-COR")) {
      specs.push(
        { specKey: "Capacity", specValue: "32GB (2 x 16GB)", specGroup: "General" },
        { specKey: "Type", specValue: "DDR5", specGroup: "General" },
        { specKey: "Speed", specValue: "6000MHz", specGroup: "Performance" },
        { specKey: "CAS Latency", specValue: "C36", specGroup: "Timing" },
        { specKey: "Voltage", specValue: "1.35V", specGroup: "Power" },
        { specKey: "Heat Spreader", specValue: "Aluminum with RGB", specGroup: "Design" },
        { specKey: "Compatibility", specValue: "Intel XMP 3.0 / AMD EXPO", specGroup: "Compatibility" },
      );
    } else if (prod.sku.includes("SSD-SAM-990")) {
      specs.push(
        { specKey: "Capacity", specValue: "1TB", specGroup: "General" },
        { specKey: "Interface", specValue: "PCIe Gen 4.0 x4, NVMe 2.0", specGroup: "General" },
        { specKey: "Form Factor", specValue: "M.2 2280", specGroup: "Physical" },
        { specKey: "Sequential Read", specValue: "Up to 7,450 MB/s", specGroup: "Performance" },
        { specKey: "Sequential Write", specValue: "Up to 6,900 MB/s", specGroup: "Performance" },
        { specKey: "Controller", specValue: "Samsung Pascal", specGroup: "Internals" },
        { specKey: "NAND", specValue: "Samsung V-NAND 7th Gen", specGroup: "Internals" },
        { specKey: "Endurance", specValue: "600 TBW", specGroup: "Reliability" },
      );
    }

    if (specs.length > 0) {
      await db.insert(productSpecifications).values(
        specs.map(s => ({ ...s, productId: prod.id }))
      );
    }
  }
  console.log("Product specifications seeded");

  // ===== Coupons =====
  await db.insert(coupons).values([
    {
      code: "WELCOME50", description: "50৳ off on your first order", discountType: "fixed_amount",
      discountValue: "50.00", minimumOrderAmount: "500.00", maximumDiscount: "50.00",
      usageLimit: 1000, perUserLimit: 1, startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), isActive: true,
    },
    {
      code: "TECH10", description: "10% off on all tech products", discountType: "percentage",
      discountValue: "10.00", minimumOrderAmount: "2000.00", maximumDiscount: "2000.00",
      usageLimit: 500, perUserLimit: 2, startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true,
    },
    {
      code: "FREESHIP", description: "Free shipping on orders above 3000৳", discountType: "free_shipping",
      discountValue: "60.00", minimumOrderAmount: "3000.00",
      usageLimit: 1000, perUserLimit: 5, startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true,
    },
    {
      code: "GAMING15", description: "15% off on gaming products", discountType: "percentage",
      discountValue: "15.00", minimumOrderAmount: "5000.00", maximumDiscount: "3000.00",
      usageLimit: 200, perUserLimit: 1, startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), isActive: true,
    },
  ]);
  console.log("Coupons seeded");

  // ===== Banners =====
  await db.insert(banners).values([
    {
      title: "Summer Tech Sale", subtitle: "Up to 30% off on selected electronics",
      image: "/banner1.jpg", link: "/category/computing-components",
      position: "home_hero", sortOrder: 1, isActive: true,
      startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Build Your Dream PC", subtitle: "Custom PC Builder with compatibility check",
      image: "/banner2.jpg", link: "/pc-builder",
      position: "home_hero", sortOrder: 2, isActive: true,
      startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Gaming Week", subtitle: "Special discounts on gaming gear",
      image: "/banner3.jpg", link: "/category/gaming",
      position: "home_hero", sortOrder: 3, isActive: true,
      startDate: new Date(), endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log("Banners seeded");

  // ===== Delivery Zones =====
  await db.insert(deliveryZones).values([
    { name: "Dhaka City", divisions: "Dhaka", districts: "Dhaka,Gazipur,Narayanganj", baseCharge: "60.00", expressCharge: "120.00", freeShippingThreshold: "5000.00", estimatedDays: 1, isActive: true },
    { name: "Chittagong City", divisions: "Chittagong", districts: "Chittagong", baseCharge: "80.00", expressCharge: "150.00", freeShippingThreshold: "5000.00", estimatedDays: 2, isActive: true },
    { name: "Sylhet Region", divisions: "Sylhet", districts: "Sylhet,Moulvibazar,Habiganj", baseCharge: "100.00", expressCharge: "180.00", freeShippingThreshold: "5000.00", estimatedDays: 3, isActive: true },
    { name: "Rajshahi Region", divisions: "Rajshahi", districts: "Rajshahi,Bogra,Natore", baseCharge: "100.00", expressCharge: "180.00", freeShippingThreshold: "5000.00", estimatedDays: 3, isActive: true },
    { name: "Khulna Region", divisions: "Khulna", districts: "Khulna,Jessore,Satkhira", baseCharge: "100.00", expressCharge: "180.00", freeShippingThreshold: "5000.00", estimatedDays: 3, isActive: true },
    { name: "Barisal Region", divisions: "Barisal", districts: "Barisal,Patuakhali,Pirojpur", baseCharge: "120.00", expressCharge: "200.00", freeShippingThreshold: "5000.00", estimatedDays: 3, isActive: true },
    { name: "Rangpur Region", divisions: "Rangpur", districts: "Rangpur,Dinajpur,Kurigram", baseCharge: "120.00", expressCharge: "200.00", freeShippingThreshold: "5000.00", estimatedDays: 3, isActive: true },
    { name: "Mymensingh Region", divisions: "Mymensingh", districts: "Mymensingh,Jamalpur,Sherpur", baseCharge: "100.00", expressCharge: "180.00", freeShippingThreshold: "5000.00", estimatedDays: 2, isActive: true },
  ]);
  console.log("Delivery zones seeded");

  console.log("Seed completed successfully!");
}

seed().catch(console.error);
