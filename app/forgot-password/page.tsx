"use client";
import { FormEvent, useState } from "react";
import AuthShell from "../../components/site/AuthShell";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error || "Envoi impossible. Réessaie dans un instant.");
      setMsg(x.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthShell
      title="On t'aide à retrouver ton compte."
      arabic="ماشي مشكل"
      top={<a href="/login">Retour à la connexion</a>}
      side={
        <div className="mja-note">
          <b>Tu es agent de confirmation ?</b>
          <span>Demande à ton vendeur de te donner un nouveau mot de passe depuis sa page Équipe.</span>
        </div>
      }
    >
      {msg ? (
        <section className="mja-card" aria-live="polite">
          <h2 className="mja-h2">Regarde tes emails</h2>
          <p className="mja-lead">{msg}</p>
          <p className="mja-help">
            Rien reçu après quelques minutes ? Vérifie les spams, ou{" "}
            <button type="button" className="mja-linkbtn" onClick={() => setMsg("")}>
              renvoie le lien
            </button>
            .
          </p>
        </section>
      ) : (
        <form className="mja-card" onSubmit={submit}>
          <h2 className="mja-h2">Mot de passe oublié</h2>
          <p className="mja-lead">Saisis ton email : on t&apos;envoie un lien pour choisir un nouveau mot de passe.</p>
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
          {error && (
            <p className="mja-alert" role="alert">
              {error}
            </p>
          )}
          <button className="mja-btn" disabled={loading}>
            {loading ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
