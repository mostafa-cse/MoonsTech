import { getDb } from "./api/queries/connection";
import { users } from "./db/schema";
async function test() {
  try {
    const db = getDb();
    const result = await db.select().from(users).limit(1);
    console.log("Query success", result);
  } catch (e) {
    console.error("Query error", e);
  }
}
test();
