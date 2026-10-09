// Équipe de confirmation (propriétaire uniquement) : liste + statistiques, création d'agent,
// activation / désactivation, suppression, répartition automatique des nouvelles commandes.
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
import { AGENT_ROLE } from "../../../lib/team";
import { isMissingColumn } from "../../../lib/db-errors";

const fail = (e: any, where: string) => {
  if (isMissingColumn(e))
    return NextResponse.json(
      {
        error:
          "L’équipe n’est pas encore installée : exécute le fichier supabase/migrations/20261009180000_team.sql dans Supabase (SQL Editor).",
      },
      { status: 503 },
    );
  reportError(e, where);
  return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
};
const DONE = ["CONFIRMED", "SHIPPED", "DELIVERED", "RETURNED"];

async function agentsOf(s: any, workspaceId: string) {
  const { data: members, error } = await s
    .from("workspace_members")
    .select("user_id,role")
    .eq("workspace_id", workspaceId)
    .eq("role", AGENT_ROLE);
  if (error) throw error;
  const ids = (members || []).map((m: any) => m.user_id);
  if (!ids.length) return [];
  const { data: users, error: ue } = await s
    .from("users")
    .select("id,email,full_name,approval_status,created_at,last_seen_at")
    .in("id", ids);
  if (ue) throw ue;
  return users || [];
}

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const agents = await agentsOf(s, workspaceId);
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const ids = agents.map((a: any) => a.id);
    const { data: orders, error } = ids.length
      ? await s
          .from("orders")
          .select("assigned_to,lead_id,shipment_status")
          .eq("workspace_id", workspaceId)
          .in("assigned_to", ids)
          .gte("created_at", since)
      : { data: [], error: null };
    if (error) throw error;
    const leadIds = [...new Set((orders || []).map((o: any) => o.lead_id).filter(Boolean))];
    const { data: leads } = leadIds.length
      ? await s.from("leads").select("id,status,call_attempts").in("id", leadIds)
      : { data: [] as any[] };
    const lead = new Map((leads || []).map((l: any) => [l.id, l]));
    const stats = (id: string) => {
      const mine = (orders || []).filter((o: any) => o.assigned_to === id);
      const st = (o: any) => String((lead.get(o.lead_id) as any)?.status || "NEW");
      const confirmed = mine.filter((o: any) => DONE.includes(st(o))).length,
        cancelled = mine.filter((o: any) => st(o) === "CANCELLED").length,
        pending = mine.filter((o: any) => ["NEW", "CONTACTED", "NO_ANSWER", "CALL_BACK"].includes(st(o))).length,
        delivered = mine.filter((o: any) => o.shipment_status === "DELIVERED").length,
        calls = mine.reduce((n: number, o: any) => n + Number((lead.get(o.lead_id) as any)?.call_attempts || 0), 0),
        treated = confirmed + cancelled;
      return {
        assigned: mine.length,
        pending,
        confirmed,
        cancelled,
        delivered,
        calls,
        confirmation_rate: treated ? Math.round((confirmed / treated) * 100) : null,
      };
    };
    const { data: ws } = await s.from("workspaces").select("settings").eq("id", workspaceId).maybeSingle();
    const { count: unassigned } = await s
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("assigned_to", null)
      .gte("created_at", since);
    return NextResponse.json({
      agents: agents.map((a: any) => ({ ...a, active: a.approval_status === "approved", stats: stats(a.id) })),
      auto_assign: !!ws?.settings?.auto_assign,
      unassigned_30d: unassigned || 0,
    });
  } catch (e: any) {
    return fail(e, "api/team");
  }
}

export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "")
        .trim()
        .toLowerCase(),
      name = String(b.full_name || "")
        .trim()
        .slice(0, 120),
      password = String(b.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    if (name.length < 2) return NextResponse.json({ error: "Nom de l’agent requis" }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Mot de passe : 8 caractères minimum" }, { status: 400 });
    const { data: created, error: ce } = await s.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: AGENT_ROLE },
    });
    if (ce || !created?.user) {
      const msg = String(ce?.message || "");
      return NextResponse.json(
        {
          error: /already|registered|exists/i.test(msg)
            ? "Cet email a déjà un compte LandPro. Utilise un autre email pour l’agent."
            : "Création du compte impossible",
        },
        { status: 400 },
      );
    }
    const userId = created.user.id;
    try {
      // Profil approuvé (le compte de l'agent n'a pas besoin de clé d'activation)
      const { data: existing } = await s.from("users").select("id").eq("id", userId).maybeSingle();
      if (existing) await s.from("users").update({ full_name: name, approval_status: "approved" }).eq("id", userId);
      else await s.from("users").insert({ id: userId, email, full_name: name, approval_status: "approved" });
      // Rattachement au workspace du propriétaire uniquement
      await s.from("workspace_members").delete().eq("user_id", userId).neq("workspace_id", workspaceId);
      const { error: me } = await s
        .from("workspace_members")
        .upsert(
          { workspace_id: workspaceId, user_id: userId, role: AGENT_ROLE },
          { onConflict: "workspace_id,user_id" },
        );
      if (me) throw me;
    } catch (e) {
      await s.auth.admin.deleteUser(userId).catch(() => null);
      throw e;
    }
    return NextResponse.json({ ok: true, agent: { id: userId, email, full_name: name } }, { status: 201 });
  } catch (e: any) {
    return fail(e, "api/team");
  }
}

export async function PATCH(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    if (typeof b.auto_assign === "boolean") {
      const { data: ws } = await s.from("workspaces").select("settings").eq("id", workspaceId).maybeSingle();
      const { error } = await s
        .from("workspaces")
        .update({ settings: { ...(ws?.settings || {}), auto_assign: b.auto_assign } })
        .eq("id", workspaceId);
      if (error) throw error;
      return NextResponse.json({ ok: true, auto_assign: b.auto_assign });
    }
    const agentId = String(b.user_id || "");
    const agents = await agentsOf(s, workspaceId);
    if (!agents.some((a: any) => a.id === agentId))
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    const { error } = await s
      .from("users")
      .update({ approval_status: b.active ? "approved" : "suspended" })
      .eq("id", agentId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return fail(e, "api/team");
  }
}

export async function DELETE(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const agentId = new URL(req.url).searchParams.get("user_id") || "";
    const agents = await agentsOf(s, workspaceId);
    if (!agents.some((a: any) => a.id === agentId))
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    // Ses commandes redeviennent non attribuées, puis son compte est supprimé
    await s
      .from("orders")
      .update({ assigned_to: null, assigned_at: null })
      .eq("workspace_id", workspaceId)
      .eq("assigned_to", agentId);
    await s.from("workspace_members").delete().eq("workspace_id", workspaceId).eq("user_id", agentId);
    await s.auth.admin.deleteUser(agentId).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return fail(e, "api/team");
  }
}
