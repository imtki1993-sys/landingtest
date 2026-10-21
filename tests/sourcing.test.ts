import { describe, it, expect, vi, afterEach } from "vitest";
import { syncChannel } from "../lib/sourcing-sync";
import { channelUsername, parseChannelPage, htmlText, fetchChannelPage } from "../lib/telegram-public";
import {
  extractPrice,
  extractMinQty,
  extractPhone,
  guessCategory,
  guessName,
  regexExtract,
  parseAiAnswer,
} from "../lib/sourcing-extract";

const PAGE = `<!DOCTYPE html><html><body>
<div class="tgme_channel_info"><div class="tgme_channel_info_header"><i class="tgme_page_photo_image bgcolor2" data-content="D"><img src="https://cdn4.telesco.pe/file/avatar.jpg"></i>
<div class="tgme_channel_info_header_title"><span dir="auto">Derb Omar Gros &amp; Détail</span></div></div>
<div class="tgme_channel_info_description">Grossiste <b>Casablanca</b><br/>Livraison partout</div></div>
<section class="tgme_channel_history js-message_history">
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message text_not_supported_wrap js-widget_message" data-post="derbomargros/120" data-view="x">
<div class="tgme_widget_message_bubble">
<div class="tgme_widget_message_grouped_wrap js-message_grouped_wrap"><div class="tgme_widget_message_grouped js-message_grouped"><div class="tgme_widget_message_grouped_layer js-message_grouped_layer">
<a class="tgme_widget_message_photo_wrap grouped_media_wrap blured js-message_photo" style="left:0px;top:0px;width:300px;height:300px;background-image:url('https://cdn4.telesco.pe/file/a1.jpg')" href="https://t.me/derbomargros/119?single"></a>
<a class="tgme_widget_message_photo_wrap grouped_media_wrap blured js-message_photo" style="left:302px;top:0px;width:300px;height:300px;background-image:url('https://cdn4.telesco.pe/file/a2.jpg')" href="https://t.me/derbomargros/120?single"></a>
</div></div></div>
<div class="tgme_widget_message_text js-message_text" dir="auto"><i class="emoji" style="background-image:url('//telegram.org/img/emoji/40/F09F94A5.png')"><b>🔥</b></i> سماعة بلوتوث لاسلكية<br/>الثمن ديال الجملة: 45 درهم<br/>ابتداء من 10 قطع<br/>واتساب: 06 61 23 45 67</div>
<div class="tgme_widget_message_footer compact js-message_footer"><div class="tgme_widget_message_info short js-message_info"><span class="tgme_widget_message_views">1.2K</span><span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/derbomargros/120"><time datetime="2026-10-20T10:15:00+00:00" class="time">10:15</time></a></span></div></div>
</div></div></div>
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message js-widget_message service_message" data-post="derbomargros/121"><div class="tgme_widget_message_bubble"><div class="tgme_widget_message_service_date">Channel photo updated</div></div></div></div>
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message js-widget_message" data-post="derbomargros/122">
<div class="tgme_widget_message_bubble"><a class="tgme_widget_message_video_player blured js-message_video_player" href="https://t.me/derbomargros/122"><i class="tgme_widget_message_video_thumb" style="background-image:url('https://cdn4.telesco.pe/file/v1.jpg')"></i></a>
<div class="tgme_widget_message_text js-message_text" dir="auto">Robe abaya satin – prix détail 120dh / gros 85 DH</div>
<div class="tgme_widget_message_footer"><span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="#"><time datetime="2026-10-21T08:00:00+00:00" class="time">08:00</time></a></span></div></div></div></div>
</section></body></html>`;

