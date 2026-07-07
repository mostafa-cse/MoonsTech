import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { signSessionToken } from "./kimi/session";
import { upsertUser } from "./queries/users";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  
  register: publicQuery
    .input(z.object({
      name: z.string().min(2, "Name is too short"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(10, "Phone number is too short"),
      password: z.string().min(6, "Password must be at least 6 characters")
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Check if user exists
      const existingUsers = await db.select().from(users).where(eq(users.email, input.email));
      if (existingUsers.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "User with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const unionId = `user-${Date.now()}`;

      await db.insert(users).values({
        unionId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: "buyer",
      });

      // Log them in immediately
      const token = await signSessionToken({ unionId, clientId: env.appId });
      const opts = getSessionCookieOptions(ctx.req.headers);
      
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true };
    }),

  login: publicQuery
    .input(z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required")
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const [user] = await db.select().from(users).where(eq(users.email, input.email));
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid email or password" });
      }

      if (!user.passwordHash) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Please use alternative login methods for this account" });
      }

      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      // Update last sign in
      await db.update(users).set({ lastSignInAt: new Date() }).where(eq(users.id, user.id));

      const token = await signSessionToken({ unionId: user.unionId, clientId: env.appId });
      const opts = getSessionCookieOptions(ctx.req.headers);
      
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true, role: user.role };
    }),

  devLogin: publicQuery.mutation(async ({ ctx }) => {
    if (env.isProduction) throw new Error("Not available in production");
    const unionId = "dev-admin-" + Date.now();
    try {
      await upsertUser({
        unionId,
        name: "Dev Admin",
        role: "admin",
        lastSignInAt: new Date(),
      });
    } catch (e) {
      console.warn("DB not connected, bypassing user insert for dev login");
    }
    const token = await signSessionToken({ unionId, clientId: env.appId });
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, token, {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: Session.maxAgeMs / 1000,
      }),
    );
    return { success: true };
  }),
  
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
