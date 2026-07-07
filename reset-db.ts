import { getDb } from "./api/queries/connection";
import { sql } from "drizzle-orm";

const db = getDb();

async function reset() {
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  const tables = await db.execute(sql`SHOW TABLES`);
  console.log("Tables found:", (tables[0] as any[])?.length || 0);
  for (const t of (tables[0] as any[] || [])) {
    const name = Object.values(t)[0] as string;
    console.log("Dropping:", name);
    await db.execute(sql.raw(`DROP TABLE IF EXISTS \`${name}\``));
  }
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
  console.log("All tables dropped successfully");
}

reset().catch((e) => { console.error("Error:", e.message); process.exit(1); });
