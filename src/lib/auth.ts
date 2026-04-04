import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./db/schema";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

export const authOptions = {
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
    // Potential Future: Add CredentialsProvider or custom OTP logic here
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
        // The Drizzle adapter binds the user object from the DB directly here
        // If we need phone we can fetch it, actually it's attached depending on adapter version,
        // but id is the most important currently.
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
