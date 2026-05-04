import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        console.log(`[AUTH] Google Profile received for: ${profile.email}`);
        return {
          name: profile.name,
          firstName: profile.given_name || profile.name,
          lastName: profile.family_name || "",
          email: profile.email,
          image: profile.picture,
          isAdmin: false,
        } as any;
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log(`[AUTH] Authorize call for: ${credentials?.email}`);
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH] Missing email or password in credentials");
            throw new Error("Invalid credentials");
          }
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          if (!user) {
            console.error(`[AUTH] User not found: ${credentials.email}`);
            return null;
          }

          if (!user.password) {
            console.error(`[AUTH] User exists but has no password (OAuth user?): ${credentials.email}`);
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            console.error(`[AUTH] Incorrect password for: ${credentials.email}`);
            return null;
          }

          console.log(`[AUTH] Successful authorize for: ${user.email}`);
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name,
            isAdmin: user.isAdmin,
          };
        } catch (error: any) {
          console.error("[AUTH_AUTHORIZE_ERROR]", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(`[AUTH] signIn callback: provider=${account?.provider}, email=${user.email}`);
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
