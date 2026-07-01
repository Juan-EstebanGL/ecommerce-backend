import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Button from "../components/Button";
import { showWarning } from "../utils/alerts";

const ROLES = {
  admin: "Administrador",
  user: "Usuario",
  moderator: "Moderador",
};

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const avatarLetter = user.email?.charAt(0).toUpperCase() || "U";
  const displayName = user.name || user.email?.split("@")[0] || "Usuario";
  const roleLabel = ROLES[user.role?.toLowerCase()] || user.role || "Usuario";
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  function handleChangePassword() {
    showWarning(
      "Cambiar contraseña",
      "Esta funcionalidad estará disponible próximamente."
    );
  }

  return (
    <main className="pf-page">
      <div className="app-container">
        <div className="pf-layout">
          <aside className="pf-sidebar">
            <div className="pf-card pf-card--user">
              <div className="pf-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={displayName} />
                ) : (
                  <span className="pf-avatar__letter">{avatarLetter}</span>
                )}
              </div>
              <h2 className="pf-user__name">{displayName}</h2>
              <p className="pf-user__email">{user.email}</p>
              <span className="pf-user__role">{roleLabel}</span>
              {createdDate && (
                <p className="pf-user__date">
                  Registrado el {createdDate}
                </p>
              )}
            </div>

            <div className="pf-actions">
              <Button onClick={() => navigate("/orders")}>
                Ir a mis pedidos
              </Button>
              <Button onClick={() => navigate("/products")} variant="ghost">
                Seguir comprando
              </Button>
              <button
                className="pf-logout-btn"
                onClick={() => logout()}
              >
                Cerrar sesión
              </button>
            </div>
          </aside>

          <div className="pf-main">
            <div className="pf-card">
              <div className="pf-card__header">
                <div className="pf-card__icon pf-card__icon--account">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="pf-card__title">Cuenta</h3>
              </div>
              <div className="pf-card__body">
                <div className="pf-field">
                  <span className="pf-field__label">Email</span>
                  <span className="pf-field__value">{user.email}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-field__label">Estado</span>
                  <span className="pf-field__badge pf-field__badge--active">
                    Autenticado
                  </span>
                </div>
              </div>
            </div>

            <div className="pf-card">
              <div className="pf-card__header">
                <div className="pf-card__icon pf-card__icon--security">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <h3 className="pf-card__title">Seguridad</h3>
              </div>
              <div className="pf-card__body">
                <p className="pf-card__desc">
                  Puedes cambiar tu contraseña en cualquier momento para mantener tu cuenta segura.
                </p>
                <button className="pf-action-btn" onClick={handleChangePassword}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Cambiar contraseña
                </button>
              </div>
            </div>

            <div className="pf-card">
              <div className="pf-card__header">
                <div className="pf-card__icon pf-card__icon--prefs">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                </div>
                <h3 className="pf-card__title">Preferencias</h3>
              </div>
              <div className="pf-card__body">
                <div className="pf-field">
                  <span className="pf-field__label">Tema</span>
                  <span className="pf-field__value">Claro</span>
                </div>
                <div className="pf-field">
                  <span className="pf-field__label">Idioma</span>
                  <span className="pf-field__value">Español</span>
                </div>
                <div className="pf-field">
                  <span className="pf-field__label">Notificaciones</span>
                  <span className="pf-field__value">Activadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
