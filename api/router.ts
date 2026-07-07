import { authRouter } from "./auth-router";
import { productRouter } from "./product-router";
import { categoryRouter } from "./category-router";
import { brandRouter } from "./brand-router";
import { cartRouter } from "./cart-router";
import { orderRouter } from "./order-router";
import { couponRouter } from "./coupon-router";
import { megaCoinRouter } from "./megacoin-router";
import { reviewRouter } from "./review-router";
import { wishlistRouter } from "./wishlist-router";
import { addressRouter } from "./address-router";
import { adminRouter } from "./admin-router";
import { deliveryRouter } from "./delivery-router";
import { pcBuilderRouter } from "./pcbuilder-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  category: categoryRouter,
  brand: brandRouter,
  cart: cartRouter,
  order: orderRouter,
  coupon: couponRouter,
  megacoin: megaCoinRouter,
  review: reviewRouter,
  wishlist: wishlistRouter,
  address: addressRouter,
  admin: adminRouter,
  delivery: deliveryRouter,
  pcbuilder: pcBuilderRouter,
});

export type AppRouter = typeof appRouter;
