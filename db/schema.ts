import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  bigint,
  json,
  date,

  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ==================== USER MANAGEMENT ====================

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["buyer", "admin", "delivery_man", "super_admin"]).default("buyer").notNull(),
  emailVerified: boolean("emailVerified").default(false),
  phoneVerified: boolean("phoneVerified").default(false),
  status: mysqlEnum("status", ["active", "blocked", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Buyer profiles (additional info for buyers)
export const buyerProfiles = mysqlTable("buyer_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: date("dateOfBirth"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  newsletterSubscribed: boolean("newsletterSubscribed").default(false),
  megaCoinBalance: int("megaCoinBalance").default(0).notNull(),
  referralCode: varchar("referralCode", { length: 20 }).unique(),
  referredBy: bigint("referredBy", { mode: "number", unsigned: true }).references(() => users.id),
  totalOrders: int("totalOrders").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0.00").notNull(),
}, (table) => [
  index("buyer_user_idx").on(table.userId),
]);

// Delivery man profiles
export const deliveryManProfiles = mysqlTable("delivery_man_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  nidNumber: varchar("nidNumber", { length: 50 }),
  drivingLicense: varchar("drivingLicense", { length: 50 }),
  vehicleType: mysqlEnum("vehicleType", ["bicycle", "motorcycle", "van", "truck"]).default("motorcycle"),
  vehicleNumber: varchar("vehicleNumber", { length: 50 }),
  emergencyContact: varchar("emergencyContact", { length: 20 }),
  photo: text("photo"),
  workArea: varchar("workArea", { length: 255 }),
  availabilityStatus: mysqlEnum("availabilityStatus", ["online", "offline", "on_delivery"]).default("offline"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  totalDeliveries: int("totalDeliveries").default(0),
  successfulDeliveries: int("successfulDeliveries").default(0),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("50.00"),
  isVerified: boolean("isVerified").default(false),
  verifiedAt: timestamp("verifiedAt"),
}, (table) => [
  index("dm_user_idx").on(table.userId),
]);

// Address book (for buyers)
export const addresses = mysqlTable("addresses", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }).default("Home"),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  division: varchar("division", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  thana: varchar("thana", { length: 100 }).notNull(),
  fullAddress: text("fullAddress").notNull(),
  landmark: varchar("landmark", { length: 255 }),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("address_user_idx").on(table.userId),
]);

// ==================== PRODUCT CATALOG ====================

// Categories (multi-level: Main > Sub > Child)
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  icon: varchar("icon", { length: 100 }),
  parentId: bigint("parentId", { mode: "number", unsigned: true }),
  level: int("level").default(1).notNull(), // 1=main, 2=sub, 3=child
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("category_parent_idx").on(table.parentId),
  index("category_slug_idx").on(table.slug),
]);

// Brands
export const brands = mysqlTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  website: varchar("website", { length: 255 }),
  isFeatured: boolean("isFeatured").default(false),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Products
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).notNull().references(() => categories.id),
  brandId: bigint("brandId", { mode: "number", unsigned: true }).references(() => brands.id),
  modelNumber: varchar("modelNumber", { length: 255 }),
  shortDescription: text("shortDescription"),
  fullDescription: text("fullDescription"),
  videoUrl: text("videoUrl"),
  regularPrice: decimal("regularPrice", { precision: 12, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 12, scale: 2 }),
  costPrice: decimal("costPrice", { precision: 12, scale: 2 }),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(5),
  stockStatus: mysqlEnum("stockStatus", ["in_stock", "out_of_stock", "pre_order"]).default("in_stock"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: varchar("dimensions", { length: 100 }),
  warrantyDuration: int("warrantyDuration").default(0),
  warrantyType: mysqlEnum("warrantyType", ["none", "official", "replacement", "seller"]).default("none"),
  guarantyDuration: int("guarantyDuration").default(0),
  returnPolicyDays: int("returnPolicyDays").default(7),
  returnPolicyConditions: text("returnPolicyConditions"),
  tags: text("tags"),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  megaCoinReward: int("megaCoinReward").default(0),
  couponEligible: boolean("couponEligible").default(true),
  isFeatured: boolean("isFeatured").default(false),
  isNewArrival: boolean("isNewArrival").default(false),
  isBestSeller: boolean("isBestSeller").default(false),
  status: mysqlEnum("status", ["published", "draft", "archived"]).default("draft"),
  totalSales: int("totalSales").default(0),
  avgRating: decimal("avgRating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("product_category_idx").on(table.categoryId),
  index("product_brand_idx").on(table.brandId),
  index("product_status_idx").on(table.status),
  index("product_slug_idx").on(table.slug),
  index("product_featured_idx").on(table.isFeatured),
  index("product_bestseller_idx").on(table.isBestSeller),
]);

