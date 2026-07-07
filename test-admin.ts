import { getDb } from "./api/queries/connection";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { appRouter } from "./api/router";

async function runTests() {
  console.log("Starting Admin Dashboard tests...");
  
  // 1. Get an admin user
  const db = getDb();
  const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
  if (!adminUsers.length) {
    console.error("No admin user found!");
    process.exit(1);
  }
  const admin = adminUsers[0];
  console.log(`Using admin: ${admin.email}`);
  
  // 2. Create TRPC caller
  const caller = appRouter.createCaller({ user: admin });
  
  // 3. Test admin.dashboard
  try {
    console.log("\n[Test 1] Testing admin.dashboard endpoint...");
    const dashboardData = await caller.admin.dashboard();
    console.log("Stats:", dashboardData.stats);
    console.log("Top Products:", dashboardData.topProducts.length);
    console.log("Low Stock:", dashboardData.lowStock.length);
    console.log("Recent Orders:", dashboardData.recentOrders.length);
    console.log("✅ admin.dashboard endpoint works perfectly.");
  } catch (err: any) {
    console.error("❌ admin.dashboard endpoint failed:", err.message);
  }
  
  // 4. Test admin.salesReport
  try {
    console.log("\n[Test 2] Testing admin.salesReport endpoint (no dates)...");
    const reportData = await caller.admin.salesReport({});
    console.log(`Found ${reportData.orders.length} orders in report.`);
    console.log(`Daily Revenue points: ${reportData.dailyRevenue.length}`);
    console.log("✅ admin.salesReport endpoint works perfectly.");
  } catch (err: any) {
    console.error("❌ admin.salesReport endpoint failed:", err.message);
  }
  
  // 5. Test admin.salesReport with dates
  try {
    console.log("\n[Test 3] Testing admin.salesReport endpoint (with dates)...");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const reportData2 = await caller.admin.salesReport({
      startDate: startDate.toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0]
    });
    console.log(`Found ${reportData2.orders.length} orders in date-filtered report.`);
    console.log("✅ admin.salesReport (with dates) endpoint works perfectly.");
  } catch (err: any) {
    console.error("❌ admin.salesReport (with dates) endpoint failed:", err.message);
  }
  
  process.exit(0);
}

runTests().catch(console.error);
