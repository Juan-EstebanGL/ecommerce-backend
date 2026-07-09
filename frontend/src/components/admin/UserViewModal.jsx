export default function UserViewModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="ad-users-modal-overlay" onClick={onClose}>
      <div className="ad-users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-users-modal__header">
          <h2>Detalles del usuario</h2>
          <button className="ad-users-modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="ad-users-modal__body">
          <div className="ad-users-modal__field">
            <span className="ad-users-modal__label">ID</span>
            <span className="ad-users-modal__value">{user.id}</span>
          </div>
          <div className="ad-users-modal__field">
            <span className="ad-users-modal__label">Correo electrónico</span>
            <span className="ad-users-modal__value">{user.email}</span>
          </div>
          <div className="ad-users-modal__field">
            <span className="ad-users-modal__label">Rol</span>
            <span className="ad-users-modal__value">{user.role}</span>
          </div>
          <div className="ad-users-modal__field">
            <span className="ad-users-modal__label">Fecha de creación</span>
            <span className="ad-users-modal__value">
              {new Date(user.createdAt).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
