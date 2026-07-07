import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, products, orders, banners, siteSettings } from "@db/schema";
import { eq, desc, sql, gte, lte, and } from "drizzle-orm";

export const adminRouter = createRouter({
  // Dashboard analytics
  dashboard: adminQuery.query(async () => {
    const db = getDb();

    // Count totals
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "buyer"));
    const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [totalRevenue] = await db.select({ total: sql<string>`COALESCE(sum(total), 0)` }).from(orders).where(eq(orders.status, "delivered"));

    // Orders by status
    const ordersByStatus = await db
      .select({ status: orders.status, count: sql<number>`count(*)` })
      .from(orders)
      .groupBy(orders.status);

    // Recent orders
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Low stock products
    const lowStock = await db
      .select()
      .from(products)
      .where(sql`${products.stockQuantity} <= ${products.lowStockThreshold}`)
      .orderBy(products.stockQuantity)
      .limit(10);

    // Top selling products
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        totalSales: products.totalSales,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .orderBy(desc(products.totalSales))
      .limit(10);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await db
      .select({
        month: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`,
        revenue: sql<string>`COALESCE(sum(${orders.total}), 0)`,
        orders: sql<number>`count(*)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, sixMonthsAgo))
      .groupBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`);

    return {
      stats: {
        totalUsers: totalUsers?.count || 0,
        totalProducts: totalProducts?.count || 0,
        totalOrders: totalOrders?.count || 0,
        totalRevenue: Number(totalRevenue?.total || 0),
      },
      ordersByStatus,
      recentOrders,
      lowStock,
      topProducts,
      monthlyRevenue,
    };
  }),

  // Sales Report
  salesReport: adminQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      let conditions: any[] = [];
      
      if (input?.startDate) {
        conditions.push(gte(orders.createdAt, new Date(input.startDate)));
      }
      if (input?.endDate) {
        // Add 1 day to include the end date fully
        const end = new Date(input.endDate);
        end.setDate(end.getDate() + 1);
        conditions.push(lte(orders.createdAt, end));
      }

      // Fetch daily aggregated revenue for charts
      let chartQuery = db
        .select({
          date: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`,
          revenue: sql<string>`COALESCE(sum(${orders.total}), 0)`,
          ordersCount: sql<number>`count(*)`,
        })
        .from(orders);
        
      if (conditions.length > 0) {
        chartQuery = chartQuery.where(and(...conditions)) as any;
      }
      
      const dailyRevenue = await chartQuery
        .groupBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`)
        .orderBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`);

      // Fetch all relevant orders for data table & CSV
      let ordersQuery = db.select().from(orders);
      if (conditions.length > 0) {
        ordersQuery = ordersQuery.where(and(...conditions)) as any;
      }
      
      const ordersData = await ordersQuery.orderBy(desc(orders.createdAt));

      return {
        dailyRevenue,
        orders: ordersData,
      };
    }),

  // User management
  users: adminQuery
    .input(z.object({
      role: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      let query = db.select().from(users);
      if (input?.role) {
        query = query.where(eq(users.role, input.role as any)) as any;
      }

      const items = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
      return items;
    }),

  updateUserStatus: adminQuery
    .input(z.object({ userId: z.number(), status: z.enum(["active", "blocked", "inactive"]) }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own status" });
      }
      const db = getDb();
      await db.update(users).set({ status: input.status }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  updateUserRole: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["buyer", "delivery_man", "admin", "super_admin"]) }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own role" });
      }
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  // Banners management
  banners: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(banners).orderBy(desc(banners.sortOrder));
  }),

  createBanner: adminQuery
    .input(z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      image: z.string(),
      link: z.string().optional(),
      position: z.enum(["home_hero", "home_promo", "category", "promotional"]).optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(banners).values(input);
      return { success: true };
    }),

  updateBanner: adminQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      image: z.string().optional(),
      link: z.string().optional(),
      position: z.enum(["home_hero", "home_promo", "category", "promotional"]).optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(banners).set(data).where(eq(banners.id, id));
      return { success: true };
    }),

  deleteBanner: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(banners).where(eq(banners.id, input.id));
      return { success: true };
    }),




  // Product management
  updateProductStatus: adminQuery
    .input(z.object({
      productId: z.number(),
      status: z.enum(["published", "draft", "archived"]).optional(),
      isFeatured: z.boolean().optional(),
      isBestSeller: z.boolean().optional(),
      stockQuantity: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { productId, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, productId));
      return { success: true };
    }),



  // Site settings
  settings: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(siteSettings);
  }),

  updateSetting: adminQuery
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(siteSettings).set({ value: input.value }).where(eq(siteSettings.key, input.key));
      return { success: true };
    }),
});