// Product images
export const productImages = mysqlTable("product_images", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("imageUrl").notNull(),
  altText: varchar("altText", { length: 255 }),
  sortOrder: int("sortOrder").default(0),
  isPrimary: boolean("isPrimary").default(false),
}, (table) => [
  index("img_product_idx").on(table.productId),
]);

// Product specifications (key-value pairs)
export const productSpecifications = mysqlTable("product_specifications", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
  specKey: varchar("specKey", { length: 255 }).notNull(),
  specValue: text("specValue").notNull(),
  specGroup: varchar("specGroup", { length: 100 }).default("General"),
}, (table) => [
  index("spec_product_idx").on(table.productId),
]);

// ==================== CART & WISHLIST ====================

export const carts = mysqlTable("carts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("sessionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("cart_user_idx").on(table.userId),
]);

export const cartItems = mysqlTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: bigint("cartId", { mode: "number", unsigned: true }).notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  quantity: int("quantity").default(1).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => [
  index("ci_cart_idx").on(table.cartId),
  index("ci_product_idx").on(table.productId),
]);

export const wishlists = mysqlTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("wishlist_unique").on(table.userId, table.productId),
]);

// ==================== ORDERS ====================

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  status: mysqlEnum("status", [
    "pending", "confirmed", "processing", "ready_to_ship",
    "handover_to_delivery", "in_transit", "out_for_delivery",
    "delivered", "cancelled", "returned"
  ]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).default("0.00"),
  couponCode: varchar("couponCode", { length: 50 }),
  megaCoinsUsed: int("megaCoinsUsed").default(0),
  megaCoinDiscount: decimal("megaCoinDiscount", { precision: 12, scale: 2 }).default("0.00"),
  shippingCost: decimal("shippingCost", { precision: 12, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", [
    "cod", "bkash", "nagad", "rocket", "card", "online_banking", "megacoin"
  ]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded", "partially_refunded"]).default("pending"),
  deliveryMethod: mysqlEnum("deliveryMethod", ["home_delivery", "express_delivery"]).default("home_delivery"),
  deliveryAddress: json("deliveryAddress").notNull(),
  deliveryManId: bigint("deliveryManId", { mode: "number", unsigned: true }).references(() => users.id),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  notes: text("notes"),
  internalNotes: text("internalNotes"),
  estimatedDeliveryDate: date("estimatedDeliveryDate"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("order_user_idx").on(table.userId),
  index("order_status_idx").on(table.status),
  index("order_number_idx").on(table.orderNumber),
  index("order_delivery_man_idx").on(table.deliveryManId),
]);

export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  productName: varchar("productName", { length: 500 }).notNull(),
  productImage: text("productImage"),
  sku: varchar("sku", { length: 100 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  megaCoinReward: int("megaCoinReward").default(0),
}, (table) => [
  index("oi_order_idx").on(table.orderId),
  index("oi_product_idx").on(table.productId),
]);

// Order status history
export const orderStatusHistory = mysqlTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(),
  notes: text("notes"),
  changedBy: bigint("changedBy", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("osh_order_idx").on(table.orderId),
]);

// ==================== COUPONS ====================

