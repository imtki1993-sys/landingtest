"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AuthShell from "../../components/site/AuthShell";
export default function ResetPassword() {
  const [p, setP] = useState(""),
    [confirm, setConfirm] = useState(""),
    [msg, setMsg] = useState(""),
    [done, setDone] = useState(false),
    [show, setShow] = useState(false),
    [ready, setReady] = useState(false),
    [loading, setLoading] = useState(true);
  const clientRef = useRef<any>(null);
  useEffect(() => {
    let alive = true;
    const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!urlEnv || !keyEnv) {
      setMsg("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }
    const s = createClient(urlEnv, keyEnv);
    clientRef.current = s;
    async function init() {
      try {
        const url = new URL(window.location.href),
          code = url.searchParams.get("code"),
          hash = new URLSearchParams(url.hash.replace(/^#/, "")),
          accessToken = hash.get("access_token"),
          refreshToken = hash.get("refresh_token");
        if (code) {
          const { error } = await s.auth.exchangeCodeForSession(code);
          if (error) throw error;
          url.searchParams.delete("code");
          history.replaceState({}, document.title, url.pathname + url.search);
        } else if (accessToken && refreshToken) {
          const { error } = await s.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
          history.replaceState({}, document.title, url.pathname + url.search);
        }
        const { data, error } = await s.auth.getSession();
        if (error) throw error;
        if (alive) setReady(!!data.session);
      } catch (e: any) {
        if (alive) setMsg("Lien invalide ou expiré. Demande un nouveau lien de réinitialisation.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    init();
    const { data } = s.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(!!session);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    if (p.length < 8) {
      setMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    const s = clientRef.current;
    if (!s) {
      setMsg("Session de récupération indisponible. Demande un nouveau lien.");
      setLoading(false);
      return;
    }
    const { error } = await s.auth.updateUser({ password: p });
    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
    await s.auth.signOut();
    setDone(true);
    setMsg("Mot de passe modifié. On t'emmène à la connexion…");
    setTimeout(() => (location.href = "/login"), 1200);
  }
  return (
    <AuthShell title="Choisis un nouveau mot de passe." arabic="مرحبا بيك" top={<a href="/login">Se connecter</a>}>
      {ready && !done ? (
        <form className="mja-card" onSubmit={submit}>
          <h2 className="mja-h2">Nouveau mot de passe</h2>
          <p className="mja-lead">Tu l&apos;utiliseras pour te connecter à LandPro.</p>
          <label className="mja-field">
            <span>Mot de passe</span>
            <div className="mja-pass">
              <input
                type={show ? "text" : "password"}
                minLength={8}
                autoComplete="new-password"
                required
                value={p}
                onChange={(e) => setP(e.target.value)}
              />
              <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show}>
                {show ? "Masquer" : "Afficher"}
              </button>
            </div>
            <small className={p && p.length < 8 ? "is-warn" : ""}>
              {p && p.length < 8
                ? `Encore ${8 - p.length} caractère${8 - p.length > 1 ? "s" : ""}`
                : "8 caractères minimum"}
            </small>
          </label>
          {msg && (
            <p className="mja-alert" role="alert">
              {msg}
            </p>
          )}
          <button className="mja-btn" disabled={loading}>
            {loading ? "Modification…" : "Enregistrer le mot de passe"}
          </button>
        </form>
      ) : (
        <section className="mja-card" aria-live="polite">
          <h2 className="mja-h2">
            {done ? "C'est fait" : loading ? "Vérification du lien…" : "Ce lien ne marche plus"}
          </h2>
          <p className="mja-lead">
            {done
              ? msg
              : loading
                ? "Un instant."
                : msg ||
                  "Le lien n'est pas valide ou a expiré. Demande un nouveau lien, il arrive en quelques secondes."}
          </p>
          {!loading && !done && (
            <a href="/forgot-password" className="mja-btn">
              Demander un nouveau lien
            </a>
          )}
        </section>
      )}
    </AuthShell>
  );
}
