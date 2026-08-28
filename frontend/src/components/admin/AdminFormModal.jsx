export default function AdminFormModal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="ad-form-overlay" onClick={onClose}>
      <div className="ad-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-form-modal__header">
          <h2>{title}</h2>
          <button className="ad-form-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
