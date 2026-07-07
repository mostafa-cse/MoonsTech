import { getDb } from "../api/queries/connection";
import { categories, brands, products, productSpecifications } from "./schema";

const db = getDb();

async function seedMoreProducts() {
  console.log("Seeding more products...");

  const allCategories = await db.select().from(categories);
  const allBrands = await db.select().from(brands);

  if (allBrands.length === 0 || allCategories.length === 0) {
    console.error("Please run the main seed script first.");
    process.exit(1);
  }

  const brandId = allBrands[0].id;

  for (const cat of allCategories) {
    if (cat.parentId === null) continue; // Skip main categories for products

    const productName = `Generic ${cat.name} Product`;
    const sku = `GEN-${cat.id}-${Date.now()}`;
    const slug = `generic-${cat.slug}-${Date.now()}`;

    console.log(`Adding product to category: ${cat.name}`);

    // Insert Product
    const [result] = await db.insert(products).values({
      sku,
      name: productName,
      slug,
      categoryId: cat.id,
      brandId: brandId,
      modelNumber: "GEN-12345",
      shortDescription: `A high quality ${cat.name}`,
      fullDescription: `This is a high quality ${cat.name} with excellent features and durability.`,
      regularPrice: "5000.00",
      salePrice: "4500.00",
      stockQuantity: 100,
      stockStatus: "in_stock",
      weight: "1.0",
      warrantyDuration: 12,
      warrantyType: "official",
      returnPolicyDays: 7,
      status: "published",
    });

    const productId = result.insertId;

    // Add generic specifications
    await db.insert(productSpecifications).values([
      { productId, specKey: "Color", specValue: "Black", specGroup: "General" },
      { productId, specKey: "Material", specValue: "Premium Plastic/Metal", specGroup: "General" },
      { productId, specKey: "Warranty", specValue: "1 Year Official", specGroup: "Support" },
    ]);
    
    // Add socket for Motherboard/CPU specifically
    if (cat.slug.includes("motherboard") || cat.slug.includes("cpu")) {
      await db.insert(productSpecifications).values([
        { productId, specKey: "socket", specValue: "AM5", specGroup: "Technical" }
      ]);
    }
  }

  console.log("Successfully seeded extra products!");
  process.exit(0);
}

seedMoreProducts().catch((err) => {
  console.error("Error seeding extra products:", err);
  process.exit(1);
});
