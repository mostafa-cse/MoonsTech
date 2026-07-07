import { z } from "zod";
import { createRouter, publicQuery, buyerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, pcBuilds, pcBuildComponents, productImages, productSpecifications, categories } from "@db/schema";
import { eq, and, inArray, like, desc } from "drizzle-orm";

const COMPONENT_TYPES = [
  "cpu", "cpu_cooler", "motherboard", "ram", "gpu",
  "storage", "psu", "casing", "monitor", "keyboard", "mouse", "case_fan"
] as const;

export const pcBuilderRouter = createRouter({
  // Get products for a specific component type
  getComponents: publicQuery
    .input(z.object({
      type: z.enum(COMPONENT_TYPES),
      categoryId: z.number().optional(),
      selectedComponentIds: z.array(z.number()).optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();

      // Map component type to category slug patterns
      const typeToSlugs: Record<string, string[]> = {
        cpu: ['processor', 'cpu', 'processors'],
        cpu_cooler: ['cpu-cooler', 'cooler', 'cooling'],
        motherboard: ['motherboard', 'motherboards'],
        ram: ['ram', 'memory', 'desktop-ram'],
        gpu: ['graphics-card', 'gpu', 'graphics-cards'],
        storage: ['storage', 'ssd', 'hdd', 'hard-drive', 'solid-state-drive'],
        psu: ['power-supply', 'psu', 'power-supplies'],
        casing: ['casing', 'case', 'pc-case', 'cabinet'],
        monitor: ['monitor', 'monitors', 'display'],
        keyboard: ['keyboard', 'keyboards'],
        mouse: ['mouse', 'mice', 'gaming-mouse'],
        case_fan: ['case-fan', 'fan', 'fans', 'rgb-fan'],
      };

      const slugPatterns = typeToSlugs[input.type] || [input.type];

      // Find matching category IDs
      const matchingCats = await db
        .select({ id: categories.id })
        .from(categories)
        .where(inArray(categories.slug, slugPatterns));

      // Also search by category name containing the type keyword
      const nameCats = await db
        .select({ id: categories.id })
        .from(categories)
        .where(like(categories.slug, `%${input.type.replace('_', '-')}%`));

      const allCatIds = [...new Set([...matchingCats.map(c => c.id), ...nameCats.map(c => c.id)])];

      // Base query conditions
      const conditions = [
        eq(products.status, "published"),
        eq(products.stockStatus, "in_stock"),
      ];

      // Filter by category if we found matching categories
      if (allCatIds.length > 0) {
        conditions.push(inArray(products.categoryId, allCatIds));
      } else {
        // Fallback: search by product name containing the type keyword
        const typeKeyword = input.type.replace('_', ' ');
        conditions.push(like(products.name, `%${typeKeyword}%`));
      }

      // Retrieve specs for already selected components to determine constraints
      let requiredSocket = null;
      if (input.selectedComponentIds && input.selectedComponentIds.length > 0) {
        const specs = await db
          .select({
            productId: productSpecifications.productId,
            specKey: productSpecifications.specKey,
            specValue: productSpecifications.specValue,
          })
          .from(productSpecifications)
          .where(and(
            inArray(productSpecifications.productId, input.selectedComponentIds),
            eq(productSpecifications.specKey, "socket")
          ));

        if (specs.length > 0) {
          requiredSocket = specs[0].specValue;
        }
      }

      // If we are looking for a CPU or Motherboard and a socket constraint exists
      if ((input.type === "cpu" || input.type === "motherboard") && requiredSocket) {
        const compatibleProductIds = await db
          .select({ productId: productSpecifications.productId })
          .from(productSpecifications)
          .where(and(
            eq(productSpecifications.specKey, "socket"),
            eq(productSpecifications.specValue, requiredSocket)
          ));
        
        if (compatibleProductIds.length > 0) {
          const idList = compatibleProductIds.map(p => p.productId);
          conditions.push(inArray(products.id, idList));
        } else {
          return [];
        }
      }

      const items = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          regularPrice: products.regularPrice,
          salePrice: products.salePrice,
          stockStatus: products.stockStatus,
          avgRating: products.avgRating,
        })
        .from(products)
        .where(and(...conditions))
        .limit(100);

      const productIds = items.map(i => i.id);
      const images = productIds.length > 0
        ? await db
            .select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
            .from(productImages)
            .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
        : [];
      const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

      return items.map(item => ({
        ...item,
        image: imageMap.get(item.id) || null,
        unitPrice: item.salePrice || item.regularPrice,
      }));
    }),

  // Save a PC build
  saveBuild: buyerQuery
    .input(z.object({
      name: z.string().default("My PC Build"),
      components: z.array(z.object({
        type: z.enum(COMPONENT_TYPES),
        productId: z.number(),
        quantity: z.number().default(1),
      })),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Calculate total price and wattage
      let totalPrice = 0;
      const componentIds = input.components.map(c => c.productId);
      const productData = await db
        .select({ id: products.id, salePrice: products.salePrice, regularPrice: products.regularPrice })
        .from(products)
        .where(inArray(products.id, componentIds));

      const priceMap = new Map(productData.map(p => [p.id, Number(p.salePrice || p.regularPrice)]));

      for (const comp of input.components) {
        const price = priceMap.get(comp.productId) || 0;
        totalPrice += price * comp.quantity;
      }

      // Create build
      const buildResult = await db.insert(pcBuilds).values({
        userId,
        name: input.name,
        totalPrice: totalPrice.toFixed(2),
        isPublic: input.isPublic,
      });

      const buildId = Number(buildResult[0].insertId);

      // Add components
      for (const comp of input.components) {
        await db.insert(pcBuildComponents).values({
          buildId,
          componentType: comp.type,
          productId: comp.productId,
          quantity: comp.quantity,
        });
      }

      return { success: true, buildId };
    }),

  // Get user's saved builds
  myBuilds: buyerQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const builds = await db
      .select()
      .from(pcBuilds)
      .where(eq(pcBuilds.userId, userId))
      .orderBy(desc(pcBuilds.createdAt));

    return builds;
  }),

  // Get build details
  getBuild: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const [build] = await db.select().from(pcBuilds).where(eq(pcBuilds.id, input.id));
      if (!build) return null;

      const components = await db
        .select({
          id: pcBuildComponents.id,
          componentType: pcBuildComponents.componentType,
          quantity: pcBuildComponents.quantity,
          productId: products.id,
          productName: products.name,
          productSlug: products.slug,
          regularPrice: products.regularPrice,
          salePrice: products.salePrice,
        })
        .from(pcBuildComponents)
        .innerJoin(products, eq(pcBuildComponents.productId, products.id))
        .where(eq(pcBuildComponents.buildId, input.id));

      return { ...build, components };
    }),
});
