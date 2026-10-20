import { NextResponse } from "next/server";
import { forgetSession } from "../../../../lib/server-auth";
export async function POST(req: Request) {
  forgetSession((req.headers.get("cookie") || "").match(/(?:^|;\s*)lm_access=([^;]+)/)?.[1]);
  const r = NextResponse.json({ ok: true });
  r.cookies.set("lm_access", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  r.cookies.set("lm_refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return r;
}
