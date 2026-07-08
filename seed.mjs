import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
}

console.log("Loading database...");
const db = new Database(path.join(process.cwd(), 'backend', 'AestheticTechStore.Api', 'app.db'));

console.log("Loading JSON data...");
const rawData = fs.readFileSync(path.join(process.cwd(), 'Product Data', 'products', 'unique_products.json'), 'utf-8');
const productsData = JSON.parse(rawData);

console.log(`Found ${productsData.length} products. Clearing existing data...`);

// We'll clear the tables first to ensure a clean slate
db.exec("DELETE FROM Products;");
db.exec("DELETE FROM Categories;");
db.exec("DELETE FROM Brands;");

const insertCategory = db.prepare('INSERT INTO Categories (Id, Name, Description, ImageUrl, ParentCategoryId) VALUES (?, ?, ?, ?, ?)');
const insertBrand = db.prepare('INSERT INTO Brands (Id, Name, LogoUrl, Description) VALUES (?, ?, ?, ?)');
const insertProduct = db.prepare(`
  INSERT INTO Products (
    Id, Sku, Name, ImageUrl, ShortDescription, FullDescription, 
    CategoryId, BrandId, RegularPrice, DiscountPrice, 
    StockQuantity, WarrantyMonths, MegaCoinReward, Status, RowVersion, Slug
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Caches for ID lookups
const categoryMap = new Map(); // slug -> id
const brandMap = new Map(); // slug -> id

const seedTransaction = db.transaction(() => {
    let count = 0;
    for (const prod of productsData) {
        // Handle Category
        let catName = prod.category || "Uncategorized";
        catName = catName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const catSlug = slugify(catName);
        let catId = categoryMap.get(catSlug);
        
        if (!catId) {
            catId = uuidv4();
            insertCategory.run(catId, catName, `All products in ${catName}`, '', null);
            categoryMap.set(catSlug, catId);
        }

        // Handle Brand
        let brandName = prod.brand || "Generic";
        const brandSlug = slugify(brandName);
        let brandId = brandMap.get(brandSlug);

        if (!brandId) {
            brandId = uuidv4();
            insertBrand.run(brandId, brandName, '', `Products by ${brandName}`);
            brandMap.set(brandSlug, brandId);
        }

        // Handle Product Details
        const prodId = uuidv4();
        const sku = prod.product_code || `SKU-${crypto.randomBytes(4).toString('hex')}`;
        const name = prod.name || "Unknown Product";
        
        let shortDesc = "";
        let fullDesc = "";
        
        if (prod.specifications) {
            const specList = Object.entries(prod.specifications).slice(0, 4)
                .map(([k, v]) => `<li><b>${k}:</b> ${v}</li>`).join('');
            shortDesc = `<ul>${specList}</ul>`;
            
            const fullSpecList = Object.entries(prod.specifications)
                .map(([k, v]) => `<tr><td style="padding:4px; font-weight:bold; border: 1px solid #ddd;">${k}</td><td style="padding:4px; border: 1px solid #ddd;">${v}</td></tr>`).join('');
            fullDesc = `<h4>Specifications</h4><table style="border-collapse: collapse; width:100%;">${fullSpecList}</table>`;
        } else {
            shortDesc = "No description available.";
            fullDesc = "<p>No detailed description available.</p>";
        }

        const imgUrl = prod.image_url || "";
        const regPrice = prod.regular_price ? prod.regular_price.toString() : prod.price_bdt.toString();
        const discPrice = prod.regular_price ? prod.price_bdt.toString() : null;
        
        const stock = prod.in_stock ? 15 : 0;
        const megaCoins = Math.floor(parseInt(prod.price_bdt) * 0.01) || 0;
        
        const rowVersion = Buffer.alloc(8);
        const prodSlug = prod.slug || slugify(name);

        insertProduct.run(
            prodId, sku, name, imgUrl, shortDesc, fullDesc,
            catId, brandId, regPrice, discPrice,
            stock, 12, megaCoins, "Active", rowVersion, prodSlug
        );
        
        count++;
        if (count % 1000 === 0) console.log(`Inserted ${count} products...`);
    }
    console.log(`Successfully seeded ${count} products, ${categoryMap.size} categories, and ${brandMap.size} brands.`);
});

try {
    seedTransaction();
} catch (e) {
    console.error("Seeding failed: ", e);
}
db.close();
