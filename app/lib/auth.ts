import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@lib/prisma";
import bcrypt from "bcryptjs";

// Validate NEXTAUTH_URL at startup — the most common OAuth misconfiguration
if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('http')) {
  console.error(
    `\n❌ NEXTAUTH_URL must include the protocol (http:// or https://)!\n` +
    `   Current value: "${process.env.NEXTAUTH_URL}"\n` +
    `   For local dev:  NEXTAUTH_URL=http://localhost:3000\n` +
    `   For production: NEXTAUTH_URL=https://hemasarees.vercel.app\n`
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          isAdmin: false,
        };
      },
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
            return null;
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
    error: "/login",
  },
  debug: process.env.NEXTAUTH_DEBUG === 'true',
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error(`[NEXTAUTH_ERROR] ${code}`, metadata);
    },
    warn(code) {
      console.warn(`[NEXTAUTH_WARN] ${code}`);
    },
    debug(code, metadata) {
      // Sanitize: never log client secrets or tokens to console
      const safeMetadata = metadata ? { ...metadata } : {};
      if (safeMetadata && typeof safeMetadata === 'object') {
        const safe = safeMetadata as Record<string, any>;
        if (safe.provider) {
          safe.provider = {
            ...safe.provider,
            clientSecret: '[REDACTED]',
          };
        }
      }
      console.log(`[NEXTAUTH_DEBUG] ${code}`, safeMetadata);
    },
  },
};


