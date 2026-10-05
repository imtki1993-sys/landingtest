import { publicMessage } from "../../../../../lib/public-error";
import { reportError } from "../../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../../../lib/server-auth";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params,
      { s, workspaceId } = await authContext(req);
    const { data, error } = await s
      .from("order_status_history")
      .select("id,source,status,note,created_at")
      .eq("workspace_id", workspaceId)
      .eq("order_id", id)
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ history: data || [] });
  } catch (e: any) {
    reportError(e, "api/orders/[id]/history");
    return NextResponse.json({ error: publicMessage(e), history: [] }, { status: 500 });
  }
}
