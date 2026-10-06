// Templates « sur mesure » : créés à partir d'une maquette envoyée à part (hors séries de 15).
// Dans les titres de section, un mot entre *étoiles* est souligné au feutre (couleur d'accent).
import type { StoreTemplate } from "./types";
import { SHARED_AR, SHARED_FR, withShared } from "./shared-copy";

export const SUR_MESURE: StoreTemplate[] = [
  {
    id: "s90-01",
    series: 90,
    folder: "EduLearn (maquette école)",
    name: "École Vive",
    niche: "École, cours & formation",
    description:
      "Crème, vert sarcelle et orange : titres soulignés au feutre, collage photo, cartes à encoche et doodles dessinés.",
    theme: {
      bg: "#f8f7f3",
      surface: "#efeeec",
      text: "#2b2b2b",
      muted: "#6b6b6b",
      border: "#e3e1db",
      primary: "#2a7d73",
      onPrimary: "#ffffff",
      accent: "#f99d0b",
      onAccent: "#ffffff",
      dark: "#2a7d73",
      onDark: "#ffffff",
      heroBg: "#f8f7f3",
      heroText: "#2b2b2b",
      radius: 26,
      headingFont: "Inter Tight",
      bodyFont: "Hanken Grotesk",
      headingWeight: 700,
      headingTracking: "-0.035em",
    },
    header: "split",
    hero: "school",
    card: "plain",
    categories: "pills",
    promos: "cards",
    trust: "icons",
    layout: {
      header: "classic",
      card: "notch",
      faq: "cards",
      footer: "bar",
      shop: "topbar",
      product: "split",
      page: "simple",
    },
    sections: ["hero", "features", "photostats", "products", "testimonials", "faq", "newsletter"],
    hiddenByDefault: ["testimonials"],
    showAnnouncement: false,
    ctaPhoto: true,
    copy: {
      fr: {
        eyebrow: "Cours & formations",
        title: "Apprendre devient un plaisir",
        highlight: "devient",
        text: "Des cours clairs, des formateurs disponibles et une inscription simple : avancez à votre rythme, où que vous soyez au Maroc.",
        button: "Commencer",
        announcement: "Inscription en ligne · Réponse rapide sur WhatsApp",
        collectionTitle: "Nos *cours* à la une",
        collectionSubtitle: "Choisissez votre formation et inscrivez-vous en quelques clics.",
        sections: withShared(SHARED_FR, {
          hero: {
            items: [
              { title: "Des formateurs *qualifiés*", value: "{products}", text: "formations disponibles" },
              { title: "Des cours qui donnent envie d'apprendre" },
            ],
          },
          features: {
            title: "Une façon plus *simple* d'apprendre",
            text: "Des cours bien construits, un suivi attentif et un accompagnement sur WhatsApp : chaque élève progresse à son rythme.",
            items: [
              {
                title: "Des cours *clairs* et progressifs",
                text: "Chaque notion est expliquée pas à pas, avec des exemples concrets.",
              },
              {
                title: "Un *suivi* proche de chaque élève",
                text: "Une question ? L'équipe répond rapidement sur WhatsApp.",
              },
              {
                title: "Des objectifs *atteints*, étape par étape",
                text: "Des exercices réguliers pour vérifier vos progrès.",
              },
            ],
          },
          photostats: {
            title: "Pourquoi choisir *nos* cours ?",
            text: "Des formations sélectionnées avec soin, une inscription simple et un accompagnement humain du début à la fin.",
            items: [
              { value: "{products}", title: "Formations disponibles" },
              { value: "{categories}", title: "Domaines d'étude" },
              { value: "100%", title: "Inscription en ligne" },
            ],
          },
          testimonials: {
            title: "Ce que disent nos *élèves*",
            text: "Remplacez ces exemples par de vrais avis de vos élèves ou de leurs parents.",
          },
          faq: { title: "Questions *fréquentes*" },
          newsletter: {
            eyebrow: "Contactez-nous",
            title: "Rejoignez notre communauté d'élèves",
            text: "Une question sur une formation ou une inscription ? Écrivez-nous, on vous répond rapidement.",
            button: "Nous contacter",
          },
        }),
      },
      ar: {
        eyebrow: "دروس وتكوينات",
        title: "التعلم ولّا متعة",
        highlight: "متعة",
        text: "دروس واضحة، مكونين معاك وتسجيل ساهل: تقدم بالسرعة ديالك، فين ما كنتي فالمغرب.",
        button: "بدا دابا",
        announcement: "التسجيل أونلاين · جواب سريع فواتساب",
        collectionTitle: "الدروس *ديالنا*",
        collectionSubtitle: "ختار التكوين ديالك وسجل فبضع نقرات.",
        sections: withShared(SHARED_AR, {
          hero: {
            items: [
              { title: "مكونين *مؤهلين*", value: "{products}", text: "تكوين متوفر" },
              { title: "دروس كتحبب ليك التعلم" },
            ],
          },
          features: {
            title: "طريقة *أسهل* باش تتعلم",
            text: "دروس منظمة، تتبع قريب ومرافقة فواتساب: كل تلميذ كيتقدم بالسرعة ديالو.",
            items: [
              { title: "دروس *واضحة* وبالتدريج", text: "كل فكرة مشروحة خطوة بخطوة بأمثلة من الواقع." },
              { title: "*تتبع* قريب لكل تلميذ", text: "عندك سؤال؟ الفريق كيجاوب بسرعة فواتساب." },
              { title: "أهداف *كتوصل* ليها خطوة بخطوة", text: "تمارين منتظمة باش تشوف التقدم ديالك." },
            ],
          },
          photostats: {
            title: "علاش تختار *الدروس* ديالنا؟",
            text: "تكوينات مختارة بعناية، تسجيل ساهل ومرافقة من البداية حتى للنهاية.",
            items: [
              { value: "{products}", title: "تكوين متوفر" },
              { value: "{categories}", title: "مجال دراسة" },
              { value: "100%", title: "تسجيل أونلاين" },
            ],
          },
          testimonials: {
            title: "شنو كيقولو *التلاميذ*",
            text: "بدل هاد الأمثلة بآراء حقيقية ديال التلاميذ ولا الوالدين.",
          },
          faq: { title: "أسئلة *متكررة*" },
          newsletter: {
            eyebrow: "تواصل معانا",
            title: "انضم للمجتمع ديال التلاميذ ديالنا",
            text: "عندك سؤال على شي تكوين ولا التسجيل؟ كتب لينا ونجاوبوك بسرعة.",
            button: "تواصل معانا",
          },
        }),
      },
    },
  },
];
