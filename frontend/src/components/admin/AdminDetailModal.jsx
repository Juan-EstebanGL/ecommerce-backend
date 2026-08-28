export default function AdminDetailModal({ icon, title, subtitle, onClose, children }) {
  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__header">
          <div className="ad-modal__header-icon">{icon}</div>
          <div className="ad-modal__header-text">
            <h2 className="ad-modal__title">{title}</h2>
            <p className="ad-modal__subtitle">{subtitle}</p>
          </div>
          <button className="ad-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="ad-modal__body">{children}</div>
        <div className="ad-modal__footer">
          <button className="ad-modal__btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
