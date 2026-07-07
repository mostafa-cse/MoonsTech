import { z } from "zod";
import { createRouter, buyerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { addresses } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const addressRouter = createRouter({
  list: buyerQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, ctx.user.id))
      .orderBy(desc(addresses.isDefault));
  }),

  create: buyerQuery
    .input(z.object({
      label: z.string().default("Home"),
      fullName: z.string().min(1),
      phone: z.string().min(1),
      division: z.string().min(1),
      district: z.string().min(1),
      thana: z.string().min(1),
      fullAddress: z.string().min(1),
      landmark: z.string().optional(),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      if (input.isDefault) {
        await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
      }

      const result = await db.insert(addresses).values({ ...input, userId });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: buyerQuery
    .input(z.object({
      id: z.number(),
      label: z.string().optional(),
      fullName: z.string().optional(),
      phone: z.string().optional(),
      division: z.string().optional(),
      district: z.string().optional(),
      thana: z.string().optional(),
      fullAddress: z.string().optional(),
      landmark: z.string().optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      const [existing] = await db
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, ctx.user.id)));

      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Address not found" });

      if (data.isDefault) {
        await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, ctx.user.id));
      }

      await db.update(addresses).set(data).where(eq(addresses.id, id));
      return { success: true };
    }),

  delete: buyerQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .delete(addresses)
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, ctx.user.id)));

      return { success: true };
    }),
});
