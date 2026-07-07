import { z } from "zod";
import { createRouter, publicQuery, buyerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, products } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const reviewRouter = createRouter({
  // Get product reviews
  byProduct: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.isApproved, true)))
        .orderBy(desc(reviews.createdAt));
    }),

  // Create review
  create: buyerQuery
    .input(z.object({
      productId: z.number(),
      orderId: z.number().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().optional(),
      comment: z.string().min(1),
      images: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check if already reviewed
      const [existing] = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.userId, userId)));

      if (existing) {
        await db.update(reviews).set({
          rating: input.rating,
          title: input.title || null,
          comment: input.comment,
          images: input.images || null,
        }).where(eq(reviews.id, existing.id));
      } else {
        await db.insert(reviews).values({
          productId: input.productId,
          userId,
          orderId: input.orderId || null,
          rating: input.rating,
          title: input.title || null,
          comment: input.comment,
          images: input.images || null,
          isVerifiedPurchase: !!input.orderId,
        });
      }

      // Update product rating
      const allReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.isApproved, true)));

      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db.update(products).set({
        avgRating: avgRating.toFixed(1),
        reviewCount: allReviews.length,
      }).where(eq(products.id, input.productId));

      return { success: true };
    }),
});
