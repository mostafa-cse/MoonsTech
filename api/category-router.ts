import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, products } from "@db/schema";
import { eq, and, asc, sql, inArray } from "drizzle-orm";

export const categoryRouter = createRouter({
  // Get full category tree
  tree: publicQuery.query(async () => {
    const db = getDb();
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    const categoryMap = new Map();
    const roots: any[] = [];

    for (const cat of allCategories) {
      const node = { ...cat, children: [] };
      categoryMap.set(cat.id, node);
      if (!cat.parentId) {
        roots.push(node);
      } else {
        const parent = categoryMap.get(Number(cat.parentId));
        if (parent) parent.children.push(node);
      }
    }

    return roots;
  }),

  // Get all active categories as flat list
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));
  }),

  // Get main categories only
  main: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.level, 1), eq(categories.isActive, true)))
      .orderBy(asc(categories.sortOrder));
  }),

  // Get subcategories of a parent
  subcategories: publicQuery
    .input(z.object({ parentId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(categories)
        .where(and(eq(categories.parentId, input.parentId), eq(categories.isActive, true)))
        .orderBy(asc(categories.sortOrder));
    }),

  // Get category by slug with product count
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [category] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.slug, input.slug), eq(categories.isActive, true)));

      if (!category) return null;

      // Get all descendant category IDs
      const allCats = await db.select().from(categories);
      const descendantIds = [category.id];
      const queue = [category.id];
      while (queue.length > 0) {
        const current = queue.shift()!;
        const children = allCats.filter(c => Number(c.parentId) === current);
        for (const child of children) {
          descendantIds.push(child.id);
          queue.push(child.id);
        }
      }

      const productCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(
          inArray(products.categoryId, descendantIds),
          eq(products.status, "published")
        ));
      const productCount = productCountResult[0]?.count || 0;

      return { ...category, productCount };
    }),

  // Get category breadcrumb
  breadcrumb: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [cat] = await db.select().from(categories).where(eq(categories.slug, input.slug));
      if (!cat) return [];

      const allCats = await db.select().from(categories);
      const breadcrumb = [cat];
      let current = cat;

      while (current.parentId) {
        const parent = allCats.find(c => c.id === Number(current.parentId));
        if (parent) {
          breadcrumb.unshift(parent);
          current = parent;
        } else break;
      }

      return breadcrumb;
    }),
});
