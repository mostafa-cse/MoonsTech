import { z } from "zod";
import { createRouter, buyerQuery, adminQuery, deliveryQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, orderStatusHistory, products, addresses, carts, cartItems, users, deliveryAssignments } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendMail, getOrderConfirmationEmailHtml, getOrderStatusEmailHtml } from "./lib/mailer";
import { TRPCError } from "@trpc/server";

function generateOrderNumber() {
  return "ATS" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

export const orderRouter = createRouter({
  // Track order by order number and phone
  track: publicQuery
    .input(z.object({ orderNumber: z.string(), phone: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [order] = await db.select().from(orders).where(eq(orders.orderNumber, input.orderNumber));
      
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }
      
      // Verify phone number matches the delivery address
      const address = typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : order.deliveryAddress;
      if (!address || (address.phone !== input.phone)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Phone number does not match this order" });
      }
      
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
        
      const statusHistory = await db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, order.id))
        .orderBy(desc(orderStatusHistory.createdAt));
        
      return { ...order, items, statusHistory };
    }),

  // Create order from cart
  create: buyerQuery
    .input(
      z.object({
        addressId: z.number().optional(),
        guestAddress: z.object({
          fullName: z.string(),
          phone: z.string(),
          division: z.string(),
          district: z.string(),
          thana: z.string(),
          fullAddress: z.string(),
          landmark: z.string().optional(),
        }).optional(),
        paymentMethod: z.enum(["cod", "bkash", "nagad", "rocket", "card", "online_banking", "megacoin"]),
        deliveryMethod: z.enum(["home_delivery", "express_delivery"]).default("home_delivery"),
        couponCode: z.string().optional(),
        megaCoinsToUse: z.number().default(0),
        notes: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
        })).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Get address
      let deliveryAddressStr = "";
      if (input.addressId) {
        const [address] = await db.select().from(addresses).where(and(eq(addresses.id, input.addressId), eq(addresses.userId, userId)));
        if (!address) throw new TRPCError({ code: "NOT_FOUND", message: "Address not found" });
        deliveryAddressStr = JSON.stringify({
          fullName: address.fullName,
          phone: address.phone,
          division: address.division,
          district: address.district,
          thana: address.thana,
          fullAddress: address.fullAddress,
          landmark: address.landmark,
        });
      } else if (input.guestAddress) {
        deliveryAddressStr = JSON.stringify(input.guestAddress);
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Address is required" });
      }

      // SERVER-SIDE PRICE CALCULATION — never trust client prices
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of input.items) {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: `Product #${item.productId} not found` });
        }

        // Stock validation
        if (product.stockQuantity < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} available.`,
          });
        }

        const unitPrice = Number(product.salePrice || product.regularPrice);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        orderItemsData.push({
          productId: item.productId,
          productName: product.name,
          productImage: null,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          megaCoinReward: product.megaCoinReward ? product.megaCoinReward * item.quantity : 0,
        });
      }

      const shippingCost = subtotal > 5000 ? 0 : (input.deliveryMethod === "express_delivery" ? 120 : 60);
      const total = subtotal + shippingCost;

      const orderNumber = generateOrderNumber();

      // Create order
      const orderResult = await db.insert(orders).values({
        orderNumber,
        userId,
        status: "pending",
        subtotal: subtotal.toFixed(2),
        discountAmount: "0",
        couponCode: input.couponCode || null,
        megaCoinsUsed: input.megaCoinsToUse,
        megaCoinDiscount: "0",
        shippingCost: shippingCost.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        deliveryMethod: input.deliveryMethod,
        deliveryAddress: deliveryAddressStr,
        notes: input.notes || null,
      });

      const orderId = orderResult[0].insertId;

      // Create order items + decrement stock
      for (const itemData of orderItemsData) {
        await db.insert(orderItems).values({
          orderId: Number(orderId),
          ...itemData,
        });

        // Decrement stock
        const [product] = await db.select().from(products).where(eq(products.id, itemData.productId));
        if (product) {
          const newStock = Math.max(0, product.stockQuantity - itemData.quantity);
          await db.update(products).set({
            stockQuantity: newStock,
            stockStatus: newStock === 0 ? "out_of_stock" : "in_stock",
          }).where(eq(products.id, itemData.productId));
        }
      }

      // Add status history
      await db.insert(orderStatusHistory).values({
        orderId: Number(orderId),
        status: "pending",
        notes: "Order placed successfully",
        changedBy: userId,
      });

      // Clear user's cart
      const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
      if (cart) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      }

      const user = ctx.user;
      if (user && user.email) {
        const orderPayload = { orderNumber, total };
        sendMail({
          to: user.email,
          subject: `Order Confirmation - ${orderNumber}`,
          html: getOrderConfirmationEmailHtml(orderPayload, orderItemsData)
        }).catch(err => console.error("Failed to send order email", err));
      }

      return { success: true, orderNumber, orderId: Number(orderId) };
    }),

  // Get user's orders
  myOrders: buyerQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const items = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    return items;
  }),

  // Get order details
  getById: buyerQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const isAdmin = ctx.user.role === "admin" || ctx.user.role === "super_admin";

      let query = db.select().from(orders).where(eq(orders.id, input.id));
      
      const [order] = await query;
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });

      if (!isAdmin && order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      const statusHistory = await db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, order.id))
        .orderBy(desc(orderStatusHistory.createdAt));

      return { ...order, items, statusHistory };
    }),

  // Cancel order
  cancel: buyerQuery
    .input(z.object({ orderId: z.number(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id)));

      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      if (order.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Order cannot be cancelled" });

      await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, input.orderId));

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        status: "cancelled",
        notes: `Cancelled by customer: ${input.reason}`,
        changedBy: ctx.user.id,
      });

      return { success: true };
    }),

  // ===== ADMIN ENDPOINTS =====
  list: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      let query = db.select().from(orders);
      if (input?.status) {
        query = query.where(eq(orders.status, input.status as any)) as any;
      }

      const items = await query.orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
      return items;
    }),

  updateStatus: adminQuery
    .input(z.object({
      orderId: z.number(),
      status: z.enum(["pending", "confirmed", "processing", "ready_to_ship", "handover_to_delivery", "in_transit", "out_for_delivery", "delivered", "cancelled", "returned"]).optional(),
      paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const updateData: any = { updatedAt: new Date() };
      if (input.status) updateData.status = input.status;
      if (input.paymentStatus) updateData.paymentStatus = input.paymentStatus;

      await db.update(orders).set(updateData).where(eq(orders.id, input.orderId));

      if (input.status) {
        await db.insert(orderStatusHistory).values({
          orderId: input.orderId,
          status: input.status,
          notes: input.notes || `Status updated to ${input.status}`,
          changedBy: ctx.user.id,
        });

        // Send status update email asynchronously
        const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId));
        if (order && order.userId) {
          const [user] = await db.select().from(users).where(eq(users.id, order.userId));
          if (user && user.email) {
            sendMail({
              to: user.email,
              subject: `Order Status Update - ${order.orderNumber}`,
              html: getOrderStatusEmailHtml(order)
            }).catch(err => console.error("Failed to send status email", err));
          }
        }
      }

      return { success: true };
    }),

  assignDelivery: adminQuery
    .input(z.object({
      orderId: z.number(),
      deliveryManId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db.update(orders).set({
        deliveryManId: input.deliveryManId,
        status: "handover_to_delivery",
      }).where(eq(orders.id, input.orderId));

      // Generate OTP for delivery
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await db.insert(deliveryAssignments).values({
        orderId: input.orderId,
        deliveryManId: input.deliveryManId,
        otp,
      });

      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        status: "handover_to_delivery",
        notes: `Assigned to delivery man (OTP: ${otp})`,
        changedBy: ctx.user.id,
      });

      return { success: true };
    }),

  // ===== DELIVERY MAN ENDPOINTS =====
  myDeliveries: deliveryQuery.query(async ({ ctx }) => {
    const db = getDb();
    const deliveryManId = ctx.user.id;

    const assignments = await db
      .select()
      .from(deliveryAssignments)
      .where(eq(deliveryAssignments.deliveryManId, deliveryManId))
      .orderBy(desc(deliveryAssignments.assignedAt));

    return assignments;
  }),

  updateDeliveryStatus: deliveryQuery
    .input(z.object({
      assignmentId: z.number(),
      status: z.enum(["accepted", "picked_up", "in_transit", "delivered", "cancelled"]),
      otp: z.string().optional(),
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

      const updateData: any = { status: input.status };

      if (input.status === "accepted") updateData.acceptedAt = new Date();
      if (input.status === "picked_up") updateData.pickedUpAt = new Date();
      if (input.status === "delivered") {
        updateData.deliveredAt = new Date();
        if (input.deliveryPhoto) updateData.deliveryPhoto = input.deliveryPhoto;
        if (input.notes) updateData.deliveryNotes = input.notes;

        // Update order status
        await db.update(orders).set({ status: "delivered", deliveredAt: new Date() }).where(eq(orders.id, assignment.orderId));
      }

      await db.update(deliveryAssignments).set(updateData).where(eq(deliveryAssignments.id, input.assignmentId));

      return { success: true };
    }),
});
