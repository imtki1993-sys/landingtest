// Mise en page commune des pages d'accès (connexion, mot de passe) : colonne bleue + formulaire.
import type { ReactNode } from "react";
import "./auth.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Noto+Kufi+Arabic:wght@700;800&display=swap";

export default function AuthShell({
  title,
  side,
  arabic,
  top,
  children,
}: {
  title: string;
  side?: ReactNode;
  arabic: string;
  top: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mja">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href={FONTS} />
      <aside className="mja-side">
        <a href="/" className="mja-logo">
          landpro
        </a>
        <div className="mja-side-body">
          <h1 className="mja-title">{title}</h1>
          {side}
        </div>
        <p className="mja-side-foot" lang="ar" dir="rtl">
          {arabic}
        </p>
      </aside>
      <main className="mja-main">
        <div className="mja-top">
          <a href="/" className="mja-logo mja-logo-mobile">
            landpro
          </a>
          <span>{top}</span>
        </div>
        {children}
      </main>
    </div>
  );
}
