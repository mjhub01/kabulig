import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an auth page
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")

  // Get the session token using NextAuth's getToken
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isAuth = !!token

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect unauthenticated users to login for protected routes
  const isAdminRoute = pathname.startsWith("/admin")
  const isFarmerRoute = pathname.startsWith("/farmer")
  const isCustomerRoute = pathname.startsWith("/customer")

  if ((isAdminRoute || isFarmerRoute || isCustomerRoute) && !isAuth) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/farmer/:path*",
    "/customer/:path*",
    "/login",
    "/register",
  ],
}
