import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ALLOWED_PREFIXES = ["/api/public", "/api/health", "/api/auth"];
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isBypassed(pathname: string) {
  if (!pathname.startsWith("/api/")) return true;
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isBypassed(pathname) || SAFE_METHODS.has(req.method)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store",
          Vary: "Cookie",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
