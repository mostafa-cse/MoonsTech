import { z } from "zod";
import { createRouter, buyerQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { megaCoinTransactions, megaCoinSettings, buyerProfiles } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const megaCoinRouter = createRouter({
  // Get user's MegaCoin balance and transaction history
  myCoins: buyerQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const [profile] = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, userId));

    const transactions = await db
      .select()
      .from(megaCoinTransactions)
      .where(eq(megaCoinTransactions.userId, userId))
      .orderBy(desc(megaCoinTransactions.createdAt))
      .limit(50);

    const [settings] = await db.select().from(megaCoinSettings);

    return {
      balance: profile?.megaCoinBalance || 0,
      transactions,
      conversionRate: settings ? Number(settings.takaPerCoin) : 0.1,
      minimumRedeem: settings?.minimumRedeem || 100,
      maximumRedeemPerOrder: settings?.maximumRedeemPerOrder || 1000,
    };
  }),

  // Calculate discount from coins
  calculateDiscount: buyerQuery
    .input(z.object({ coins: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [profile] = await db
        .select()
        .from(buyerProfiles)
        .where(eq(buyerProfiles.userId, userId));

      const [settings] = await db.select().from(megaCoinSettings);

      const balance = profile?.megaCoinBalance || 0;
      if (input.coins > balance) return { error: "Insufficient coins" };

      const maxRedeem = settings?.maximumRedeemPerOrder || 1000;
      const coinsToUse = Math.min(input.coins, maxRedeem, balance);
      const conversionRate = Number(settings?.takaPerCoin || 0.1);
      const discount = Math.round(coinsToUse * conversionRate * 100) / 100;

      return { coinsToUse, discount, remainingBalance: balance - coinsToUse };
    }),

  // Get settings (public)
  settings: createRouter({
    get: adminQuery.query(async () => {
      const db = getDb();
      const [settings] = await db.select().from(megaCoinSettings);
      return settings || null;
    }),

    update: adminQuery
      .input(z.object({
        coinsPerTaka: z.string().optional(),
        takaPerCoin: z.string().optional(),
        minimumRedeem: z.number().optional(),
        maximumRedeemPerOrder: z.number().optional(),
        expiryDays: z.number().optional(),
        welcomeBonus: z.number().optional(),
        referralBonus: z.number().optional(),
        reviewBonus: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const [existing] = await db.select().from(megaCoinSettings);

        if (existing) {
          await db.update(megaCoinSettings).set(input).where(eq(megaCoinSettings.id, existing.id));
        } else {
          await db.insert(megaCoinSettings).values(input);
        }

        return { success: true };
      }),
  }),
});
