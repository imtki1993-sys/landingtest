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
    nav: {
      templates: "Exemples",
      boutique: "Boutiques",
      trajet: "Comment ça marche",
      equipe: "Équipe",
      fonctions: "Fonctions",
      tarifs: "Tarifs",
    },
    login: "Se connecter",
    activate: "Activer LandPro",
    otherLang: { label: "العربية", href: "/ar", lang: "ar" },
    hero: {
      title: ["Vends.", "Confirme.", "Livre."],
      text: "LandPro réunit tout le travail du vendeur en paiement à la livraison : ta landing ou ta boutique, tes commandes, ton équipe d'appel et l'envoi chez Ozon Express.",
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
      title: "Des landings qui vendent, en arabe et en français.",
      text: "Quelques landings faites avec LandPro. Chacune a son formulaire de commande, ses offres 1, 2 ou 3 pièces et des textes écrits par l'IA pour le produit.",
      items: [
        ["tpl-montre-orbite-360", "Montre automatique", "1 290 DH"],
        ["tpl-serum-avant-apres", "Sérum visage", "189 DH"],
        ["tpl-hoodie-graffiti", "Hoodie oversize", "349 DH"],
        ["tpl-parfum-aube", "Eau de parfum oud", "390 DH"],
        ["tpl-support-flash-stock", "Support téléphone voiture", "199 DH"],
        ["tpl-ecouteurs-aurora", "Écouteurs sans fil", "299 DH"],
      ],
    },
    boutique: {
      title: "Une boutique complète, pas seulement une page.",
      text: "Pour vendre plusieurs produits, LandPro génère aussi ta boutique en ligne : accueil, catalogue, fiche produit, panier, livraison, contact, FAQ et pages légales. Ton client remplit son panier et paie à la livraison.",
      points: [
        ["Un modèle, ton style", "Choisis un modèle, puis change couleurs, textes et ordre des sections de l'accueil."],
        ["En français ou en arabe", "La boutique, le panier et les pages passent en arabe, de droite à gauche."],
        ["Les textes par l'IA", "L'IA écrit les textes de ta boutique et propose des idées de photos."],
        [
          "Tu publies quand c'est prêt",
          "Tu modifies un brouillon ; le site en ligne change seulement quand tu publies.",
        ],
      ],
      url: "landpro.online/store/maison-atlas",
      shotFr: "Boutique LandPro en français",
      shotAr: "Boutique LandPro en arabe",
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
    fonctions: {
      title: "Tout ce qu'il y a dans LandPro",
      text: "Chaque formule donne accès à tout. Rien à installer, rien à brancher en plus pour commencer.",
      groups: [
        {
          name: "Créer",
          items: [
            ["Éditeur de landings", "Sections à glisser, dupliquer ou annuler, aperçu ordinateur, tablette et mobile."],
            ["Générateur de boutiques", "Boutique complète avec catalogue, panier et pages prêtes."],
            ["Textes par l'IA", "En darija, en arabe ou en français, à partir des photos du produit."],
            ["Import de produit", "Colle un lien AliExpress ou Alibaba pour démarrer la fiche."],
            ["Variantes et offres", "Taille, couleur, prix et stock par variante, offres 1, 2 ou 3 pièces."],
            ["Ton adresse", "Chaque landing a son adresse .landpro.online, ou ton propre domaine."],
          ],
        },
        {
          name: "Vendre",
          items: [
            ["Formulaire ou WhatsApp", "Ton client commande par formulaire, par WhatsApp, ou au choix."],
            ["Landings hors LandPro", "Un script relie le formulaire de ta landing existante à tes commandes."],
            ["Pixel Meta", "Événements du Pixel et achat envoyé depuis le serveur par l'API Conversions."],
          ],
        },
        {
          name: "Confirmer",
          items: [
            ["Filtre des fausses commandes", "Doublons, numéros invalides, clients qui retournent et liste noire."],
            ["Équipe d'appel", "Comptes agents, répartition automatique et taux de confirmation par agent."],
            ["WhatsApp en un clic", "Message de confirmation prêt, ouvert sur le numéro du client."],
            ["Suivi des appels", "Pas de réponse, rappel avec date et heure, tableau ou Kanban, export CSV."],
          ],
        },
        {
          name: "Livrer et mesurer",
          items: [
            ["Ozon Express", "Colis créé en un clic, statuts mis à jour toutes les 30 minutes."],
            ["Statistiques", "Visites, conversion, taux de confirmation, de livraison et de retour, chiffre livré."],
            ["Messages", "Les messages du formulaire de contact de tes boutiques, au même endroit."],
          ],
        },
      ],
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
        "Chaque formule comprend la création de landings et de boutiques, les commandes, le filtre des fausses commandes, l'équipe de confirmation, Ozon Express, le Pixel Meta et ton domaine.",
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
    nav: {
      templates: "أمثلة",
      boutique: "المتاجر",
      trajet: "كيفاش كيخدم",
      equipe: "الفريق",
      fonctions: "الخدمات",
      tarifs: "الأثمنة",
    },
    login: "دخول",
    activate: "فعّل LandPro",
    otherLang: { label: "Français", href: "/", lang: "fr" },
    hero: {
      title: ["بيع.", "أكّد.", "وصّل."],
      text: "LandPro كيجمع ليك كلشي ف بلاصة وحدة: صفحة البيع ولا المتجر، الطلبات، فريق التأكيد، و الإرسال مع Ozon Express.",
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
      title: "صفحات بيع كتبيع، بالعربية و بالفرنسية.",
      text: "شوية ديال صفحات البيع مصاوبين ب LandPro. كل وحدة فيها فورمولير الطلب، العروض ديال 1 و 2 و 3 حبات، و نصوص كتبها الذكاء الاصطناعي على حساب المنتوج.",
      items: [
        ["tpl-montre-orbite-360", "ساعة أوتوماتيكية", "1290 درهم"],
        ["tpl-serum-avant-apres", "سيروم للوجه", "189 درهم"],
        ["tpl-hoodie-graffiti", "هودي واسع", "349 درهم"],
        ["tpl-parfum-aube", "عطر العود", "390 درهم"],
        ["tpl-support-flash-stock", "حامل التيليفون للطوموبيل", "199 درهم"],
        ["tpl-ecouteurs-aurora", "كيتمان بلا خيط", "299 درهم"],
      ],
    },
    boutique: {
      title: "متجر كامل، ماشي غير صفحة وحدة.",
      text: "إلا بغيتي تبيع بزاف ديال المنتوجات، LandPro كيصاوب ليك حتى المتجر ديالك: الرئيسية، الكاتالوغ، صفحة المنتوج، السلة، التوصيل، التواصل، الأسئلة و الصفحات القانونية. الزبون كيعمّر السلة و كيخلّص عند الاستلام.",
      points: [
        ["موديل، و الستيل ديالك", "ختار موديل، و بدّل الألوان، النصوص و الترتيب ديال الأقسام ف الرئيسية."],
        ["بالعربية ولا بالفرنسية", "المتجر، السلة و الصفحات كيدوزو للعربية، من اليمين لليسار."],
        ["النصوص بالذكاء الاصطناعي", "الذكاء الاصطناعي كيكتب النصوص ديال المتجر و كيعطيك أفكار للتصاور."],
        ["كتنشر ملي يكون واجد", "كتبدّل ف مسودة، و الموقع ما كيتبدّلش حتى تنشر."],
      ],
      url: "landpro.online/store/maison-atlas",
      shotFr: "متجر LandPro بالفرنسية",
      shotAr: "متجر LandPro بالعربية",
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
    fonctions: {
      title: "كلشي اللي كاين ف LandPro",
      text: "كل عرض كيعطيك كلشي. ما كاين ما تثبّت، و ما كاين ما تربط زايد باش تبدا.",
      groups: [
        {
          name: "صاوب",
          items: [
            ["محرر صفحات البيع", "أقسام كتجرّها، كتنسخها ولا كترجعها، و معاينة ف البيسي، التابليت و التيليفون."],
            ["مولّد المتاجر", "متجر كامل فيه الكاتالوغ، السلة و الصفحات واجدين."],
            ["النصوص بالذكاء الاصطناعي", "بالدارجة، بالعربية ولا بالفرنسية، من التصاور ديال المنتوج."],
            ["استيراد المنتوج", "لصق رابط AliExpress ولا Alibaba باش تبدا الفيشة."],
            ["الأنواع و العروض", "المقاس، اللون، الثمن و السطوك لكل نوع، و عروض 1 و 2 و 3 حبات."],
            ["العنوان ديالك", "كل صفحة عندها عنوان .landpro.online، ولا الدومين ديالك."],
          ],
        },
        {
          name: "بيع",
          items: [
            ["فورمولير ولا واتساب", "الزبون كيطلب بالفورمولير، بالواتساب، ولا بجوج."],
            ["صفحات برا LandPro", "سكريبت كيربط الفورمولير ديال الصفحة اللي عندك مع الطلبات ديالك."],
            ["Pixel ديال Meta", "أحداث الـ Pixel و الشراء كيتصيفط من السيرفر بـ API Conversions."],
          ],
        },
        {
          name: "أكّد",
          items: [
            ["كشف الطلبات المزيفة", "الطلبات المكررة، الأرقام الغالطة، الزبناء اللي كيرجعو و اللائحة السوداء."],
            ["فريق التأكيد", "حسابات للموظفين، توزيع أوتوماتيكي و نسبة التأكيد لكل موظف."],
            ["واتساب بكليكة", "رسالة التأكيد واجدة، كتتحل على الرقم ديال الزبون."],
            ["تتبّع المكالمات", "ما جاوبش، عاود عيّط مع النهار و الساعة، جدول ولا Kanban، و تصدير CSV."],
          ],
        },
        {
          name: "وصّل و تبّع",
          items: [
            ["Ozon Express", "الطرد كيتسجل بكليكة، و الحالة كتتحدث كل 30 دقيقة."],
            ["الإحصائيات", "الزيارات، التحويل، نسبة التأكيد، التوصيل و الرجوع، و الفلوس اللي دخلات."],
            ["الرسائل", "الرسائل ديال فورمولير التواصل ف المتاجر ديالك، ف بلاصة وحدة."],
          ],
        },
      ],
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
        "كل عرض فيه إنشاء صفحات البيع و المتاجر، الطلبات، كشف الطلبات المزيفة، فريق التأكيد، Ozon Express، Pixel ديال Meta و الدومين ديالك.",
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
