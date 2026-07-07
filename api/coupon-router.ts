import { z } from "zod";
import { createRouter, publicQuery, buyerQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { coupons, couponUsages } from "@db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const couponRouter = createRouter({
  // Validate a coupon code
  validate: publicQuery
    .input(z.object({
      code: z.string(),
      orderAmount: z.number().optional(),
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();

      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, input.code.toUpperCase()), eq(coupons.isActive, true)));

      if (!coupon) return { valid: false, message: "Invalid coupon code" };

      // Check dates
      const now = new Date();
      if (new Date(coupon.startDate) > now) return { valid: false, message: "Coupon not yet active" };
      if (new Date(coupon.endDate) < now) return { valid: false, message: "Coupon has expired" };

      // Check usage limit
      if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit reached" };
      }

      // Check minimum order
      if (input.orderAmount && Number(coupon.minimumOrderAmount) > input.orderAmount) {
        return { valid: false, message: `Minimum order amount is ৳${coupon.minimumOrderAmount}` };
      }

      return {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maximumDiscount: coupon.maximumDiscount,
          minimumOrderAmount: coupon.minimumOrderAmount,
        },
      };
    }),

  // Apply coupon to order (with tracking)
  applyCoupon: buyerQuery
    .input(z.object({
      code: z.string(),
      orderAmount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, input.code.toUpperCase()), eq(coupons.isActive, true)));

      if (!coupon) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid coupon code" });

      const now = new Date();
      if (new Date(coupon.startDate) > now) throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon not yet active" });
      if (new Date(coupon.endDate) < now) throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon has expired" });

      if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon usage limit reached" });
      }

      if (Number(coupon.minimumOrderAmount) > input.orderAmount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Minimum order ৳${coupon.minimumOrderAmount}` });
      }

      // Check per-user limit
      if (coupon.perUserLimit) {
        const userUsageCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(couponUsages)
          .where(and(eq(couponUsages.couponId, coupon.id), eq(couponUsages.userId, userId)));

        if (userUsageCount[0]?.count >= coupon.perUserLimit) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have already used this coupon" });
        }
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === "percentage") {
        discount = (input.orderAmount * Number(coupon.discountValue)) / 100;
        if (coupon.maximumDiscount && discount > Number(coupon.maximumDiscount)) {
          discount = Number(coupon.maximumDiscount);
        }
      } else if (coupon.discountType === "fixed_amount") {
        discount = Number(coupon.discountValue);
        if (discount > input.orderAmount) discount = input.orderAmount;
      } else if (coupon.discountType === "free_shipping") {
        discount = Number(coupon.discountValue);
      }

      return {
        success: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discount: Math.round(discount * 100) / 100,
      };
    }),

  // List active coupons (for users)
  listActive: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();

    return db
      .select({
        id: coupons.id,
        code: coupons.code,
        description: coupons.description,
        discountType: coupons.discountType,
        discountValue: coupons.discountValue,
        minimumOrderAmount: coupons.minimumOrderAmount,
        maximumDiscount: coupons.maximumDiscount,
        endDate: coupons.endDate,
      })
      .from(coupons)
      .where(and(
        eq(coupons.isActive, true),
        lte(coupons.startDate, now),
        gte(coupons.endDate, now)
      ));
  }),
  // ===== ADMIN ENDPOINTS =====
  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }),

  create: adminQuery
    .input(z.object({
      code: z.string(),
      description: z.string().optional(),
      discountType: z.enum(["percentage", "fixed_amount", "free_shipping"]),
      discountValue: z.string(),
      minimumOrderAmount: z.string().optional(),
      maximumDiscount: z.string().optional(),
      startDate: z.date(),
      endDate: z.date(),
      usageLimit: z.number().optional(),
      perUserLimit: z.number().optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(coupons).values(input);
      return { success: true };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      description: z.string().optional(),
      discountType: z.enum(["percentage", "fixed_amount", "free_shipping"]).optional(),
      discountValue: z.string().optional(),
      minimumOrderAmount: z.string().optional(),
      maximumDiscount: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      usageLimit: z.number().optional(),
      perUserLimit: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(coupons).set(data).where(eq(coupons.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(coupons).where(eq(coupons.id, input.id));
      return { success: true };
    }),
});
