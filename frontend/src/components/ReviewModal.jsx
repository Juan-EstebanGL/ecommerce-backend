import { useEffect, useState, useRef } from "react";
import { showError } from "../utils/alerts";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="rm-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rm-star ${star <= (hovered || value) ? "rm-star--active" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ isOpen, onClose, onSubmit, initialRating, initialComment, loading, title }) {
  const [rating, setRating] = useState(initialRating || 0);
  const [comment, setComment] = useState(initialComment || "");
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating || 0);
      setComment(initialComment || "");
    }
  }, [isOpen, initialRating, initialComment]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (rating === 0) {
      showError("Selecciona una calificación");
      return;
    }
    if (!comment.trim()) {
      showError("El comentario no puede estar vacío");
      return;
    }
    await onSubmit({ rating, comment: comment.trim() });
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="rm-modal">
        <button className="rm-close" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="rm-title">{title || "Reseña"}</h2>

        <div className="rm-field">
          <label className="rm-label">Calificación</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div className="rm-field">
          <label className="rm-label">Comentario</label>
          <textarea
            className="rm-textarea"
            value={comment}
            onChange={(e) => {
              if (e.target.value.length <= 500) setComment(e.target.value);
            }}
            placeholder="Comparte tu experiencia con este producto..."
            rows={4}
          />
          <span className="rm-counter">{comment.length} / 500</span>
        </div>

        <button
          className="rm-submit"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <span className="rm-btn-inner">
              <span className="rm-spinner" />
              Publicando...
            </span>
          ) : (
            title?.includes("Editar") ? "Actualizar reseña" : "Publicar reseña"
          )}
        </button>
      </div>
    </div>
  );
}

export default ReviewModal;
