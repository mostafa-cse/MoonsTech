import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { brands, products } from "@db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export const brandRouter = createRouter({
  list: publicQuery
    .input(z.object({ featured: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(brands.isActive, true)];
      if (input?.featured) conditions.push(eq(brands.isFeatured, true));

      return db
        .select()
        .from(brands)
        .where(and(...conditions))
        .orderBy(asc(brands.name));
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [brand] = await db.select().from(brands).where(eq(brands.slug, input.slug));
      if (!brand) return null;

      const productCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(eq(products.brandId, brand.id), eq(products.status, "published")));

      return { ...brand, productCount: productCount[0]?.count || 0 };
    }),
});
