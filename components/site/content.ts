// Textes du site de présentation (direction « Majorelle »), en français et en darija.
// Aucun chiffre ni avis inventé : uniquement ce que LandPro fait réellement.

export type SiteLang = "fr" | "ar";

export const SITE = {
  fr: {
    meta: {
      title: "LandPro — Vends, confirme et livre en paiement à la livraison",
      description:
        "Landing pages COD, commandes, équipe de confirmation et livraison Ozon Express réunies dans un seul outil pour les vendeurs au Maroc. Dès 599 DH pour 3 mois.",
    },
    nav: { templates: "Templates", trajet: "Comment ça marche", equipe: "Équipe", tarifs: "Tarifs" },
    login: "Se connecter",
    activate: "Activer LandPro",
    otherLang: { label: "العربية", href: "/ar", lang: "ar" },
    hero: {
      title: ["Vends.", "Confirme.", "Livre."],
      text: "LandPro réunit tout le travail du vendeur en paiement à la livraison : ta landing, tes commandes, ton équipe d'appel et l'envoi chez Ozon Express.",
      cta: "Activer LandPro dès 599 DH",
      secondary: "Suivre une commande de bout en bout",
      slip: {
        title: "Bon de commande",
        ref: "LP-1042 du 16/10",
        lines: ["Abaya Élégance, taille M", "Salma E., Rabat"],
        total: "459 DH à la livraison",
        stamp: "CONFIRMÉE",
      },
      phoneA: "Landing LandPro « Runner Velocity » sur téléphone",
      phoneB: "Landing LandPro en arabe pour une abaya",
    },
    templates: {
      title: "149 landings prêtes à vendre, en arabe et en français.",
      text: "Chaque template arrive avec son formulaire de commande, ses offres 1, 2 ou 3 pièces et des textes écrits par l'IA pour ton produit.",
      link: "Voir les 149 templates",
      items: [
        ["tpl-montre-orbite-360", "Montre Orbite"],
        ["tpl-serum-avant-apres", "Sérum, avant et après"],
        ["tpl-hoodie-graffiti", "Hoodie Graffiti"],
        ["tpl-parfum-aube", "Parfum Aube"],
        ["tpl-support-flash-stock", "Support, prix cassé"],
        ["tpl-ecouteurs-aurora", "Écouteurs Aurora"],
      ],
    },
    trajet: {
      title: "Le trajet d'une commande, du clic au cash.",
      text: "Suis la commande LP-1042 : à chaque étape, LandPro fait le tri, l'appel et l'envoi avec toi.",
      steps: [
        ["Reçue", "Salma commande depuis ta landing en 20 secondes."],
        ["Vérifiée", "Même numéro il y a 2 heures : LandPro la marque « doublon »."],
        ["Confirmée", "Nadia, ton agente, l'appelle et confirme sur WhatsApp."],
        ["Expédiée", "Un clic, et le colis est créé chez Ozon Express."],
        ["Livrée", "Le statut se met à jour seul. Tu vois ton chiffre livré."],
      ],
      shot: "Page Commandes de LandPro avec la fiabilité de chaque client",
    },
    equipe: {
      title: "Ton équipe d'appel, sans le groupe WhatsApp.",
      p1: "Tu crées un compte par agent. Chacun voit seulement ses commandes et ne peut que changer leur statut d'appel. Toi, tu vois qui confirme le mieux.",
      p2: "Les nouvelles commandes se répartissent toutes seules vers l'agent le moins chargé. Chaque appel est compté, chaque rappel a son heure.",
      shot: "Page Équipe de LandPro avec la performance de chaque agent",
    },
    tarifs: {
      title: "Tout est inclus. Tu choisis la durée.",
      text: "Tu paies par virement ou CashPlus, tu reçois ta clé d'activation sur WhatsApp, ton compte s'ouvre aussitôt. Aucune commission sur tes ventes.",
      currency: "DH",
      plans: [
        { months: 3, price: "599", label: "3 mois", perMonth: "200 DH par mois", cta: "Prendre 3 mois" },
        { months: 6, price: "999", label: "6 mois", perMonth: "167 DH par mois", cta: "Prendre 6 mois" },
        {
          months: 12,
          price: "1 699",
          label: "12 mois, le meilleur prix",
          perMonth: "142 DH par mois",
          cta: "Prendre 12 mois",
        },
      ],
      included:
        "Chaque formule comprend les 149 landings et 50 boutiques, les commandes, le filtre des fausses commandes, l'équipe de confirmation, Ozon Express, le Pixel Meta et ton domaine.",
      whatsapp: (months: number) => `Bonjour, je veux activer LandPro pour ${months} mois.`,
    },
    faq: {
      title: "Ce qu'on nous demande avant de commencer",
      items: [
        [
          "Comment j'active mon compte ?",
          "Après ton paiement, tu reçois une clé LP-XXXX-XXXX-XXXX sur WhatsApp. Tu la saisis à l'inscription et ton compte est actif tout de suite.",
        ],
        ["Est-ce que LandPro prend une commission ?", "Non. Tu paies ta durée d'abonnement, et c'est tout."],
        ["Mes agents voient-ils mes chiffres ?", "Non. Un agent voit seulement les commandes que tu lui donnes."],
        [
          "Quels transporteurs sont branchés ?",
          "Ozon Express est branché : création du colis en un clic et suivi automatique des statuts.",
        ],
        [
          "Que se passe-t-il à la fin de ma période ?",
          "Tes données restent. Les nouvelles commandes et la création de pages reprennent dès que tu saisis une nouvelle clé.",
        ],
      ],
    },
    final: {
      arabic: "يلاه نبداو",
      title: "Ta première landing peut tourner ce soir.",
      whatsapp: "Nous écrire sur WhatsApp",
      whatsappText: "Bonjour, j'ai une question sur LandPro.",
    },
    footer: {
      text: "Pour les vendeurs en paiement à la livraison au Maroc.",
      links: { cgv: "Conditions de vente", privacy: "Confidentialité" },
    },
  },
  ar: {
    meta: {
      title: "LandPro — بيع، أكّد و وصّل بالدفع عند الاستلام",
      description:
        "صفحات البيع، الطلبات، فريق التأكيد و التوصيل مع Ozon Express ف أداة وحدة للبائعين ف المغرب. من 599 درهم لـ 3 شهور.",
    },
    nav: { templates: "القوالب", trajet: "كيفاش كيخدم", equipe: "الفريق", tarifs: "الأثمنة" },
    login: "دخول",
    activate: "فعّل LandPro",
    otherLang: { label: "Français", href: "/", lang: "fr" },
    hero: {
      title: ["بيع.", "أكّد.", "وصّل."],
      text: "LandPro كيجمع ليك كلشي ف بلاصة وحدة: صفحة البيع، الطلبات، فريق التأكيد، و الإرسال مع Ozon Express.",
      cta: "فعّل LandPro من 599 درهم",
      secondary: "تبّع طلبية من البداية حتى التوصيل",
      slip: {
        title: "بون الطلب",
        ref: "LP-1042 نهار 16/10",
        lines: ["عباية الأناقة، مقاس M", "سلمى، الرباط"],
        total: "459 درهم عند الاستلام",
        stamp: "مؤكّدة",
      },
      phoneA: "صفحة بيع LandPro ديال سبرديلة على التيليفون",
      phoneB: "صفحة بيع LandPro بالعربية ديال عباية",
    },
    templates: {
      title: "149 صفحة بيع واجدة، بالعربية و بالفرنسية.",
      text: "كل قالب فيه فورمولير الطلب، العروض ديال 1 و 2 و 3 حبات، و نصوص كيكتبها الذكاء الاصطناعي على حساب المنتوج ديالك.",
      link: "شوف 149 قالب",
      items: [
        ["tpl-montre-orbite-360", "ساعة Orbite"],
        ["tpl-serum-avant-apres", "سيروم، قبل و بعد"],
        ["tpl-hoodie-graffiti", "هودي Graffiti"],
        ["tpl-parfum-aube", "عطر Aube"],
        ["tpl-support-flash-stock", "حامل التيليفون، ثمن مكسور"],
        ["tpl-ecouteurs-aurora", "كيتمان Aurora"],
      ],
    },
    trajet: {
      title: "الطريق ديال الطلبية، من الكليك حتى الفلوس.",
      text: "تبّع الطلبية LP-1042: ف كل مرحلة، LandPro كيعاونك ف الفرز، المكالمة و الإرسال.",
      steps: [
        ["توصلات", "سلمى طلبات من الصفحة ديالك ف 20 ثانية."],
        ["تفحّصات", "نفس الرقم من ساعتين: LandPro كيعلّمها «مكررة»."],
        ["تأكّدات", "نادية، الموظفة ديالك، كتعيّط ليها و كتأكد ف الواتساب."],
        ["تصيفطات", "كليكة وحدة و الطرد كيتسجل عند Ozon Express."],
        ["وصلات", "الحالة كتتحدث بوحدها، و كتشوف الفلوس اللي دخلات."],
      ],
      shot: "صفحة الطلبات ف LandPro مع درجة الثقة ديال كل زبون",
    },
    equipe: {
      title: "فريق التأكيد ديالك، بلا مجموعة الواتساب.",
      p1: "كتصاوب حساب لكل موظف. كل واحد كيشوف غير الطلبات ديالو و يقدر غير يبدّل حالة المكالمة. و نتا كتشوف شكون كيأكد أحسن.",
      p2: "الطلبات الجديدة كتتوزع بوحدها على الموظف اللي عندو أقل خدمة. كل مكالمة كتتحسب، و كل رجوع للمكالمة عندو الوقت ديالو.",
      shot: "صفحة الفريق ف LandPro مع النتائج ديال كل موظف",
    },
    tarifs: {
      title: "كلشي داخل. نتا غير ختار المدة.",
      text: "خلّص بالتحويل البنكي أو كاش بلوس، توصل بكود التفعيل ف الواتساب، و الحساب ديالك كيتفتح ف الحين. بلا حتى عمولة على المبيعات.",
      currency: "درهم",
      plans: [
        { months: 3, price: "599", label: "3 شهور", perMonth: "200 درهم ف الشهر", cta: "خود 3 شهور" },
        { months: 6, price: "999", label: "6 شهور", perMonth: "167 درهم ف الشهر", cta: "خود 6 شهور" },
        { months: 12, price: "1699", label: "12 شهر، أحسن ثمن", perMonth: "142 درهم ف الشهر", cta: "خود 12 شهر" },
      ],
      included:
        "كل عرض فيه 149 صفحة بيع و 50 متجر، الطلبات، كشف الطلبات المزيفة، فريق التأكيد، Ozon Express، Pixel ديال Meta و الدومين ديالك.",
      whatsapp: (months: number) => `السلام، بغيت نفعّل LandPro لمدة ${months} شهور.`,
    },
    faq: {
      title: "الأسئلة اللي كيطرحو علينا قبل ما يبداو",
      items: [
        [
          "كيفاش نفعّل الحساب ديالي؟",
          "من بعد الخلاص، كتوصل بكود LP-XXXX-XXXX-XXXX ف الواتساب. كتدخلو ف التسجيل و الحساب كيتفعّل ف الحين.",
        ],
        ["واش LandPro كياخد عمولة؟", "لا. كتخلّص غير المدة ديال الاشتراك."],
        ["واش الموظفين كيشوفو الأرقام ديالي؟", "لا. الموظف كيشوف غير الطلبات اللي عطيتيه."],
        ["شنو هي شركات التوصيل المربوطة؟", "Ozon Express مربوطة: تسجيل الطرد بكليكة و تتبّع الحالة أوتوماتيكيا."],
        [
          "شنو كيوقع ف آخر المدة ديالي؟",
          "المعلومات ديالك كتبقى. الطلبات الجديدة و إنشاء الصفحات كيرجعو غير تدخل كود جديد.",
        ],
      ],
    },
    final: {
      arabic: "يلاه نبداو",
      title: "الصفحة الأولى ديالك تقدر تخدم هاد الليلة.",
      whatsapp: "كتب لينا ف الواتساب",
      whatsappText: "السلام، عندي سؤال على LandPro.",
    },
    footer: {
      text: "للبائعين بالدفع عند الاستلام ف المغرب.",
      links: { cgv: "شروط البيع", privacy: "الخصوصية" },
    },
  },
} as const;
