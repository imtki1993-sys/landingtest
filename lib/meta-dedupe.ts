// Une même personne qui renvoie le formulaire (double clic, réseau lent, nouvel essai) crée
// plusieurs commandes : on les garde toutes dans LandPro (marquées « doublon »), mais Meta ne
// doit compter qu'un seul achat. On cherche donc une commande récente du même numéro sur la
// même landing avant d'envoyer l'événement Purchase.
import type { SupabaseClient } from "@supabase/supabase-js";
import { toE164 } from "./order-risk";

/** Fenêtre pendant laquelle une nouvelle commande du même numéro est considérée comme un renvoi. */
export const META_REPEAT_WINDOW_MS = 30 * 60 * 1000;

export async function hasRecentOrderFromPhone(
  db: SupabaseClient,
  input: { workspaceId: string; landingPageId: string; phone: string; now?: number },
): Promise<boolean> {
  const phone = toE164(input.phone);
  if (!phone) return false;
  const since = new Date((input.now ?? Date.now()) - META_REPEAT_WINDOW_MS).toISOString();
  try {
    const { data: leads, error } = await db
      .from("leads")
      .select("id")
      .eq("workspace_id", input.workspaceId)
      .eq("phone_e164", phone)
      .gte("created_at", since)
      .limit(20);
    if (error || !leads?.length) return false;
    const { data: orders, error: e2 } = await db
      .from("orders")
      .select("id")
      .eq("landing_page_id", input.landingPageId)
      .in(
        "lead_id",
        leads.map((l: { id: string }) => l.id),
      )
      .gte("created_at", since)
      .limit(1);
    return !e2 && !!orders?.length;
  } catch {
    // en cas de doute on envoie l'achat (comportement d'avant)
    return false;
  }
}
