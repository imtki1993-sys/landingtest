"use client";
// Formulaire de connexion (style Majorelle). Un compte en attente peut saisir sa clé ici.
import { FormEvent, useEffect, useState } from "react";
import AuthShell from "../../components/site/AuthShell";
import { formatKey, keyState } from "../../lib/license-format";

/** Page demandée avant la redirection vers la connexion (chemin interne uniquement). */
function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/login")) return null;
  return raw;
}

export default function LoginForm() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [licenseKey, setLicenseKey] = useState(""),
    [needKey, setNeedKey] = useState(false),
    [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    setNext(safeNext(new URLSearchParams(window.location.search).get("next")));
  }, []);

  const ks = keyState(licenseKey);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (needKey && ks !== "ok") {
      setError("Saisis ta clé complète au format LP-XXXX-XXXX-XXXX.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, license_key: needKey ? licenseKey : undefined }),
        }),
        x = await r.json();
      if (x.code === "PENDING" && !needKey) {
        setNeedKey(true);
        return;
      }
      if (!r.ok) throw new Error(x.error || "Connexion impossible. Réessaie dans un instant.");
      const agent = x.role === "agent";
      try {
        sessionStorage.setItem("lp_role", agent ? "agent" : "owner");
      } catch {}
      window.location.href = agent ? "/orders" : next || "/";
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Tes commandes t'attendent."
      arabic="مرحبا بيك"
      top={
        <>
          <span className="mja-hide-sm">Pas encore de compte ? </span>
          <a href="/signup">Créer un compte</a>
        </>
      }
      side={
        <div className="mja-note">
          <b>Tu es agent de confirmation ?</b>
          <span>
            Connecte-toi avec l&apos;email et le mot de passe que ton vendeur t&apos;a donnés. Tu arrives directement
            sur tes commandes à appeler.
          </span>
        </div>
      }
    >
      <form className="mja-card" onSubmit={submit}>
        <h2 className="mja-h2">Se connecter</h2>
        <p className="mja-lead">Accède à tes landings, tes commandes et ton équipe.</p>

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
          <span className="mja-field-row">
            Mot de passe
            <a href="/forgot-password">Mot de passe oublié ?</a>
          </span>
          <div className="mja-pass">
            <input
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show}>
              {show ? "Masquer" : "Afficher"}
            </button>
          </div>
        </label>

        {needKey && (
          <label className="mja-field">
            <span>Clé d&apos;activation</span>
            <input
              className={"mja-key" + (ks === "ok" ? " is-ok" : ks === "bad" ? " is-bad" : "")}
              placeholder="LP-XXXX-XXXX-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              autoFocus
              value={licenseKey}
              onChange={(e) => setLicenseKey(formatKey(e.target.value))}
            />
            <small className={ks === "ok" ? "is-ok" : ks === "bad" ? "is-warn" : ""}>
              {ks === "ok"
                ? "Clé au bon format."
                : ks === "bad"
                  ? "Cette clé contient un caractère qui n'existe pas dans nos clés (0, 1, I, L ou O)."
                  : "Ton compte attend son activation : saisis la clé reçue sur WhatsApp."}
            </small>
          </label>
        )}

        {error && (
          <p className="mja-alert" role="alert">
            {error}
          </p>
        )}

        <button className="mja-btn" disabled={loading}>
          {loading ? "Connexion…" : needKey ? "Activer et se connecter" : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  );
}