export const coupons = mysqlTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed_amount", "free_shipping"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  minimumOrderAmount: decimal("minimumOrderAmount", { precision: 12, scale: 2 }).default("0.00"),
  maximumDiscount: decimal("maximumDiscount", { precision: 12, scale: 2 }),
  usageLimit: int("usageLimit"),
  usageCount: int("usageCount").default(0),
  perUserLimit: int("perUserLimit").default(1),
  applicableCategories: text("applicableCategories"),
  applicableProducts: text("applicableProducts"),
  applicableBrands: text("applicableBrands"),
  userRestriction: mysqlEnum("userRestriction", ["all", "new", "existing"]).default("all"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const couponUsages = mysqlTable("coupon_usages", {
  id: serial("id").primaryKey(),
  couponId: bigint("couponId", { mode: "number", unsigned: true }).notNull().references(() => coupons.id),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).references(() => orders.id),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).notNull(),
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

// ==================== MEGACOIN (LOYALTY POINTS) ====================

export const megaCoinTransactions = mysqlTable("mega_coin_transactions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["earn", "redeem", "expire", "bonus", "referral", "adjustment"]).notNull(),
  amount: int("amount").notNull(),
  balance: int("balance").notNull(),
  description: text("description").notNull(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).references(() => orders.id),
  referenceUserId: bigint("referenceUserId", { mode: "number", unsigned: true }).references(() => users.id),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("mct_user_idx").on(table.userId),
  index("mct_order_idx").on(table.orderId),
]);

export const megaCoinSettings = mysqlTable("mega_coin_settings", {
  id: serial("id").primaryKey(),
  coinsPerTaka: decimal("coinsPerTaka", { precision: 10, scale: 2 }).default("1.00").notNull(),
  takaPerCoin: decimal("takaPerCoin", { precision: 10, scale: 4 }).default("0.10").notNull(),
  minimumRedeem: int("minimumRedeem").default(100),
  maximumRedeemPerOrder: int("maximumRedeemPerOrder").default(1000),
  expiryDays: int("expiryDays").default(365),
  welcomeBonus: int("welcomeBonus").default(50),
  referralBonus: int("referralBonus").default(100),
  reviewBonus: int("reviewBonus").default(20),
  isActive: boolean("isActive").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ==================== DELIVERY MANAGEMENT ====================

export const deliveryAssignments = mysqlTable("delivery_assignments", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull().references(() => orders.id),
  deliveryManId: bigint("deliveryManId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  status: mysqlEnum("status", ["assigned", "accepted", "picked_up", "in_transit", "delivered", "cancelled"]).default("assigned"),
  otp: varchar("otp", { length: 10 }),
  deliveryPhoto: text("deliveryPhoto"),
  customerSignature: text("customerSignature"),
  deliveryNotes: text("deliveryNotes"),
  cashCollected: decimal("cashCollected", { precision: 12, scale: 2 }).default("0.00"),
  commission: decimal("commission", { precision: 12, scale: 2 }).default("0.00"),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  pickedUpAt: timestamp("pickedUpAt"),
  deliveredAt: timestamp("deliveredAt"),
}, (table) => [
  index("da_order_idx").on(table.orderId),
  index("da_dm_idx").on(table.deliveryManId),
]);

// Delivery zones/areas
export const deliveryZones = mysqlTable("delivery_zones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  divisions: text("divisions").notNull(),
  districts: text("districts"),
  baseCharge: decimal("baseCharge", { precision: 10, scale: 2 }).default("60.00"),
  expressCharge: decimal("expressCharge", { precision: 10, scale: 2 }).default("120.00"),
  freeShippingThreshold: decimal("freeShippingThreshold", { precision: 12, scale: 2 }).default("5000.00"),
  estimatedDays: int("estimatedDays").default(2),
  isActive: boolean("isActive").default(true),
});

// ==================== RETURNS & REFUNDS ====================

export const returns = mysqlTable("returns", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull().references(() => orders.id),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  returnNumber: varchar("returnNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", [
    "requested", "approved", "picked_up", "received",
    "inspected", "refunded", "rejected", "completed"
  ]).default("requested"),
  reason: mysqlEnum("reason", ["defective", "wrong_item", "not_as_described", "changed_mind", "other"]).notNull(),
  reasonDetails: text("reasonDetails"),
  refundMethod: mysqlEnum("refundMethod", ["wallet", "original_payment"]).default("wallet"),
  refundAmount: decimal("refundAmount", { precision: 12, scale: 2 }),
  adminNotes: text("adminNotes"),
  pickupScheduledAt: timestamp("pickupScheduledAt"),
  pickedUpAt: timestamp("pickedUpAt"),
  receivedAt: timestamp("receivedAt"),
  refundedAt: timestamp("refundedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("return_order_idx").on(table.orderId),
  index("return_user_idx").on(table.userId),
]);

export const returnItems = mysqlTable("return_items", {
  id: serial("id").primaryKey(),
  returnId: bigint("returnId", { mode: "number", unsigned: true }).notNull().references(() => returns.id),
  orderItemId: bigint("orderItemId", { mode: "number", unsigned: true }).notNull().references(() => orderItems.id),
  quantity: int("quantity").notNull(),
  condition: mysqlEnum("condition", ["new", "good", "damaged", "incomplete"]),
  refundAmount: decimal("refundAmount", { precision: 12, scale: 2 }).notNull(),
});

// ==================== REVIEWS ====================

export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).references(() => orders.id),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  images: text("images"),
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false),
  isApproved: boolean("isApproved").default(true),
  helpfulCount: int("helpfulCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("review_product_idx").on(table.productId),
  index("review_user_idx").on(table.userId),
]);

