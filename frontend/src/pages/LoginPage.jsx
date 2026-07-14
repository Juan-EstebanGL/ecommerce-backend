import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { showWarning } from "../utils/alerts";
import { resendVerification } from "../api/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyPanel, setShowVerifyPanel] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifySentMessage, setVerifySentMessage] = useState("");
  const [verifyErrorMessage, setVerifyErrorMessage] = useState("");
  const [autoLoginMessage, setAutoLoginMessage] = useState("");
  const autoLoggingInRef = useRef(false);
  const verifyPanelRef = useRef(showVerifyPanel);
  const emailRef = useRef(email);
  const passwordRef = useRef(password);
  const navigate = useNavigate();
  const { login } = useAuth();

  verifyPanelRef.current = showVerifyPanel;
  emailRef.current = email;
  passwordRef.current = password;

  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel("auth_verification");
    } catch {
      return;
    }

    bc.onmessage = (event) => {
      if (event.data?.type !== "email-verified") return;
      if (autoLoggingInRef.current) return;
      if (!verifyPanelRef.current) return;
      if (!emailRef.current.trim() || !passwordRef.current) return;

      console.log("[Login] BroadcastChannel: email-verified received, auto-login starting");
      autoLoggingInRef.current = true;
      setAutoLoginMessage("Correo verificado. Iniciando sesión...");
      setVerifySentMessage("");
      setVerifyErrorMessage("");
      setLoading(true);

      login({ email: emailRef.current.trim(), password: passwordRef.current })
        .then(() => {
          console.log("[Login] auto-login successful");
          navigate("/products");
        })
        .catch((err) => {
          console.log("[Login] auto-login failed", err?.response?.data?.message);
          setAutoLoginMessage("");
          setVerifyErrorMessage(
            "No se pudo iniciar sesión automáticamente. Por favor, intenta manualmente."
          );
          autoLoggingInRef.current = false;
        })
        .finally(() => {
          setLoading(false);
        });
    };

    console.log("[Login] BroadcastChannel listener attached");
    return () => {
      console.log("[Login] BroadcastChannel closed");
      bc.close();
    };
  }, [login, navigate]);

  async function autoResend(userEmail) {
    setResendLoading(true);
    setVerifySentMessage("");
    setVerifyErrorMessage("");
    try {
      await resendVerification(userEmail);
      setVerifySentMessage(
        "Se ha enviado un nuevo enlace de verificación a tu correo electrónico."
      );
    } catch {
      setVerifyErrorMessage(
        "No se pudo enviar el correo de verificación automáticamente. Puedes reintentar con el botón."
      );
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setVerifySentMessage("");
    setVerifyErrorMessage("");

    if (!email.trim()) {
      showWarning("Campo requerido", "Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      showWarning("Email inválido", "El formato del correo electrónico no es válido.");
      return;
    }
    if (!password) {
      showWarning("Campo requerido", "Por favor ingresa tu contraseña.");
      return;
    }

    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate("/products");
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message || err?.message || "Credenciales inválidas";

      if (status === 403) {
        setShowVerifyPanel(true);
        setError("");
        autoResend(email.trim());
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  function hideVerifyPanel() {
    if (showVerifyPanel) {
      setShowVerifyPanel(false);
      setVerifySentMessage("");
      setVerifyErrorMessage("");
      setAutoLoginMessage("");
      autoLoggingInRef.current = false;
    }
  }

  async function handleResendVerification() {
    setResendLoading(true);
    setVerifySentMessage("");
    setVerifyErrorMessage("");
    try {
      await resendVerification(email.trim());
      setVerifySentMessage(
        "Se ha enviado un nuevo enlace de verificación a tu correo electrónico."
      );
    } catch {
      setVerifyErrorMessage(
        "No se pudo enviar el correo de verificación. Puedes reintentar con el botón."
      );
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-left">
        <div className="auth-left__bg">
          <div className="auth-circle auth-circle--1" />
          <div className="auth-circle auth-circle--2" />
          <div className="auth-circle auth-circle--3" />
          <div className="auth-circle auth-circle--4" />
        </div>
        <div className="auth-left__inner">
          <h1 className="auth-left__title">Bienvenido a E-Shop</h1>
          <p className="auth-left__desc">
            Compra productos de calidad, administra tus pedidos y disfruta una experiencia moderna.
          </p>
          <ul className="auth-benefits">
            <li className="auth-benefits__item">
              <span className="auth-benefits__icon">✓</span>
              <span>Compra segura</span>
            </li>
            <li className="auth-benefits__item">
              <span className="auth-benefits__icon">✓</span>
              <span>Envíos rápidos</span>
            </li>
            <li className="auth-benefits__item">
              <span className="auth-benefits__icon">✓</span>
              <span>Soporte 24/7</span>
            </li>
          </ul>
          <p className="auth-left__footnote">Más de 1000 clientes satisfechos.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card__title">Iniciar sesión</h2>
          <p className="auth-card__subtitle">Ingresa para continuar.</p>
          {error && (
            <div className="auth-card__error">
              <span>✕</span> {error}
            </div>
          )}
          {showVerifyPanel && (
            <div className="lp-verify">
              <div className="lp-verify__icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
              </div>
              <p className="lp-verify__title">Correo no verificado</p>
              <p className="lp-verify__desc">
                Debes verificar tu correo electrónico antes de iniciar sesión.
              </p>
              {autoLoginMessage && (
                <p className="lp-verify__success">{autoLoginMessage}</p>
              )}
              {verifySentMessage && !autoLoginMessage && (
                <p className="lp-verify__success">{verifySentMessage}</p>
              )}
              {verifyErrorMessage && !autoLoginMessage && (
                <p className="lp-verify__error">{verifyErrorMessage}</p>
              )}
              <button
                type="button"
                className="auth-btn lp-verify__btn"
                onClick={handleResendVerification}
                disabled={resendLoading || !!autoLoginMessage}
              >
                {resendLoading ? "Enviando correo..." : "Reenviar correo de verificación"}
              </button>
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-email">
                Email
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); hideVerifyPanel(); }}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  aria-label="Correo electrónico"
                />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-password">
                Contraseña
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); hideVerifyPanel(); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  aria-label="Contraseña"
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
            </div>
            <div className="auth-row">
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <Link to="/forgot-password" className="auth-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <div className="auth-divider">
            <span>¿No tienes cuenta?</span>
            <Link to="/register" className="auth-link">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
