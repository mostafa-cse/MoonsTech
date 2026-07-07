import { z } from "zod";
import { createRouter, deliveryQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { deliveryAssignments, orders } from "@db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const deliveryRouter = createRouter({
  // Get delivery man dashboard stats
  dashboard: deliveryQuery.query(async ({ ctx }) => {
    const db = getDb();
    const deliveryManId = ctx.user.id;

    const assigned = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliveryAssignments)
      .where(and(eq(deliveryAssignments.deliveryManId, deliveryManId), eq(deliveryAssignments.status, "assigned")));

    const inProgress = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliveryAssignments)
      .where(and(
        eq(deliveryAssignments.deliveryManId, deliveryManId),
        inArray(deliveryAssignments.status, ['accepted', 'picked_up', 'in_transit'])
      ));

    const completed = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliveryAssignments)
      .where(and(eq(deliveryAssignments.deliveryManId, deliveryManId), eq(deliveryAssignments.status, "delivered")));

    return {
      assigned: assigned[0]?.count || 0,
      inProgress: inProgress[0]?.count || 0,
      completed: completed[0]?.count || 0,
    };
  }),

  // Get assigned orders
  assignedOrders: deliveryQuery.query(async ({ ctx }) => {
    const db = getDb();
    const deliveryManId = ctx.user.id;

    const assignments = await db
      .select()
      .from(deliveryAssignments)
      .where(eq(deliveryAssignments.deliveryManId, deliveryManId))
      .orderBy(desc(deliveryAssignments.assignedAt));

    const orderIds = assignments.map(a => a.orderId);
    const ordersData = orderIds.length > 0
      ? await db.select().from(orders).where(inArray(orders.id, orderIds))
      : [];

    return assignments.map(a => ({
      ...a,
      order: ordersData.find(o => o.id === a.orderId),
    }));
  }),

  // Accept delivery
  accept: deliveryQuery
    .input(z.object({ assignmentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [assignment] = await db
        .select()
        .from(deliveryAssignments)
        .where(and(
          eq(deliveryAssignments.id, input.assignmentId),
          eq(deliveryAssignments.deliveryManId, ctx.user.id)
        ));

      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });

      await db.update(deliveryAssignments)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(deliveryAssignments.id, input.assignmentId));

      await db.update(orders)
        .set({ status: "in_transit" })
        .where(eq(orders.id, assignment.orderId));

      return { success: true };
    }),

  // Confirm pickup
  pickup: deliveryQuery
    .input(z.object({ assignmentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db.update(deliveryAssignments)
        .set({ status: "picked_up", pickedUpAt: new Date() })
        .where(and(
          eq(deliveryAssignments.id, input.assignmentId),
          eq(deliveryAssignments.deliveryManId, ctx.user.id)
        ));

      return { success: true };
    }),

  // Complete delivery with OTP
  complete: deliveryQuery
    .input(z.object({
      assignmentId: z.number(),
      otp: z.string(),
      deliveryPhoto: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [assignment] = await db
        .select()
        .from(deliveryAssignments)
        .where(and(
          eq(deliveryAssignments.id, input.assignmentId),
          eq(deliveryAssignments.deliveryManId, ctx.user.id)
        ));

      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });

      if (assignment.otp && assignment.otp !== input.otp) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid OTP" });
      }

      await db.update(deliveryAssignments)
        .set({
          status: "delivered",
          deliveredAt: new Date(),
          deliveryPhoto: input.deliveryPhoto || null,
          deliveryNotes: input.notes || null,
        })
        .where(eq(deliveryAssignments.id, input.assignmentId));

      await db.update(orders)
        .set({ status: "delivered", deliveredAt: new Date() })
        .where(eq(orders.id, assignment.orderId));

      return { success: true };
    }),

  // Get earnings
  earnings: deliveryQuery.query(async ({ ctx }) => {
    const db = getDb();
    const deliveryManId = ctx.user.id;

    const completed = await db
      .select()
      .from(deliveryAssignments)
      .where(and(
        eq(deliveryAssignments.deliveryManId, deliveryManId),
        eq(deliveryAssignments.status, "delivered")
      ))
      .orderBy(desc(deliveryAssignments.deliveredAt));

    const totalEarnings = completed.reduce((sum, c) => sum + Number(c.commission || 0), 0);
    const totalCOD = completed.reduce((sum, c) => sum + Number(c.cashCollected || 0), 0);

    return {
      totalDeliveries: completed.length,
      totalEarnings,
      totalCOD,
      history: completed,
    };
  }),
});
