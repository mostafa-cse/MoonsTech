import { z } from "zod";
import { createRouter, buyerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { carts, cartItems, products, productImages } from "@db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const cartRouter = createRouter({
  get: buyerQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));

    if (!cart) {
      const result = await db.insert(carts).values({ userId });
      cart = { id: result[0].insertId as number, userId, sessionId: null, createdAt: new Date(), updatedAt: new Date() };
    }

    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        addedAt: cartItems.addedAt,
        productId: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        stockQuantity: products.stockQuantity,
        stockStatus: products.stockStatus,
        warrantyDuration: products.warrantyDuration,
        warrantyType: products.warrantyType,
        megaCoinReward: products.megaCoinReward,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    // Get images
    const productIds = items.map(i => i.productId);
    const images = productIds.length > 0
      ? await db
          .select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
      : [];
    const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));

    const itemsWithImages = items.map(item => ({
      ...item,
      image: imageMap.get(item.productId) || null,
      unitPrice: item.salePrice || item.regularPrice,
      totalPrice: (Number(item.salePrice || item.regularPrice) * item.quantity).toFixed(2),
    }));

    const subtotal = itemsWithImages.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    return {
      cartId: cart.id,
      itemCount: items.length,
      subtotal: subtotal.toFixed(2),
      items: itemsWithImages,
    };
  }),

  add: buyerQuery
    .input(z.object({ productId: z.number(), quantity: z.number().min(1).default(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check product availability
      const [product] = await db.select().from(products).where(eq(products.id, input.productId));
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      if (product.stockStatus !== "in_stock") throw new TRPCError({ code: "BAD_REQUEST", message: "Product out of stock" });
      if (product.stockQuantity < input.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });

      // Get or create cart
      let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
      if (!cart) {
        const result = await db.insert(carts).values({ userId });
        cart = { id: result[0].insertId as number, userId, sessionId: null, createdAt: new Date(), updatedAt: new Date() };
      }

      // Check if item already in cart
      const [existing] = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, input.productId)));

      // Validate stock for total quantity
      
      const totalQty = (existing?.quantity || 0) + input.quantity;
      if (product.stockQuantity < totalQty) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Only ${product.stockQuantity} items available in stock` });
      }

      if (existing) {
        await db
          .update(cartItems)
          .set({ quantity: totalQty })
          .where(eq(cartItems.id, existing.id));
      } else {
        await db.insert(cartItems).values({
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
        });
      }

      return { success: true, message: "Added to cart" };
    }),

  bulkAdd: buyerQuery
    .input(z.object({ items: z.array(z.object({ productId: z.number(), quantity: z.number().min(1).default(1) })) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
      if (!cart) {
        const result = await db.insert(carts).values({ userId });
        cart = { id: result[0].insertId as number, userId, sessionId: null, createdAt: new Date(), updatedAt: new Date() };
      }

      for (const item of input.items) {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        if (!product || product.stockStatus !== "in_stock" || product.stockQuantity < item.quantity) continue;

        const [existing] = await db
          .select()
          .from(cartItems)
          .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, item.productId)));

        const totalQty = (existing?.quantity || 0) + item.quantity;
        if (product.stockQuantity < totalQty) continue;

        if (existing) {
          await db.update(cartItems).set({ quantity: totalQty }).where(eq(cartItems.id, existing.id));
        } else {
          await db.insert(cartItems).values({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          });
        }
      }

      return { success: true, message: "Added items to cart" };
    }),

  updateQuantity: buyerQuery
    .input(z.object({ itemId: z.number(), quantity: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
      if (!cart) throw new TRPCError({ code: "NOT_FOUND", message: "Cart not found" });

      const [item] = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, cart.id)));

      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });

      // Check stock
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product && product.stockQuantity < input.quantity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
      }

      await db.update(cartItems).set({ quantity: input.quantity }).where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  remove: buyerQuery
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
      if (!cart) throw new TRPCError({ code: "NOT_FOUND", message: "Cart not found" });

      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, cart.id)));

      return { success: true };
    }),

  clear: buyerQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    if (cart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    return { success: true };
  }),
});
