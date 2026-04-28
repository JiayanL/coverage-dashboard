import { NextResponse, type NextRequest } from "next/server"

import { AUTH_COOKIE_NAME, deriveAuthToken } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow programmatic API endpoints through — they handle their own auth.
  if (
    pathname.startsWith("/api/ingest/") ||
    pathname.startsWith("/api/triage/")
  ) {
    return NextResponse.next()
  }

  const password = process.env.DASHBOARD_PASSWORD
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)
  const expected = password ? await deriveAuthToken(password) : null
  const isAuthed = !!expected && cookie?.value === expected

  if (isAuthed) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  if (pathname === "/login") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: [
    // Match everything except static assets and the auth route handler itself.
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)",
  ],
}
