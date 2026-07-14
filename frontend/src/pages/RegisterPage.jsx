import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { showWarning } from "../utils/alerts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      showWarning("Campo requerido", "Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      showWarning("Email inválido", "El formato del correo electrónico no es válido.");
      return;
    }
    if (!password) {
      showWarning("Campo requerido", "Por favor ingresa una contraseña.");
      return;
    }
    if (password.length < 6) {
      showWarning("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      showWarning("Contraseñas no coinciden", "Las contraseñas ingresadas no son iguales.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({ email: email.trim(), password });
      setSuccessMessage(response.data?.message || "Registro exitoso");
      setTimeout(() => {
        navigate("/check-email", { state: { email: email.trim() } });
      }, 800);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error en el registro";
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
        <div className="auth-card">
          <h2 className="auth-card__title">Crear cuenta</h2>
          <p className="auth-card__subtitle">Regístrate para empezar a comprar.</p>
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
              <label className="auth-field__label" htmlFor="reg-email">
                Email
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
                <input
                  id="reg-email"
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
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-password">
                Contraseña
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="reg-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
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
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-confirm">
                Confirmar contraseña
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="reg-confirm"
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
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>
          <div className="auth-divider">
            <span>¿Ya tienes una cuenta?</span>
            <Link to="/login" className="auth-link">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
