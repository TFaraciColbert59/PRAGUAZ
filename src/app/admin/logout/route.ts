import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set("pg-admin", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
