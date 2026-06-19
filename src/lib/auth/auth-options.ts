import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import type { Role } from "@/types/domain";

// ---------------------------------------------------------------------------
// Session + JWT shape extension
// ---------------------------------------------------------------------------
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      role: Role;
      brandName?: string | null;
    };
  }
  interface User {
    id: string;
    name?: string | null;
    email: string;
    role: Role;
    brandName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    brandName?: string | null;
  }
}

// ---------------------------------------------------------------------------
// NextAuth config
// ---------------------------------------------------------------------------
export const authOptions: NextAuthOptions = {
  // PrismaAdapter is used for session/account storage when an OAuth/email
  // provider is added later. For pure credentials, we manage the User row
  // ourselves and let NextAuth use JWT sessions.
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await db.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) return null;

        const ok = await verifyPassword(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          brandName: user.brandName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, `user` is the object returned from authorize()
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.brandName = user.brandName;
      }
      return token;
    },
    async session({ session, token }) {
      // Make token fields available on session.user
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.brandName = token.brandName;
      }
      return session;
    },
  },
};
