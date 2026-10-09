// Liste noire de numéros par compte : une nouvelle commande d'un numéro bloqué
// est enregistrée mais passe aussitôt en « Annulée » (elle n'est ni confirmée ni expédiée).
// Sans la table phone_blacklist (migration non exécutée), tout est simplement ignoré.

/** Numéros bloqués parmi une liste (Map numéro → raison). */
export async function blacklistedPhones(
  s: any,
  workspaceId: string,
  phones: string[],
): Promise<Map<string, { reason: string | null }>> {
  const out = new Map<string, { reason: string | null }>();
  const list = [...new Set(phones.filter(Boolean))];
  if (!list.length) return out;
  const { data, error } = await s
    .from("phone_blacklist")
    .select("phone_e164,reason")
    .eq("workspace_id", workspaceId)
    .in("phone_e164", list);
  if (error) return out; // table absente : pas de liste noire
  for (const r of data || []) out.set(r.phone_e164, { reason: r.reason || null });
  return out;
}

/** Après une commande publique : annule la commande si le numéro est en liste noire. */
export async function cancelIfBlacklisted(s: any, orderId: string): Promise<boolean> {
  try {
    const { data: order } = await s.from("orders").select("workspace_id,lead_id").eq("id", orderId).maybeSingle();
    if (!order?.lead_id) return false;
    const { data: lead } = await s
      .from("leads")
      .select("id,phone_e164,notes")
      .eq("id", order.lead_id)
      .eq("workspace_id", order.workspace_id)
      .maybeSingle();
    if (!lead?.phone_e164) return false;
    const hit = (await blacklistedPhones(s, order.workspace_id, [lead.phone_e164])).get(lead.phone_e164);
    if (!hit) return false;
    await s
      .from("leads")
      .update({
        status: "CANCELLED",
        notes: [lead.notes, "Annulée automatiquement : numéro en liste noire" + (hit.reason ? ` (${hit.reason})` : "")]
          .filter(Boolean)
          .join("\n"),
      })
      .eq("id", lead.id)
      .eq("workspace_id", order.workspace_id);
    return true;
  } catch {
    return false;
  }
}
