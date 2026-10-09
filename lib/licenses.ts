// Abonnements LandPro par clé d'activation : une formule unique, tout inclus,
// vendue pour 3, 6 ou 12 mois (paiement hors ligne, l'admin envoie une clé).
// Une clé = un usage, liée au compte qui l'active, stockée seulement sous forme d'empreinte.
import { createHmac, randomInt } from "crypto";

export const LICENSE_OFFERS = [
  { months: 3, price: 599, label: "3 mois" },
  { months: 6, price: 999, label: "6 mois" },
  { months: 12, price: 1699, label: "12 mois" },
] as const;
export type LicenseMonths = (typeof LICENSE_OFFERS)[number]["months"];
export const LICENSE_PLAN_CODE = "pro";
/** Formule unique « tout inclus » : limite de landings donnée à l'activation. */
export const LICENSE_LANDING_LIMIT = 1000;

export const offerFor = (months: number) => LICENSE_OFFERS.find((o) => o.months === months);

// Sans 0/O, 1/I/L : lisible au téléphone et sur WhatsApp
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Nouvelle clé au format LP-XXXX-XXXX-XXXX (≈ 59 bits d'aléa). */
export function generateLicenseCode(rand: (max: number) => number = randomInt): string {
  const chars = Array.from({ length: 12 }, () => ALPHABET[rand(ALPHABET.length)]).join("");
  return `LP-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`;
}

/** Clé saisie par le client → forme canonique, ou null si le format est faux. */
export function normalizeLicenseCode(input: unknown): string | null {
  let s = String(input || "")
    .toUpperCase()
    .replace(/[\s_-]/g, "");
  if (s.length === 14 && s.startsWith("LP")) s = s.slice(2);
  if (s.length !== 12 || [...s].some((c) => !ALPHABET.includes(c))) return null;
  return `LP-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

/** Empreinte stockée en base (la clé elle-même n'est jamais enregistrée). */
export function hashLicenseCode(code: string): string {
  const secret = process.env.LICENSE_KEY_SECRET || process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!secret) throw new Error("license_secret_not_configured");
  return createHmac("sha256", secret).update(code).digest("hex");
}

/** Les 4 derniers caractères, pour reconnaître une clé dans l'admin. */
export const licenseHint = (code: string) => "…" + code.slice(-4);

/** Ajoute des mois calendaires (31 janv. + 1 mois → 28/29 févr.). */
export function addMonths(d: Date, months: number): Date {
  const out = new Date(d.getTime());
  const day = out.getUTCDate();
  out.setUTCDate(1);
  out.setUTCMonth(out.getUTCMonth() + months);
  const last = new Date(Date.UTC(out.getUTCFullYear(), out.getUTCMonth() + 1, 0)).getUTCDate();
  out.setUTCDate(Math.min(day, last));
  return out;
}

/**
 * Nouvelle période après activation : un abonnement encore en cours est prolongé
 * depuis sa date de fin ; sinon la période démarre aujourd'hui.
 */
export function nextPeriod(
  current: { status?: string | null; current_period_start?: string | null; current_period_end?: string | null } | null,
  months: number,
  now = new Date(),
): { start: Date; end: Date } {
  const end = current?.current_period_end ? new Date(current.current_period_end) : null;
  const running = !!end && end > now && ["active", "trialing"].includes(String(current?.status));
  if (running) {
    const start = current?.current_period_start ? new Date(current.current_period_start) : now;
    return { start, end: addMonths(end!, months) };
  }
  return { start: now, end: addMonths(now, months) };
}

/** Jours restants (arrondis au-dessus), 0 si expiré, null si pas de date de fin. */
export function daysLeft(end: string | null | undefined, now = new Date()): number | null {
  if (!end) return null;
  return Math.max(0, Math.ceil((new Date(end).getTime() - now.getTime()) / 86_400_000));
}

export class LicenseError extends Error {
  constructor(
    public code: "LICENSE_FORMAT" | "LICENSE_INVALID" | "LICENSE_RATE" | "LICENSE_ACCOUNT",
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/**
 * Active une clé pour un workspace : la clé est consommée de façon atomique
 * (une seule activation possible), puis l'abonnement est prolongé et le compte approuvé.
 */
export async function activateLicense(
  s: any,
  input: { workspaceId: string; userId: string; code: unknown; ip?: string },
  now = new Date(),
) {
  const code = normalizeLicenseCode(input.code);
  if (!code) throw new LicenseError("LICENSE_FORMAT", "Format de clé invalide (LP-XXXX-XXXX-XXXX).", 400);
  // 10 essais par heure et par compte (et par adresse IP) : rend la recherche de clés impossible
  for (const key of ["license|ws|" + input.workspaceId, "license|ip|" + (input.ip || "unknown")]) {
    const { data: allowed, error } = await s.rpc("check_public_order_rate_limit", {
      p_key: key,
      p_limit: 10,
      p_window_seconds: 3600,
    });
    if (error) throw error;
    if (!allowed) throw new LicenseError("LICENSE_RATE", "Trop d'essais. Réessaie dans une heure.", 429);
  }
  const { data: used, error: ue } = await s
    .from("license_keys")
    .update({
      status: "used",
      used_by_workspace: input.workspaceId,
      used_by_user: input.userId,
      used_at: now.toISOString(),
    })
    .eq("code_hash", hashLicenseCode(code))
    .eq("status", "available")
    .select("id,duration_months,price_mad")
    .maybeSingle();
  if (ue) throw ue;
  if (!used) throw new LicenseError("LICENSE_INVALID", "Clé invalide, déjà utilisée ou révoquée.", 400);

  try {
    const { data: current, error: ce } = await s
      .from("workspace_subscriptions")
      .select("status,current_period_start,current_period_end,landing_limit")
      .eq("workspace_id", input.workspaceId)
      .maybeSingle();
    if (ce) throw ce;
    const period = nextPeriod(current, Number(used.duration_months), now);
    const { error: se } = await s.from("workspace_subscriptions").upsert(
      {
        workspace_id: input.workspaceId,
        plan_code: LICENSE_PLAN_CODE,
        status: "active",
        landing_limit: Math.max(Number(current?.landing_limit || 0), LICENSE_LANDING_LIMIT),
        current_period_start: period.start.toISOString(),
        current_period_end: period.end.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: "workspace_id" },
    );
    if (se) throw se;
    // Un compte en attente devient actif ; un compte refusé ou suspendu par l'admin le reste
    const { error: ae } = await s
      .from("users")
      .update({ approval_status: "approved" })
      .eq("id", input.userId)
      .eq("approval_status", "pending");
    if (ae) throw ae;
    return { months: Number(used.duration_months), periodEnd: period.end.toISOString() };
  } catch (e) {
    // l'abonnement n'a pas pu être prolongé : la clé redevient utilisable
    await s
      .from("license_keys")
      .update({ status: "available", used_by_workspace: null, used_by_user: null, used_at: null })
      .eq("id", used.id);
    throw e;
  }
}

/**
 * Erreurs de mise en place connues → message clair pour l'admin (jamais de secret ni de détail SQL).
 * Renvoie null pour toute autre erreur.
 */
export function licenseSetupMessage(error: unknown): string | null {
  const e = error as any;
  const text = `${e?.code || ""} ${e?.message || ""} ${e?.details || ""} ${e?.hint || ""}`;
  if (/license_secret_not_configured/.test(text))
    return "Configuration manquante : ajoute la variable LICENSE_KEY_SECRET dans Vercel (Settings > Environment Variables), puis redéploie.";
  if (/42P01|PGRST205|license_keys/.test(text) && /exist|schema cache|find the table|relation/i.test(text))
    return "La table des clés n'existe pas encore : exécute le fichier supabase/migrations/20261009120000_license_keys.sql dans Supabase (SQL Editor), puis réessaie.";
  if (/42703|PGRST204|current_period_(start|end)/.test(text) && /column|schema cache/i.test(text))
    return "Colonne manquante dans workspace_subscriptions : exécute le fichier de migration des clés dans Supabase (SQL Editor), puis réessaie.";
  if (/42501|permission denied/i.test(text))
    return "Accès refusé à la table des clés : vérifie que SUPABASE_SECRET_KEY est bien la clé « service_role » dans Vercel.";
  return null;
}
