import { withAuth } from "next-auth/middleware";

// Edge gate for the admin area (defense-in-depth; the layout + each mutation
// also check). Only tokens with role 'admin' may pass; the login page itself
// is exempt so unauthenticated admins can reach it.
export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname === "/admin/login") return true;
      return token?.role === "admin";
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