describe("aperçu public Telegram", () => {
  it("nom du canal depuis un lien", () => {
    expect(channelUsername("https://t.me/s/derbomargros")).toBe("derbomargros");
    expect(channelUsername("@derb_omar_2024")).toBe("derb_omar_2024");
    expect(channelUsername("t.me/joinchat/AAAA")).toBe(null);
    expect(channelUsername("ab")).toBe(null);
  });
  it("lit le canal, les albums, les vidéos et ignore les messages de service", () => {
    const { channel, posts } = parseChannelPage(PAGE, "derbomargros");
    expect(channel).toEqual({
      title: "Derb Omar Gros & Détail",
      photo: "https://cdn4.telesco.pe/file/avatar.jpg",
      description: "Grossiste Casablanca\nLivraison partout",
    });
    expect(posts.map((p) => p.postId)).toEqual([120, 122]);
    expect(posts[0].photos).toEqual(["https://cdn4.telesco.pe/file/a1.jpg", "https://cdn4.telesco.pe/file/a2.jpg"]);
    expect(posts[0].text).toContain("سماعة بلوتوث لاسلكية");
    expect(posts[0].date).toBe("2026-10-20T10:15:00+00:00");
    expect(posts[0].url).toBe("https://t.me/derbomargros/120");
    expect(posts[1]).toMatchObject({ hasVideo: true, photos: ["https://cdn4.telesco.pe/file/v1.jpg"] });
  });
  it("texte HTML : entités et retours à la ligne", () => {
    expect(htmlText("a&amp;b<br/>c &#1587; &#x41;")).toBe("a&b\nc س A");
  });
});

describe("fiche produit lue dans le message", () => {
  it("prix de gros, quantité, téléphone", () => {
    expect(extractPrice("الثمن ديال الجملة: 45 درهم")).toBe(45);
    expect(extractPrice("prix détail 120dh / gros 85 DH")).toBe(85);
    expect(extractPrice("التمن ٣٥ درهم")).toBe(35);
    expect(extractPrice("Prix: 60")).toBe(60);
    expect(extractPrice("Nouvelle collection")).toBe(null);
    expect(extractMinQty("ابتداء من 10 قطع")).toBe(10);
    expect(extractMinQty("minimum 12 pcs")).toBe(12);
    expect(extractPhone("واتساب: 06 61 23 45 67")).toBe("0661234567");
    expect(extractPhone("+212 7 00 11 22 33")).toBe("0700112233");
  });
  it("catégorie et nom", () => {
    expect(guessCategory("سماعة بلوتوث")).toBe("Électronique & gadgets");
    expect(guessCategory("Robe abaya satin")).toBe("Mode & accessoires");
    expect(guessName("🔥🔥\n✅ سماعة بلوتوث لاسلكية 45 درهم")).toBe("سماعة بلوتوث لاسلكية");
    expect(regexExtract("Bonjour à tous", false).is_product).toBe(false);
  });
  it("réponse IA : champs validés, catégorie inconnue ignorée", () => {
    const m = parseAiAnswer(
      'Voici : [{"id":"a","is_product":true,"name":"Écouteurs Bluetooth","category":"Électronique & gadgets","price":"45","min_qty":10},{"id":"b","category":"Inconnue","price":-3}]',
    );
    expect(m.get("a")).toMatchObject({ name: "Écouteurs Bluetooth", price: 45, min_qty: 10 });
    expect(m.get("b")).toMatchObject({ category: undefined, price: undefined });
  });
});

/** Faux client Supabase : enregistre les écritures, répond vide aux lectures. */
function fakeDb(knownIds: number[] = []) {
  const writes: { table: string; op: string; payload: any }[] = [];
  const builder = (table: string) => {
    let op = "select",
      payload: any = null;
    const q: any = {
      select: () => q,
      eq: () => q,
      in: () => q,
      upsert: (p: any) => ((op = "upsert"), (payload = p), q),
      update: (p: any) => ((op = "update"), (payload = p), q),
      then: (res: any) => {
        if (op !== "select") writes.push({ table, op, payload });
        const data = op === "select" ? knownIds.map((post_id) => ({ post_id })) : null;
        return Promise.resolve({ data, error: null }).then(res);
      },
    };
    return q;
  };
  return { s: { from: builder }, writes };
}

