import { useState } from "react";
import AuthSidePanel from "../components/AuthSidePanel";
import { Link, useLocation, Navigate } from "react-router-dom";
import { resendVerification } from "../api/auth";
import { showSuccess, showError } from "../utils/alerts";

function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;
  const [loading, setLoading] = useState(false);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  async function handleResend() {
    setLoading(true);
    try {
      await resendVerification(email);
      showSuccess("Correo reenviado correctamente");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo reenviar el correo";
      showError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <AuthSidePanel />
<div className="auth-right">
        <div className="auth-card ce-card">
          <div className="ce-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4l-10 8L2 4" />
            </svg>
          </div>
          <h2 className="auth-card__title" style={{ textAlign: "center" }}>
            Revisa tu correo electrónico
          </h2>
          <p className="auth-card__subtitle" style={{ textAlign: "center", marginBottom: "8px" }}>
            Hemos enviado un enlace de verificación a{" "}
            <strong style={{ color: "var(--text)" }}>{email}</strong>. Haz clic en el enlace del correo para activar tu cuenta.
          </p>
          <div className="ce-info">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Si no encuentras el correo, revisa la carpeta de spam o correo no deseado.</span>
          </div>
          <button
            type="button"
            className="auth-btn ce-resend-btn"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? "Reenviando..." : "Reenviar correo"}
          </button>
          <div className="auth-divider">
            <span>¿Ya verificaste tu correo?</span>
            <Link to="/login" className="auth-link">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CheckEmailPage;
