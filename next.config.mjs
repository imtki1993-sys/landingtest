// En-têtes de sécurité appliqués à toutes les réponses.
const base = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      // Anti-clickjacking : le tableau de bord et les pages ne peuvent pas être affichés
      // dans une iframe d'un autre site (l'aperçu boutique, sur le même site, reste permis).
      { source: "/((?!connect/).*)", headers: [...base, { key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      // Script de commande embarqué chez les marchands : pas de restriction d'iframe.
      { source: "/connect/:path*", headers: base },
    ];
  },
};

export default nextConfig;
