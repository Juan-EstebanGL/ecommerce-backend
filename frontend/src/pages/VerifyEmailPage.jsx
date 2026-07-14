import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/auth";

const ERROR_MESSAGES = {
  "El token de verificación ha expirado": {
    title: "El enlace ha expirado",
    desc: "El enlace de verificación que recibiste ya no es válido porque ha pasado más de 24 horas.",
  },
  "Token de verificación inválido": {
    title: "El enlace no es válido",
    desc: "El enlace de verificación no es correcto o ya fue utilizado.",
  },
};

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMsg({
        title: "Token no encontrado",
        desc: "El enlace de verificación no contiene un token válido.",
      });
      return;
    }

    const currentRequest = ++requestIdRef.current;
    console.log(`[VerifyEmail] effect fired, requestId=${currentRequest}`);

    verifyEmail(token)
      .then(() => {
        console.log(`[VerifyEmail] success, requestId=${currentRequest}, current=${requestIdRef.current}`);
        if (requestIdRef.current !== currentRequest) return;
        setStatus("success");

        try {
          const bc = new BroadcastChannel("auth_verification");
          bc.postMessage({ type: "email-verified" });
          bc.close();
        } catch {}
      })
      .catch((err) => {
        console.log(`[VerifyEmail] error, requestId=${currentRequest}, current=${requestIdRef.current}`, err?.response?.data?.message);
        if (requestIdRef.current !== currentRequest) return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Ocurrió un error al verificar tu correo";
        const mapped = ERROR_MESSAGES[message];
        setErrorMsg(
          mapped || { title: "No se pudo verificar tu correo", desc: message }
        );
        setStatus("error");
      });
  }, [searchParams]);

  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

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
        <div className="auth-card ve-card">
          {status === "loading" && (
            <div className="ve-state">
              <div className="ve-spinner" />
              <p className="ve-state__text">Verificando tu correo electrónico...</p>
            </div>
          )}

          {status === "success" && (
            <div className="ve-state">
              <div className="ve-icon ve-icon--success">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="ve-state__title">Correo verificado</h2>
              <p className="ve-state__desc">
                Tu correo fue verificado correctamente. Serás redirigido al inicio de sesión...
              </p>
            </div>
          )}

          {status === "error" && (
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
              <Link to="/check-email" className="auth-btn ve-btn">
                Solicitar un nuevo enlace
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default VerifyEmailPage;
