import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { showWarning } from "../utils/alerts";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  filterPhoneDigits,
} from "../utils/validators";

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const errors = useMemo(() => ({
    firstName: touched.firstName ? validateFirstName(firstName) : "",
    lastName: touched.lastName ? validateLastName(lastName) : "",
    email: touched.email ? validateEmail(email) : "",
    phone: touched.phone ? validatePhone(phone) : "",
    password: touched.password ? validatePassword(password) : "",
    confirmPassword: touched.confirmPassword ? validateConfirmPassword(confirmPassword, password) : "",
  }), [firstName, lastName, email, phone, password, confirmPassword, touched]);

  const isValid = useMemo(() => {
    return (
      !validateFirstName(firstName) &&
      !validateLastName(lastName) &&
      !validateEmail(email) &&
      !validatePhone(phone) &&
      !validatePassword(password) &&
      !validateConfirmPassword(confirmPassword, password)
    );
  }, [firstName, lastName, email, phone, password, confirmPassword]);

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handlePhoneChange(e) {
    setPhone(filterPhoneDigits(e.target.value));
  }

  function inputClass(field, baseExtra = "") {
    const base = `auth-input${baseExtra ? ` ${baseExtra}` : ""}`;
    if (!touched[field]) return base;
    if (errors[field]) return `${base} auth-input--error`;
    return `${base} auth-input--valid`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const allTouched = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    const fErr = validateFirstName(firstName);
    const lErr = validateLastName(lastName);
    const eErr = validateEmail(email);
    const pErr = validatePhone(phone);
    const pwErr = validatePassword(password);
    const cErr = validateConfirmPassword(confirmPassword, password);

    if (fErr) { showWarning("Campo requerido", fErr); return; }
    if (lErr) { showWarning("Campo requerido", lErr); return; }
    if (eErr) { showWarning("Email inválido", eErr); return; }
    if (pErr) { showWarning("Teléfono inválido", pErr); return; }
    if (pwErr) { showWarning("Contraseña débil", pwErr); return; }
    if (cErr) { showWarning("Contraseñas no coinciden", cErr); return; }

    setLoading(true);

    try {
      const response = await register({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      setSuccessMessage(response.data?.message || "Registro exitoso");
      setTimeout(() => {
        navigate("/check-email", { state: { email: email.trim().toLowerCase() } });
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
            {/* Nombre */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-firstName">
                Nombre
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="reg-firstName"
                  className={inputClass("firstName")}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => markTouched("firstName")}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  required
                  aria-label="Nombre"
                />
              </div>
              {errors.firstName && <span className="auth-field__err">{errors.firstName}</span>}
            </div>
            {/* Apellido */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-lastName">
                Apellido
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="reg-lastName"
                  className={inputClass("lastName")}
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => markTouched("lastName")}
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  required
                  aria-label="Apellido"
                />
              </div>
              {errors.lastName && <span className="auth-field__err">{errors.lastName}</span>}
            </div>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-email">
                Correo electrónico
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
                <input
                  id="reg-email"
                  className={inputClass("email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  aria-label="Correo electrónico"
                />
              </div>
              {errors.email && <span className="auth-field__err">{errors.email}</span>}
            </div>
            {/* Teléfono */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-phone">
                Teléfono
              </label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <input
                  id="reg-phone"
                  className={inputClass("phone")}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => markTouched("phone")}
                  placeholder="Ej: 912345678"
                  autoComplete="tel"
                  required
                  aria-label="Teléfono"
                />
              </div>
              {errors.phone && <span className="auth-field__err">{errors.phone}</span>}
            </div>
            {/* Contraseña */}
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
                  className={inputClass("password")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched("password")}
                  placeholder="Mínimo 8 caracteres"
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
              {errors.password && <span className="auth-field__err">{errors.password}</span>}
            </div>
            {/* Confirmar contraseña */}
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
                  className={inputClass("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => markTouched("confirmPassword")}
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
              {errors.confirmPassword && <span className="auth-field__err">{errors.confirmPassword}</span>}
            </div>
            <button type="submit" className="auth-btn" disabled={loading || !isValid}>
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