// ==================== PC BUILDER ====================

export const pcBuilds = mysqlTable("pc_builds", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).default("My PC Build"),
  slug: varchar("slug", { length: 255 }).unique(),
  isTemplate: boolean("isTemplate").default(false),
  templateType: mysqlEnum("templateType", ["gaming", "office", "content_creation", "budget"]),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).default("0.00"),
  estimatedWattage: int("estimatedWattage").default(0),
  performanceTier: mysqlEnum("performanceTier", ["entry", "mid", "high", "enthusiast"]),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pcBuildComponents = mysqlTable("pc_build_components", {
  id: serial("id").primaryKey(),
  buildId: bigint("buildId", { mode: "number", unsigned: true }).notNull().references(() => pcBuilds.id, { onDelete: "cascade" }),
  componentType: mysqlEnum("componentType", [
    "cpu", "cpu_cooler", "motherboard", "ram", "gpu",
    "storage", "psu", "casing", "monitor", "keyboard",
    "mouse", "case_fan"
  ]).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  quantity: int("quantity").default(1),
}, (table) => [
  index("pbc_build_idx").on(table.buildId),
]);

// ==================== CONTENT MANAGEMENT ====================

export const banners = mysqlTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  image: text("image").notNull(),
  link: varchar("link", { length: 500 }),
  position: mysqlEnum("position", ["home_hero", "home_promo", "category", "promotional"]).default("home_hero"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const flashSales = mysqlTable("flash_sales", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  salePrice: decimal("salePrice", { precision: 12, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  sold: int("sold").default(0),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== NOTIFICATIONS ====================

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", [
    "order", "payment", "delivery", "return", "promotion",
    "megacoin", "system", "review"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("notif_user_idx").on(table.userId),
]);

// ==================== SITE SETTINGS ====================

export const siteSettings = mysqlTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  group: varchar("group", { length: 50 }).default("general"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ==================== COMPARE LISTS ====================

export const compareLists = mysqlTable("compare_lists", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("compare_unique").on(table.userId, table.productId),
]);

// ==================== ACTIVITY LOGS ====================

export const activityLogs = mysqlTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: bigint("entityId", { mode: "number", unsigned: true }),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("log_user_idx").on(table.userId),
]);
