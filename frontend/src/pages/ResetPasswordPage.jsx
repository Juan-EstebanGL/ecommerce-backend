import { useState, useEffect, useRef } from "react";
import AuthSidePanel from "../components/AuthSidePanel";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { showError } from "../utils/alerts";
import { getPasswordStrength } from "../utils/validators";
import { resetPasswordErrorMessages as ERROR_MESSAGES } from "../utils/errorMessages";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("form");
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const token = searchParams.get("token");

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [status]);

  const strength = getPasswordStrength(password);

  if (!token) {
    return (
      <main className="auth-page">
        <AuthSidePanel />
<div className="auth-right">
          <div className="auth-card ve-card">
            <div className="ve-state">
              <div className="ve-icon ve-icon--error">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="ve-state__title">Enlace no válido</h2>
              <p className="ve-state__desc">
                El enlace de restablecimiento no contiene un token válido.
              </p>
              <Link to="/forgot-password" className="auth-btn ve-btn">
                Solicitar un nuevo enlace
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!password) {
      showError("Campo requerido", "Por favor ingresa una nueva contraseña.");
      return;
    }
    if (password.length < 8) {
      showError("Contraseña débil", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      showError("Contraseñas no coinciden", "Las contraseñas ingresadas no son iguales.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, password });
      setStatus("success");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo restablecer la contraseña";
      const mapped = ERROR_MESSAGES[message];
      if (mapped) {
        setErrorMsg(mapped);
        setStatus("error");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <main className="auth-page">
        <AuthSidePanel />
<div className="auth-right">
          <div className="auth-card ve-card">
            <div className="ve-state">
              <div className="ve-icon ve-icon--success">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="ve-state__title">Contraseña actualizada</h2>
              <p className="ve-state__desc">
                Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link to="/login" className="auth-btn ve-btn">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="auth-page">
        <AuthSidePanel />
<div className="auth-right">
          <div className="auth-card ve-card">
            <div className="ve-state">
              <div className="ve-icon ve-icon--error">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="ve-state__title">{errorMsg?.title}</h2>
              <p className="ve-state__desc">{errorMsg?.desc}</p>
              <Link to="/forgot-password" className="auth-btn ve-btn">
                Solicitar un nuevo enlace
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <AuthSidePanel />
<div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card__title">Restablece tu contraseña</h2>
          <p className="auth-card__subtitle">
            Ingresa tu nueva contraseña para actualizar tu cuenta.
          </p>
          {error && (
            <div className="auth-card__error">
              <span>✕</span> {error}
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="rp-password">
                Nueva contraseña
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  ref={inputRef}
                  id="rp-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                  aria-label="Nueva contraseña"
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {password && (
                <div className="rp-strength">
                  <div className="rp-strength__bar">
                    <div
                      className="rp-strength__fill"
                      style={{
                        width: `${(strength.level / 3) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <span className="rp-strength__label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="rp-confirm">
                Confirmar contraseña
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="rp-confirm"
                  className="auth-input"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  required
                  aria-label="Confirmar contraseña"
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </button>
          </form>
          <div className="auth-divider">
            <span>¿Recordaste tu contraseña?</span>
            <Link to="/login" className="auth-link">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
