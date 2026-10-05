import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
import { encryptIntegrationSecret } from "../../../lib/integration-secrets";
export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const { data } = await s
      .from("workspace_integrations")
      .select("supabase_url,vercel_token_enc,supabase_anon_key_enc,openai_api_key_enc,meta_capi_token_enc,updated_at")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    return NextResponse.json({
      integration: {
        supabase_url: data?.supabase_url || "",
        vercel_token: !!data?.vercel_token_enc,
        supabase_anon_key: !!data?.supabase_anon_key_enc,
        meta_model_api_key: !!data?.openai_api_key_enc,
        meta_capi_token: !!data?.meta_capi_token_enc,
        updated_at: data?.updated_at || null,
      },
    });
  } catch (e: any) {
    reportError(e, "api/integrations");
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export async function PATCH(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req),
      b = await req.json();
    const { data: old } = await s
      .from("workspace_integrations")
      .select("vercel_token_enc,supabase_url,supabase_anon_key_enc,openai_api_key_enc,meta_capi_token_enc")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    const enc = (v: any, prev: any) =>
      String(v || "").trim() ? encryptIntegrationSecret(String(v).trim()) : prev || null;
    const row = {
      workspace_id: workspaceId,
      vercel_token_enc: enc(b.vercel_token, old?.vercel_token_enc),
      supabase_url: String(b.supabase_url || old?.supabase_url || "") || null,
      supabase_anon_key_enc: enc(b.supabase_anon_key, old?.supabase_anon_key_enc),
      openai_api_key_enc: enc(b.meta_model_api_key, old?.openai_api_key_enc),
      meta_capi_token_enc: enc(b.meta_capi_token, old?.meta_capi_token_enc),
      updated_at: new Date().toISOString(),
    };
    const { error } = await s.from("workspace_integrations").upsert(row, { onConflict: "workspace_id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    reportError(e, "api/integrations");
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
