import { after } from "next/server";

// Suivi des erreurs serveur.
// - Toujours : une ligne JSON « [monitoring] » dans les logs Vercel (filtrable).
// - Optionnel : alerte instantanée si ERROR_WEBHOOK_URL est défini (Slack, Discord,
//   Google Chat, Make…). Une même erreur n'est envoyée qu'une fois par minute.
// Les refus normaux (non connecté, quota, limite anti-spam) ne sont pas des erreurs.

const EXPECTED =
  /Non autorisé|approbation|Workspace introuvable|Profil introuvable|Trop de tentatives|order_limit_reached|subscription_inactive|Accès administrateur requis/i;
const lastSent = new Map<string, number>();

export function reportError(error: unknown, context: string, extra?: Record<string, unknown>) {
  try {
    const e = error as any;
    const message = String(e?.message ?? e ?? "Erreur inconnue").slice(0, 500);
    if (EXPECTED.test(message)) return;
    const payload = {
      level: "error",
      context,
      message,
      code: e?.code,
      stack: String(e?.stack || "")
        .split("\n")
        .slice(0, 6)
        .join("\n"),
      env: process.env.VERCEL_ENV || process.env.NODE_ENV,
      at: new Date().toISOString(),
      ...extra,
    };
    console.error("[monitoring]", JSON.stringify(payload));

    const hook = process.env.ERROR_WEBHOOK_URL;
    if (!hook) return;
    const key = context + "|" + message;
    if (Date.now() - (lastSent.get(key) || 0) < 60_000) return;
    lastSent.set(key, Date.now());
    const text = `🚨 LandPro (${payload.env}) — ${context}\n${message}`;
    const send = () =>
      fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, content: text }),
      })
        .then(() => undefined)
        .catch(() => undefined);
    try {
      after(send);
    } catch {
      void send();
    }
  } catch {
    /* le suivi ne doit jamais casser la requête */
  }
}
