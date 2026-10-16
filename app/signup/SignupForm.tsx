"use client";
// Formulaire d'inscription (style Majorelle). La clé d'activation peut arriver par le lien ?key=LP-...
import { FormEvent, useEffect, useState } from "react";
import "../../components/site/auth.css";
import { formatKey, keyState } from "../../lib/license-format";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Noto+Kufi+Arabic:wght@700;800&display=swap";
export default function SignupForm({ salesPhone }: { salesPhone: string }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [licenseKey, setLicenseKey] = useState(""),
    [error, setError] = useState(""),
    [done, setDone] = useState(""),
    [loading, setLoading] = useState(false);

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("key");
    if (k) setLicenseKey(formatKey(k));
  }, []);

  const ks = keyState(licenseKey);
  const whatsapp = salesPhone
    ? `https://wa.me/${salesPhone}?text=${encodeURIComponent("Bonjour, je veux activer LandPro.")}`
    : "/#tarifs";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (ks === "partial" || ks === "bad") {
      setError("La clé doit avoir la forme LP-XXXX-XXXX-XXXX. Vérifie-la ou laisse le champ vide.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, license_key: ks === "ok" ? licenseKey : undefined }),
        }),
        x = await r.json();
      if (!r.ok) throw new Error(x.error || "Inscription impossible. Réessaie dans un instant.");
      if (x.licenseError) setError(x.licenseError);
      if (x.confirmationRequired) {
        setDone(
          ks === "ok" && !x.licenseError
            ? "Ton abonnement est déjà activé. Ouvre l'email de confirmation que l'on vient d'envoyer à " +
                email +
                ", puis connecte-toi."
            : "Ouvre l'email de confirmation que l'on vient d'envoyer à " + email + ", puis connecte-toi.",
        );
        return;
      }
      if (x.licenseError) return;
      try {
        sessionStorage.setItem("lp_role", "owner");
      } catch {}
      window.location.href = "/";
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mja">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href={FONTS} />

      <aside className="mja-side">
        <a href="/" className="mja-logo">
          landpro
        </a>
        <div className="mja-side-body">
          <h1 className="mja-title">Ton compte s&apos;ouvre en trois étapes.</h1>
          <ol className="mja-steps">
            <li>
              <b>Choisis ta durée</b>
              <span>599 DH pour 3 mois, 999 DH pour 6 mois ou 1 699 DH pour 12 mois. Virement ou CashPlus.</span>
            </li>
            <li>
              <b>Reçois ta clé</b>
              <span>On t&apos;envoie ta clé LP-XXXX-XXXX-XXXX sur WhatsApp.</span>
            </li>
            <li>
              <b>Crée ton compte</b>
              <span>Saisis ta clé ici : tout est ouvert tout de suite, landings, commandes et équipe.</span>
            </li>
          </ol>
        </div>
        <p className="mja-side-foot" lang="ar" dir="rtl">
          يلاه نبداو
        </p>
      </aside>

      <main className="mja-main">
        <div className="mja-top">
          <a href="/" className="mja-logo mja-logo-mobile">
            landpro
          </a>
          <span>
            Déjà inscrit ? <a href="/login">Se connecter</a>
          </span>
        </div>

        {done ? (
          <section className="mja-card" aria-live="polite">
            <h2 className="mja-h2">Compte créé</h2>
            <p className="mja-lead">{done}</p>
            {error && <p className="mja-alert">{error}</p>}
            <a href="/login" className="mja-btn">
              Aller à la connexion
            </a>
          </section>
        ) : (
          <form className="mja-card" onSubmit={submit} noValidate={false}>
            <h2 className="mja-h2">Créer ton compte</h2>
            <p className="mja-lead">Il te faut un email, un mot de passe et ta clé d&apos;activation.</p>

            <label className="mja-field">
              <span>Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="mja-field">
              <span>Mot de passe</span>
              <div className="mja-pass">
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="pass-hint"
                />
                <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show}>
                  {show ? "Masquer" : "Afficher"}
                </button>
              </div>
              <small id="pass-hint" className={password && password.length < 8 ? "is-warn" : ""}>
                {password && password.length < 8
                  ? `Encore ${8 - password.length} caractère${8 - password.length > 1 ? "s" : ""}`
                  : "8 caractères minimum"}
              </small>
            </label>

            <label className="mja-field">
              <span>Clé d&apos;activation</span>
              <input
                className={"mja-key" + (ks === "ok" ? " is-ok" : ks === "bad" ? " is-bad" : "")}
                placeholder="LP-XXXX-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={licenseKey}
                onChange={(e) => setLicenseKey(formatKey(e.target.value))}
                aria-describedby="key-hint"
              />
              <small id="key-hint" className={ks === "ok" ? "is-ok" : ks === "bad" ? "is-warn" : ""}>
                {ks === "ok"
                  ? "Clé au bon format, elle sera activée à la création du compte."
                  : ks === "bad"
                    ? "Cette clé contient un caractère qui n'existe pas dans nos clés (0, 1, I, L ou O)."
                    : "Sans clé, ton compte est créé mais reste en attente jusqu'à l'activation."}
              </small>
            </label>

            {error && (
              <p className="mja-alert" role="alert">
                {error}
              </p>
            )}

            <button className="mja-btn" disabled={loading}>
              {loading ? "Création du compte…" : "Créer mon compte"}
            </button>

            <p className="mja-help">
              Pas encore de clé ?{" "}
              <a href={whatsapp} {...(salesPhone ? { target: "_blank", rel: "noopener" } : {})}>
                {salesPhone ? "Demande-la sur WhatsApp" : "Voir les tarifs"}
              </a>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
