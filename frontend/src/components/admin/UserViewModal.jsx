export default function UserViewModal({ user, onClose }) {
  if (!user) return null;

  const roleBadge =
    user.role === "ADMIN"
      ? { cls: "ad-modal__badge--info", label: "Administrador" }
      : { cls: "ad-modal__badge--neutral", label: "Usuario" };

  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__header">
          <div className="ad-modal__header-icon">👤</div>
          <div className="ad-modal__header-text">
            <h2 className="ad-modal__title">Detalles del usuario</h2>
            <p className="ad-modal__subtitle">Información de la cuenta</p>
          </div>
          <button className="ad-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ad-modal__body">
          <div className="ad-modal__grid">
            <div className="ad-modal__field ad-modal__field--full">
              <span className="ad-modal__label">Correo electrónico</span>
              <span className="ad-modal__value">{user.email}</span>
            </div>
            <div className="ad-modal__field">
              <span className="ad-modal__label">Rol</span>
              <span className="ad-modal__value">
                <span className={`ad-modal__badge ${roleBadge.cls}`}>
                  <span className="ad-modal__badge-dot" />
                  {roleBadge.label}
                </span>
              </span>
            </div>
            <div className="ad-modal__field">
              <span className="ad-modal__label">Estado</span>
              <span className="ad-modal__value">
                <span className="ad-modal__badge ad-modal__badge--success">
                  <span className="ad-modal__badge-dot" />
                  Activo
                </span>
              </span>
            </div>
            <div className="ad-modal__field ad-modal__field--full">
              <span className="ad-modal__label">Fecha de creación</span>
              <span className="ad-modal__value ad-modal__value--muted">
                {new Date(user.createdAt).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="ad-modal__footer">
          <button className="ad-modal__btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
