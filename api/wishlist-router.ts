import { z } from "zod";
import { createRouter, buyerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { wishlists, products, productImages } from "@db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export const wishlistRouter = createRouter({
  get: buyerQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const items = await db
      .select({
        id: wishlists.id,
        createdAt: wishlists.createdAt,
        productId: products.id,
        name: products.name,
        slug: products.slug,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        stockStatus: products.stockStatus,
        avgRating: products.avgRating,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));

    const productIds = items.map(i => i.productId);
    const images = productIds.length > 0
      ? await db
          .select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
      : [];
    const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

    return items.map(item => ({
      ...item,
      image: imageMap.get(item.productId) || null,
    }));
  }),

  add: buyerQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [existing] = await db
        .select()
        .from(wishlists)
        .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, input.productId)));

      if (existing) return { success: true, message: "Already in wishlist" };

      await db.insert(wishlists).values({ userId, productId: input.productId });
      return { success: true, message: "Added to wishlist" };
    }),

  remove: buyerQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      await db
        .delete(wishlists)
        .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, input.productId)));

      return { success: true };
    }),
});
