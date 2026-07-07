import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, productImages, productSpecifications, categories, brands, reviews, users } from "@db/schema";
import { eq, desc, asc, like, and, or, sql, gte, lte, inArray } from "drizzle-orm";

export const productRouter = createRouter({
  // List products with filters, pagination, sorting
  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        categoryId: z.number().optional(),
        brandId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["name", "price_asc", "price_desc", "newest", "popular", "discount"]).default("newest"),
        featured: z.boolean().optional(),
        bestSeller: z.boolean().optional(),
        newArrival: z.boolean().optional(),
        inStock: z.boolean().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const opts = (input || {}) as Record<string, any>;
      const page = opts.page || 1;
      const limit = opts.limit || 20;
      const offset = (page - 1) * limit;

      const conditions: any[] = [];
      const isAdmin = ctx.user?.role === "admin" || ctx.user?.role === "super_admin";

      if (isAdmin && opts.status) {
        conditions.push(eq(products.status, opts.status as any));
      } else if (!isAdmin) {
        conditions.push(eq(products.status, "published"));
      }
      if (opts.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
      if (opts.brandId) conditions.push(eq(products.brandId, opts.brandId));
      if (opts.search) {
        conditions.push(
          or(
            like(products.name, `%${opts.search}%`),
            like(products.sku, `%${opts.search}%`),
            like(products.tags, `%${opts.search}%`)
          )!
        );
      }
      if (opts.minPrice) conditions.push(gte(sql`COALESCE(${products.salePrice}, ${products.regularPrice})`, opts.minPrice.toString()));
      if (opts.maxPrice) conditions.push(lte(sql`COALESCE(${products.salePrice}, ${products.regularPrice})`, opts.maxPrice.toString()));
      if (opts.featured) conditions.push(eq(products.isFeatured, true));
      if (opts.bestSeller) conditions.push(eq(products.isBestSeller, true));
      if (opts.newArrival) conditions.push(eq(products.isNewArrival, true));
      if (opts.inStock) conditions.push(eq(products.stockStatus, "in_stock"));

      const whereClause = and(...conditions);

      // Get total count
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause);
      const total = countResult[0]?.count || 0;

      // Build order by
      let orderBy;
      switch (opts.sortBy) {
        case "price_asc": orderBy = asc(sql`COALESCE(${products.salePrice}, ${products.regularPrice})`); break;
        case "price_desc": orderBy = desc(sql`COALESCE(${products.salePrice}, ${products.regularPrice})`); break;
        case "popular": orderBy = desc(products.totalSales); break;
        case "discount": orderBy = desc(sql`(regularPrice - salePrice) / regularPrice`); break;
        case "name": orderBy = asc(products.name); break;
        default: orderBy = desc(products.createdAt);
      }

      const items = await db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          slug: products.slug,
          regularPrice: products.regularPrice,
          salePrice: products.salePrice,
          stockStatus: products.stockStatus,
          avgRating: products.avgRating,
          reviewCount: products.reviewCount,
          isFeatured: products.isFeatured,
          isBestSeller: products.isBestSeller,
          isNewArrival: products.isNewArrival,
          megaCoinReward: products.megaCoinReward,
          warrantyDuration: products.warrantyDuration,
          warrantyType: products.warrantyType,
          createdAt: products.createdAt,
          categoryName: categories.name,
          brandName: brands.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      // Get primary images for products
      const productIds = items.map(i => i.id);
      let images: any[] = [];
      if (productIds.length > 0) {
        images = await db
          .select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));
      }

      const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

      return {
        items: items.map(item => ({
          ...item,
          image: imageMap.get(item.id) || null,
          discount: item.salePrice
            ? Math.round(((Number(item.regularPrice) - Number(item.salePrice)) / Number(item.regularPrice)) * 100)
            : 0,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }),

  // Get single product by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [product] = await db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          slug: products.slug,
          shortDescription: products.shortDescription,
          fullDescription: products.fullDescription,
          videoUrl: products.videoUrl,
          regularPrice: products.regularPrice,
          salePrice: products.salePrice,
          stockQuantity: products.stockQuantity,
          stockStatus: products.stockStatus,
          weight: products.weight,
          dimensions: products.dimensions,
          warrantyDuration: products.warrantyDuration,
          warrantyType: products.warrantyType,
          returnPolicyDays: products.returnPolicyDays,
          tags: products.tags,
          megaCoinReward: products.megaCoinReward,
          avgRating: products.avgRating,
          reviewCount: products.reviewCount,
          totalSales: products.totalSales,
          categoryId: products.categoryId,
          brandId: products.brandId,
          createdAt: products.createdAt,
          categoryName: categories.name,
          brandName: brands.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(and(eq(products.slug, input.slug), eq(products.status, "published")));

      if (!product) return null;

      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.sortOrder);

      const specifications = await db
        .select()
        .from(productSpecifications)
        .where(eq(productSpecifications.productId, product.id))
        .orderBy(productSpecifications.specGroup);

      const productReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          title: reviews.title,
          comment: reviews.comment,
          images: reviews.images,
          isVerifiedPurchase: reviews.isVerifiedPurchase,
          helpfulCount: reviews.helpfulCount,
          createdAt: reviews.createdAt,
          userName: users.name,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Get related products (same category)
      const related = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          regularPrice: products.regularPrice,
          salePrice: products.salePrice,
          avgRating: products.avgRating,
        })
        .from(products)
        .where(and(eq(products.categoryId, product.categoryId), eq(products.status, "published")))
        .orderBy(desc(products.totalSales))
        .limit(8);

      return {
        ...product,
        discount: product.salePrice
          ? Math.round(((Number(product.regularPrice) - Number(product.salePrice)) / Number(product.regularPrice)) * 100)
          : 0,
        images,
        specifications,
        reviews: productReviews,
        related: related.filter(r => r.id !== product.id).slice(0, 6),
      };
    }),

  // Get featured products
  featured: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        avgRating: products.avgRating,
        reviewCount: products.reviewCount,
        isNewArrival: products.isNewArrival,
        megaCoinReward: products.megaCoinReward,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(eq(products.isFeatured, true), eq(products.status, "published")))
      .orderBy(desc(products.createdAt))
      .limit(12);

    const productIds = items.map(i => i.id);
    const images = productIds.length > 0
      ? await db.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
      : [];
    const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

    return items.map(item => ({
      ...item,
      image: imageMap.get(item.id) || null,
      discount: item.salePrice
        ? Math.round(((Number(item.regularPrice) - Number(item.salePrice)) / Number(item.regularPrice)) * 100)
        : 0,
    }));
  }),

  // Get best sellers
  bestSellers: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        avgRating: products.avgRating,
        totalSales: products.totalSales,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(eq(products.isBestSeller, true), eq(products.status, "published")))
      .orderBy(desc(products.totalSales))
      .limit(10);

    const productIds = items.map(i => i.id);
    const images = productIds.length > 0
      ? await db.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
      : [];
    const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

    return items.map(item => ({
      ...item,
      image: imageMap.get(item.id) || null,
      discount: item.salePrice
        ? Math.round(((Number(item.regularPrice) - Number(item.salePrice)) / Number(item.regularPrice)) * 100)
        : 0,
    }));
  }),

  // Get new arrivals
  newArrivals: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        avgRating: products.avgRating,
        createdAt: products.createdAt,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(eq(products.isNewArrival, true), eq(products.status, "published")))
      .orderBy(desc(products.createdAt))
      .limit(10);

    const productIds = items.map(i => i.id);
    const images = productIds.length > 0
      ? await db.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
      : [];
    const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

    return items.map(item => ({
      ...item,
      image: imageMap.get(item.id) || null,
      discount: item.salePrice
        ? Math.round(((Number(item.regularPrice) - Number(item.salePrice)) / Number(item.regularPrice)) * 100)
        : 0,
    }));
  }),

  // Quick search
  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          regularPrice: products.regularPrice,
          salePrice: products.salePrice,
        })
        .from(products)
        .where(
          and(
            eq(products.status, "published"),
            or(
              like(products.name, `%${input.query}%`),
              like(products.sku, `%${input.query}%`),
              like(products.tags, `%${input.query}%`)
            )!
          )
        )
        .limit(8);
      return items;
    }),
  // Admin: Create product
  create: adminQuery
    .input(z.object({
      name: z.string(),
      sku: z.string(),
      slug: z.string(),
      regularPrice: z.string(),
      salePrice: z.string().optional(),
      stockQuantity: z.number().default(0),
      categoryId: z.number(),
      brandId: z.number().optional(),
      status: z.enum(["published", "draft", "archived"]).default("draft"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [insertResult] = await db.insert(products).values(input);
      return { success: true, id: insertResult.insertId };
    }),

  // Admin: Update product
  update: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      sku: z.string().optional(),
      slug: z.string().optional(),
      regularPrice: z.string().optional(),
      salePrice: z.string().optional(),
      stockQuantity: z.number().optional(),
      categoryId: z.number().optional(),
      brandId: z.number().optional(),
      status: z.enum(["published", "draft", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  // Admin: Delete product (soft-delete)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(products).set({ status: "archived" as any }).where(eq(products.id, input.id));
      return { success: true };
    }),
});
