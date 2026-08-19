import { useEffect, useRef, useState } from "react";
import AuthSidePanel from "../components/AuthSidePanel";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { verifyEmailErrorMessages as ERROR_MESSAGES } from "../utils/errorMessages";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [errorMsg, setErrorMsg] = useState(
    token
      ? null
      : {
          title: "Token no encontrado",
          desc: "El enlace de verificación no contiene un token válido.",
        }
  );
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!token) return;

    const currentRequest = ++requestIdRef.current;

    verifyEmail(token)
      .then(() => {
        if (requestIdRef.current !== currentRequest) return;
        setStatus("success");

        try {
          const bc = new BroadcastChannel("auth_verification");
          bc.postMessage({ type: "email-verified" });
          bc.close();
        } catch {
          // BroadcastChannel no soportado: el auto-login se omite y el usuario inicia sesión manualmente
        }
      })
      .catch((err) => {
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
  }, [searchParams, token]);

  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <main className="auth-page">
      <AuthSidePanel />
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
