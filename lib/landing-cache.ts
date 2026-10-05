import { revalidateTag } from "next/cache";

// Les données des landing pages publiques sont mises en cache (voir lib/public-landing.ts).
// Toute route qui modifie une page, un produit ou les réglages du workspace vide ce cache
// dès que la modification réussit : une page publiée s'affiche à jour immédiatement.
export const PUBLIC_LANDINGS_TAG = "public-landings";

export function invalidatePublicLandings() {
  try {
    revalidateTag(PUBLIC_LANDINGS_TAG);
  } catch (e) {
    console.error("[landing-cache] invalidation impossible", e);
  }
}

/** Enrobe un handler de route : si la réponse est un succès (2xx), le cache public est vidé. */
export function withLandingInvalidation<H extends (...args: any[]) => Promise<Response>>(handler: H): H {
  return (async (...args: any[]) => {
    const res = await handler(...args);
    if (res.ok) invalidatePublicLandings();
    return res;
  }) as H;
}
