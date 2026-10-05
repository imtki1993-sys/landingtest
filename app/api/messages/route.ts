import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const { data, error } = await s
      .from("store_contact_messages")
      .select("id,name,email,phone,subject,message,status,created_at,store:stores(name,slug)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ messages: data || [] });
  } catch (e: any) {
    reportError(e, "api/messages");
    return NextResponse.json({ error: publicMessage(e), messages: [] }, { status: 500 });
  }
}
export async function PATCH(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req),
      b = await req.json();
    const status = ["NEW", "READ", "ARCHIVED"].includes(b.status) ? b.status : "READ";
    const { error } = await s
      .from("store_contact_messages")
      .update({ status })
      .eq("workspace_id", workspaceId)
      .eq("id", b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    reportError(e, "api/messages");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
