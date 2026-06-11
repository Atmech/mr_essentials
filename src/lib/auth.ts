import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./db/schema";
import { verifyPassword } from "./password";

type Role = "user" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      phone?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Admin email/password login. Validates against ADMIN_EMAIL + the scrypt
    // hash in ADMIN_PASSWORD_HASH, then mints a JWT with role 'admin'.
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
        const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
        if (!email || !password || !adminEmail || !hash) return null;
        if (email !== adminEmail) return null;
        if (!verifyPassword(password, hash)) return null;
        return { id: "admin", email, name: "Admin", role: "admin" as const };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Role comes exclusively from the credentials provider (admin-credentials sets
      // role:'admin'). Google OAuth always produces role:'user' — no email-allowlist
      // bypass — so admin elevation is only possible via /admin/login.
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "user";
      }
      if (!token.role) token.role = "user";
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        if (token?.id) session.user.id = token.id;
        session.user.role = token.role ?? "user";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // NextAuth + Drizzle usually favors Database sessions if using DB, but JWT is often faster or required by some deploy config
  },
};

// If using app router new config approach => NextAuth config can be exported like this or just import NextAuth from route
// We will export the handler in the api route
