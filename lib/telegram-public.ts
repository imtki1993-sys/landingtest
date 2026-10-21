// Lecture de l'aperçu web public d'un canal Telegram (https://t.me/s/<canal>) : pas de compte,
// pas de bot. Ne marche que pour les canaux publics dont l'aperçu n'est pas désactivé.

export interface TgChannelInfo {
  title: string | null;
  photo: string | null;
  description: string | null;
}
export interface TgPost {
  postId: number;
  url: string;
  date: string | null;
  text: string;
  photos: string[];
  hasVideo: boolean;
}

/** « @nom », « t.me/nom », « https://t.me/s/nom » → « nom » (ou null si invalide). */
export function channelUsername(input: string): string | null {
  const s = String(input || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(t|telegram)\.me\//i, "")
    .replace(/^s\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  // liens d'invitation (joinchat, +code) : groupe privé, pas d'aperçu public
  if (/^(joinchat|addstickers|share|proxy|login)$/i.test(s)) return null;
  return /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(s) ? s : null;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };
export function htmlText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const bgUrls = (html: string, cls: string) => {
  const out: string[] = [];
  const re = new RegExp(`class="[^"]*${cls}[^"]*"[^>]*?style="[^"]*background-image:url\\('([^']+)'\\)`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1].replace(/&amp;/g, "&"));
  return out;
};

/** Contenu d'un <div class="…cls…"> (sans div imbriqué, comme les textes de message). */
function divContent(html: string, cls: string): string | null {
  const i = html.search(new RegExp(`<div class="[^"]*${cls}[^"]*"[^>]*>`));
  if (i < 0) return null;
  const start = html.indexOf(">", i) + 1;
  // compte les <div> imbriqués jusqu'à la fermeture du bon
  let depth = 1,
    pos = start;
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = start;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index);
    pos = re.lastIndex;
  }
  return html.slice(start, pos);
}

export function parseChannelPage(html: string, username: string): { channel: TgChannelInfo; posts: TgPost[] } {
  const titleHtml = divContent(html, "tgme_channel_info_header_title");
  const descHtml = divContent(html, "tgme_channel_info_description");
  const photo = html.match(/class="tgme_page_photo_image[^"]*"[^>]*>\s*<img src="([^"]+)"/)?.[1] || null;
  const channel: TgChannelInfo = {
    title: titleHtml ? htmlText(titleHtml) || null : null,
    photo,
    description: descHtml ? htmlText(descHtml) || null : null,
  };
  const posts: TgPost[] = [];
  const parts = html.split(/<div class="tgme_widget_message_wrap/).slice(1);
  for (const part of parts) {
    const ref = part.match(/data-post="([^"/]+)\/(\d+)"/);
    if (!ref) continue;
    const postId = Number(ref[2]);
    const textHtml = divContent(part, "tgme_widget_message_text");
    const photos = [
      ...bgUrls(part, "tgme_widget_message_photo_wrap"),
      ...bgUrls(part, "tgme_widget_message_video_thumb"),
    ];
    const hasVideo = /tgme_widget_message_video_player|tgme_widget_message_video_thumb/.test(part);
    const date = part.match(/class="tgme_widget_message_date"[^>]*>\s*<time datetime="([^"]+)"/)?.[1] || null;
    const text = textHtml ? htmlText(textHtml) : "";
    if (!text && !photos.length) continue; // message de service (épinglé, nouveau titre…)
    posts.push({
      postId,
      url: `https://t.me/${ref[1] || username}/${postId}`,
      date,
      text,
      photos: [...new Set(photos)].slice(0, 10),
      hasVideo,
    });
  }
  return { channel, posts };
}

/** Une page de l'aperçu public (les ~20 derniers messages, ou ceux avant `before`). */
export async function fetchChannelPage(username: string, before?: number) {
  const url = `https://t.me/s/${encodeURIComponent(username)}${before ? `?before=${before}` : ""}`;
  const r = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "accept-language": "fr,ar;q=0.8,en;q=0.6",
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Telegram a répondu ${r.status}`);
  const html = await r.text();
  // canal privé, inexistant ou aperçu désactivé : t.me renvoie la page d'invitation, sans messages
  if (!/tgme_channel_info|tgme_widget_message_wrap/.test(html))
    throw new Error("Canal introuvable ou aperçu public désactivé");
  return parseChannelPage(html, username);
}
