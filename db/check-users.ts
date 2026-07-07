import { getDb } from "../api/queries/connection";
import { users } from "./schema";

const db = getDb();

async function checkUsers() {
  const allUsers = await db.select().from(users);
  console.log("Users:", allUsers.map(u => ({ email: u.email, role: u.role, unionId: u.unionId })));
  process.exit(0);
}

checkUsers().catch(console.error);
