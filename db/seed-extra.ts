import { getDb } from "../api/queries/connection";
import { users } from "./schema";
import bcrypt from "bcryptjs";

const db = getDb();

async function seedExtra() {
  console.log("Seeding extra users...");
  
  const defaultPassword = "password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Admin User
  await db.insert(users).values({
    unionId: "admin-" + Date.now(),
    name: "Admin User",
    email: "admin@example.com",
    phone: "01700000001",
    passwordHash: hashedPassword,
    role: "admin",
    status: "active",
  }).onDuplicateKeyUpdate({ set: { role: "admin", passwordHash: hashedPassword } });
  
  // Buyer User
  await db.insert(users).values({
    unionId: "buyer-" + Date.now(),
    name: "Regular Buyer",
    email: "user@example.com",
    phone: "01700000002",
    passwordHash: hashedPassword,
    role: "buyer",
    status: "active",
  }).onDuplicateKeyUpdate({ set: { role: "buyer", passwordHash: hashedPassword } });
  
  // Rider (Delivery Man)
  await db.insert(users).values({
    unionId: "rider-" + Date.now(),
    name: "Fast Rider",
    email: "rider@example.com",
    phone: "01700000003",
    passwordHash: hashedPassword,
    role: "delivery_man",
    status: "active",
  }).onDuplicateKeyUpdate({ set: { role: "delivery_man", passwordHash: hashedPassword } });

  console.log("Users created successfully!");
  process.exit(0);
}

seedExtra().catch((err) => {
  console.error("Error seeding extra data:", err);
  process.exit(1);
});
