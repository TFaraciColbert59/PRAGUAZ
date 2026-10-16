import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return new Response("Back-office désactivé : configurez ADMIN_TOKEN.", { status: 503 });
  }
  const formData = await request.formData().catch(() => null);
  const token = formData ? String(formData.get("token") ?? "") : "";
  if (!token || token !== adminToken) {
    return new Response("Token invalide.", { status: 401 });
  }
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set("pg-admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60,
  });
  return response;
}

export async function GET() {
  return new Response("Méthode non autorisée : utilisez le formulaire de connexion.", { status: 405 });
}
