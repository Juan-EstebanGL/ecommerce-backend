import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { showError } from "../utils/alerts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      showError("Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      showError("El formato del correo electrónico no es válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());
      setSuccessMessage(
        response.data?.message || "Si el correo existe, recibirás un enlace para restablecer tu contraseña"
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo procesar la solicitud";
      setError(message);
    } finally {
      setLoading(false);
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
        <div className="auth-card fp-card">
          <div className="fp-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="auth-card__title" style={{ textAlign: "center" }}>
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="auth-card__subtitle" style={{ textAlign: "center" }}>
            No te preocupes. Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          {error && (
            <div className="auth-card__error">
              <span>✕</span> {error}
            </div>
          )}
          {successMessage && (
            <div className="auth-card__success">
              <span>✓</span> {successMessage}
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="fp-email">
                Email
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
                <input
                  ref={inputRef}
                  id="fp-email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  aria-label="Correo electrónico"
                />
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
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

export default ForgotPasswordPage;
