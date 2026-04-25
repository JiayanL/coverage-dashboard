import { NextResponse, type NextRequest } from "next/server"

import { AUTH_COOKIE_NAME, deriveAuthToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD
  if (!password) return NextResponse.json({ authenticated: false })
  const expected = await deriveAuthToken(password)
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)
  return NextResponse.json({ authenticated: cookie?.value === expected })
}

export async function POST(request: NextRequest) {
  const expected = process.env.DASHBOARD_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { success: false, error: "DASHBOARD_PASSWORD not configured" },
      { status: 500 },
    )
  }

  let body: { password?: unknown }
  try {
    body = (await request.json()) as { password?: unknown }
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  if (typeof body.password !== "string" || body.password !== expected) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const token = await deriveAuthToken(expected)
  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    httpOnly: true,
  })
  return response
}
