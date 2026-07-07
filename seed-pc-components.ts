import { getDb } from "./api/queries/connection";
import { categories, products, productSpecifications } from "./db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    const db = getDb();
    
    console.log("Seeding PC Components...");

    const componentData = [
      {
        catName: "Processor",
        catSlug: "processor",
        icon: "cpu",
        items: [
          { name: "AMD Ryzen 5 5600X", sku: "CPU-AMD-5600X", price: 15000, socket: "AM4", type: "cpu" },
          { name: "Intel Core i5-12400F", sku: "CPU-INTEL-12400F", price: 14500, socket: "LGA1700", type: "cpu" },
        ]
      },
      {
        catName: "Motherboard",
        catSlug: "motherboard",
        icon: "motherboard",
        items: [
          { name: "MSI B550M PRO-VDH WIFI", sku: "MB-MSI-B550M", price: 12000, socket: "AM4", type: "motherboard" },
          { name: "Gigabyte B660M DS3H", sku: "MB-GIGA-B660M", price: 13500, socket: "LGA1700", type: "motherboard" },
        ]
      },
      {
        catName: "Desktop RAM",
        catSlug: "desktop-ram",
        icon: "ram",
        items: [
          { name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz", sku: "RAM-COR-16GB-3200", price: 5000, type: "ram" },
          { name: "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz", sku: "RAM-GSK-32GB-6000", price: 15000, type: "ram" },
        ]
      },
      {
        catName: "Graphics Card",
        catSlug: "graphics-card",
        icon: "gpu",
        items: [
          { name: "NVIDIA GeForce RTX 3060", sku: "GPU-NV-3060", price: 35000, type: "gpu" },
          { name: "AMD Radeon RX 6600 XT", sku: "GPU-AMD-6600XT", price: 33000, type: "gpu" },
        ]
      },
      {
        catName: "Storage",
        catSlug: "storage",
        icon: "hard-drive",
        items: [
          { name: "Samsung 970 EVO Plus 1TB NVMe M.2", sku: "SSD-SAM-970-1TB", price: 8000, type: "storage" },
          { name: "WD Blue SN570 500GB NVMe M.2", sku: "SSD-WD-SN570-500", price: 4500, type: "storage" },
        ]
      },
      {
        catName: "Power Supply",
        catSlug: "power-supply",
        icon: "power",
        items: [
          { name: "Corsair CV650 650 Watt 80 Plus Bronze", sku: "PSU-COR-CV650", price: 5500, type: "psu" },
          { name: "Thermaltake Toughpower GF1 750W 80+ Gold", sku: "PSU-TT-GF1-750", price: 9500, type: "psu" },
        ]
      },
      {
        catName: "Casing",
        catSlug: "casing",
        icon: "box",
        items: [
          { name: "NZXT H510 Compact ATX Mid-Tower", sku: "CASE-NZXT-H510", price: 7500, type: "casing" },
          { name: "Corsair 4000D Airflow Tempered Glass", sku: "CASE-COR-4000D", price: 8500, type: "casing" },
        ]
      }
    ];

    for (const data of componentData) {
      // Find or create category
      let cat = await db.select().from(categories).where(eq(categories.slug, data.catSlug));
      let catId: number;
      if (cat.length === 0) {
        const [result] = await db.insert(categories).values({
          name: data.catName,
          slug: data.catSlug,
          icon: data.icon,
          isActive: true
        });
        catId = Number(result.insertId);
      } else {
        catId = cat[0].id;
      }

      // Add products
      for (const item of data.items) {
        const existingProduct = await db.select().from(products).where(eq(products.sku, item.sku));
        if (existingProduct.length === 0) {
          const [productResult] = await db.insert(products).values({
            sku: item.sku,
            name: item.name,
            slug: item.sku.toLowerCase(),
            categoryId: catId,
            regularPrice: item.price.toString(),
            stockQuantity: 10,
            status: "published",
            stockStatus: "in_stock"
          });
          const productId = Number(productResult.insertId);

          // Add specs
          if (item.socket) {
            await db.insert(productSpecifications).values({
              productId,
              specKey: "socket",
              specValue: item.socket,
            });
          }
          await db.insert(productSpecifications).values({
            productId,
            specKey: "type",
            specValue: item.type,
          });

          console.log(`Inserted ${item.name}`);
        } else {
          console.log(`${item.name} already exists`);
        }
      }
    }

    console.log("Seeding completed.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
