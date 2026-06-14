import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedPath =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/tasks") ||
        nextUrl.pathname.startsWith("/pipeline") ||
        nextUrl.pathname.startsWith("/habits") ||
        nextUrl.pathname.startsWith("/review") ||
        nextUrl.pathname.startsWith("/settings");

      if (isProtectedPath) {
        if (isLoggedIn) return true;
        return false; // Redirect to /login
      } else if (nextUrl.pathname === "/login") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