describe("synchronisation d'un canal", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("enregistre les nouveaux produits avec leur fiche, met à jour le canal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(PAGE, { status: 200 })),
    );
    const { s, writes } = fakeDb();
    const r = await syncChannel(s, { id: "c1", username: "derbomargros", last_post_id: null }, 1);
    expect(r).toEqual({ added: 2, seen: 2 });
    const up = writes.find((w) => w.op === "upsert")!;
    expect(up.table).toBe("sourcing_posts");
    expect(up.payload[0]).toMatchObject({
      post_id: 120,
      price: 45,
      min_qty: 10,
      phone: "0661234567",
      category: "Électronique & gadgets",
    });
    expect(up.payload[1]).toMatchObject({ post_id: 122, price: 85, has_video: true });
    const ch = writes.find((w) => w.table === "sourcing_channels")!;
    expect(ch.payload).toMatchObject({ title: "Derb Omar Gros & Détail", last_post_id: 122, last_error: null });
  });
  it("messages déjà connus : pas réinsérés, photos rafraîchies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(PAGE, { status: 200 })),
    );
    const { s, writes } = fakeDb([120, 122]);
    const r = await syncChannel(s, { id: "c1", username: "derbomargros", last_post_id: 122 }, 2);
    expect(r.added).toBe(0);
    expect(writes.filter((w) => w.op === "upsert")).toHaveLength(0);
    expect(writes.filter((w) => w.table === "sourcing_posts" && w.op === "update")).toHaveLength(2);
  });
  it("canal privé ou aperçu désactivé : erreur claire", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html><div class='tgme_page'>Join</div></html>", { status: 200 })),
    );
    await expect(fetchChannelPage("prive")).rejects.toThrow("aperçu public désactivé");
  });
});

describe("WhatsApp et signature du canal", () => {
  it("tous les numéros du message, liens wa.me compris, sans doublon", async () => {
    const { extractPhones, formatPhone } = await import("../lib/sourcing-extract");
    const t =
      "واتساب:\nhttps://wa.me/212660445670\nhttps://wa.me/212664267036\nhttps://wa.me/212660505949\n📞 الاتصال: 0660445670";
    expect(extractPhones(t)).toEqual(["212660445670", "212664267036", "212660505949"]);
    expect(extractPhones("Tel +212 6 12-34-56-78 ou 07 00 11 22 33")).toEqual(["212612345678", "212700112233"]);
    expect(formatPhone("212660445670")).toBe("06 60 44 56 70");
  });
  it("la signature répétée n'est pas le nom du produit", async () => {
    const { boilerplateLines, stripBoilerplate, guessName } = await import("../lib/sourcing-extract");
    const sig = "📦 TOP JEMLA\nأفضل السلع بالجملة بأثمنة تنافسية\nواتساب:\nhttps://wa.me/212660445670";
    const texts = ["حبل حديدي للكلاب", "خيمة للحيوانات قابلة للطي", "قنينة ماء 2 لتر", "لعبة مقود للأطفال"].map(
      (p) => sig + "\n" + p,
    );
    const lines = boilerplateLines(texts);
    expect(stripBoilerplate(texts[0], lines)).toBe("حبل حديدي للكلاب");
    expect(guessName(stripBoilerplate(texts[2], lines))).toBe("قنينة ماء 2 لتر");
    expect(boilerplateLines(texts.slice(0, 2)).size).toBe(0); // trop peu de messages pour décider
  });
  it("numéro de la description du canal (capture du vendeur)", async () => {
    const { extractPhones } = await import("../lib/sourcing-extract");
    const desc =
      "مرحبا بكم 😍\nبيع ملابس بالجملة بثمن المصنع الجودة الجيدة و الثمن المناسب\nواتساب 👇\nhttps://wa.me/212643837289\n\nالهاتف 👇\n\n0643837289\n\nرابط تيليكرام 👇\nhttps://t.me/bi3bjemla";
    expect(extractPhones(desc)).toEqual(["212643837289"]);
  });
});
