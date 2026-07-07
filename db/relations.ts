import { relations } from "drizzle-orm";
import {
  users, buyerProfiles, deliveryManProfiles, addresses,
  categories, brands, products, productImages, productSpecifications,
  carts, cartItems, wishlists, orders, orderItems, orderStatusHistory,
  coupons, couponUsages, megaCoinTransactions,
  deliveryAssignments, returns, returnItems,
  reviews, pcBuilds, pcBuildComponents, flashSales,
  notifications, compareLists
} from "./schema";

// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  buyerProfile: one(buyerProfiles, { fields: [users.id], references: [buyerProfiles.userId] }),
  deliveryProfile: one(deliveryManProfiles, { fields: [users.id], references: [deliveryManProfiles.userId] }),
  addresses: many(addresses),
  orders: many(orders),
  cart: one(carts, { fields: [users.id], references: [carts.userId] }),
  wishlists: many(wishlists),
  reviews: many(reviews),
  megaCoinTransactions: many(megaCoinTransactions),
  notifications: many(notifications),
}));

// Buyer Profile Relations
export const buyerProfilesRelations = relations(buyerProfiles, ({ one }) => ({
  user: one(users, { fields: [buyerProfiles.userId], references: [users.id] }),
}));

// Delivery Man Profile Relations
export const deliveryManProfilesRelations = relations(deliveryManProfiles, ({ one }) => ({
  user: one(users, { fields: [deliveryManProfiles.userId], references: [users.id] }),
}));

// Address Relations
export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

// Category Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "parent" }),
  children: many(categories, { relationName: "parent" }),
  products: many(products),
}));

// Brand Relations
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

// Product Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  images: many(productImages),
  specifications: many(productSpecifications),
  reviews: many(reviews),
  orderItems: many(orderItems),
}));

// Product Image Relations
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

// Product Specification Relations
export const productSpecificationsRelations = relations(productSpecifications, ({ one }) => ({
  product: one(products, { fields: [productSpecifications.productId], references: [products.id] }),
}));

// Cart Relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

// Cart Item Relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

// Wishlist Relations
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}));

// Order Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  deliveryMan: one(users, { fields: [orders.deliveryManId], references: [users.id] }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  megaCoinTransactions: many(megaCoinTransactions),
}));

// Order Item Relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// Order Status History Relations
export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));

// Coupon Relations
export const couponsRelations = relations(coupons, ({ many }) => ({
  usages: many(couponUsages),
}));

// Coupon Usage Relations
export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  coupon: one(coupons, { fields: [couponUsages.couponId], references: [coupons.id] }),
  user: one(users, { fields: [couponUsages.userId], references: [users.id] }),
}));

// MegaCoin Transaction Relations
export const megaCoinTransactionsRelations = relations(megaCoinTransactions, ({ one }) => ({
  user: one(users, { fields: [megaCoinTransactions.userId], references: [users.id] }),
}));

// Delivery Assignment Relations
export const deliveryAssignmentsRelations = relations(deliveryAssignments, ({ one }) => ({
  order: one(orders, { fields: [deliveryAssignments.orderId], references: [orders.id] }),
}));

// Return Relations
export const returnsRelations = relations(returns, ({ one, many }) => ({
  order: one(orders, { fields: [returns.orderId], references: [orders.id] }),
  user: one(users, { fields: [returns.userId], references: [users.id] }),
  items: many(returnItems),
}));

// Return Item Relations
export const returnItemsRelations = relations(returnItems, ({ one }) => ({
  return: one(returns, { fields: [returnItems.returnId], references: [returns.id] }),
}));

// Review Relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

// PC Build Relations
export const pcBuildsRelations = relations(pcBuilds, ({ one, many }) => ({
  user: one(users, { fields: [pcBuilds.userId], references: [users.id] }),
  components: many(pcBuildComponents),
}));

// PC Build Component Relations
export const pcBuildComponentsRelations = relations(pcBuildComponents, ({ one }) => ({
  build: one(pcBuilds, { fields: [pcBuildComponents.buildId], references: [pcBuilds.id] }),
  product: one(products, { fields: [pcBuildComponents.productId], references: [products.id] }),
}));

// Flash Sale Relations
export const flashSalesRelations = relations(flashSales, ({ one }) => ({
  product: one(products, { fields: [flashSales.productId], references: [products.id] }),
}));

// Notification Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Compare List Relations
export const compareListsRelations = relations(compareLists, ({ one }) => ({
  user: one(users, { fields: [compareLists.userId], references: [users.id] }),
  product: one(products, { fields: [compareLists.productId], references: [products.id] }),
}));
