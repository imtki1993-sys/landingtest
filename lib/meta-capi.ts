import { createHash } from "crypto";
import { adminDb } from "./server-auth";
import { resolvePublishedMetaPixel } from "./meta-pixel";
import { decryptIntegrationSecret } from "./integration-secrets";
import { cleanFbId, metaCurrency, metaValue, normalizeCity, normalizeMaPhone, purchaseEventId } from "./meta-events";

const hash = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export interface MetaPurchaseInput {
  workspaceId: string;
  landingPageId: string;
  orderId: string;
  value: number;
  currency: string;
  quantity?: number;
  contentName?: string;
  phone: string;
  name: string;
  city?: string;
  /** URL exacte de la page où la commande a été passée */
  eventSourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
  /** cookies Meta du navigateur (_fbp, _fbc) */
  fbp?: string;
  fbc?: string;
  /** identifiant visiteur LandPro (haché avant envoi) */
  externalId?: string;
}

/** Corps de l'événement Purchase envoyé à l'API Conversions (exporté pour les tests). */
export function buildPurchaseEvent(input: MetaPurchaseInput, now = Date.now()) {
  const names = input.name.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const phone = normalizeMaPhone(input.phone);
  const city = normalizeCity(input.city);
  const user: Record<string, unknown> = { country: [hash("ma")] };
  if (phone) user.ph = [hash(phone)];
  if (names[0]) user.fn = [hash(names[0])];
  if (names.length > 1) user.ln = [hash(names.slice(1).join(" "))];
  if (city) user.ct = [hash(city)];
  if (input.externalId) user.external_id = [hash(input.externalId)];
  if (input.clientIp) user.client_ip_address = input.clientIp;
  if (input.userAgent) user.client_user_agent = input.userAgent;
  const fbp = cleanFbId(input.fbp),
    fbc = cleanFbId(input.fbc);
  if (fbp) user.fbp = fbp;
  if (fbc) user.fbc = fbc;
  const quantity = Math.max(1, Number(input.quantity || 1));
  return {
    event_name: "Purchase",
    event_time: Math.floor(now / 1000),
    event_id: purchaseEventId(input.orderId),
    action_source: "website",
    event_source_url: input.eventSourceUrl,
    user_data: user,
    custom_data: {
      currency: metaCurrency(input.currency),
      value: metaValue(input.value),
      order_id: input.orderId,
      content_type: "product",
      content_ids: [input.landingPageId],
      content_name: input.contentName || undefined,
      num_items: quantity,
      contents: [{ id: input.landingPageId, quantity }],
    },
  };
}

export async function sendMetaPurchase(input: MetaPurchaseInput) {
  try {
    const s = adminDb();
    const [{ data: secret, error: secretError }, pixelId] = await Promise.all([
      s
        .from("workspace_integrations")
        .select("meta_capi_token_enc")
        .eq("workspace_id", input.workspaceId)
        .maybeSingle(),
      resolvePublishedMetaPixel(input.workspaceId, input.landingPageId),
    ]);
    if (secretError) return;
    const token = decryptIntegrationSecret(secret?.meta_capi_token_enc);
    if (!token || !pixelId) return;
    const version = process.env.META_GRAPH_VERSION || "v24.0";
    const body: Record<string, unknown> = { access_token: token, data: [buildPurchaseEvent(input)] };
    // Code de test du Gestionnaire d'événements (facultatif) : META_TEST_EVENT_CODE
    if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
    const res = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(pixelId)}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("Meta CAPI Purchase failed", res.status, (await res.text()).slice(0, 500));
  } catch (e) {
    console.error("Meta CAPI Purchase error", e);
  }
}
