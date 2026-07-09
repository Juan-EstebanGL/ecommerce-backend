import ReviewRating from "./ReviewRating";

const placeholderImg = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function ReviewTable({ reviews, onView, onDelete, deletingId }) {
  if (!reviews.length) {
    return (
      <div className="ad-reviews-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
        <p>No hay reseñas registradas</p>
      </div>
    );
  }

  return (
    <div className="ad-reviews-table-wrapper">
      <table className="ad-reviews-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Usuario</th>
            <th>Calificación</th>
            <th>Comentario</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => {
            const isDeleting = deletingId === review.id;

            return (
              <tr key={review.id} className={isDeleting ? "ad-delete--fade-out" : ""}>
                <td>
                  <div className="ad-reviews-cell-product">
                    <div className="ad-reviews-product-thumb">
                      {review.product?.imageUrl ? (
                        <img src={review.product.imageUrl} alt={review.product.name} />
                      ) : (
                        <span className="ad-reviews-product-thumb__placeholder">{placeholderImg}</span>
                      )}
                    </div>
                    <span className="ad-reviews-product-name">{review.product?.name || "—"}</span>
                  </div>
                </td>
                <td>
                  <div className="ad-reviews-cell-user">
                    <div className="ad-reviews-user-avatar">
                      <span>{(review.user?.email?.charAt(0) || "?").toUpperCase()}</span>
                    </div>
                    <span className="ad-reviews-user-email">{review.user?.email || "—"}</span>
                  </div>
                </td>
                <td>
                  <ReviewRating rating={review.rating} />
                </td>
                <td>
                  <div className="ad-reviews-cell-comment" title={review.comment}>
                    {review.comment}
                  </div>
                </td>
                <td className="ad-reviews-cell-date">
                  {new Date(review.createdAt).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  <div className="ad-reviews-actions">
                    <button
                      className="ad-reviews-btn ad-reviews-btn--view"
                      title="Ver reseña"
                      onClick={() => onView(review)}
                      disabled={isDeleting}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="ad-reviews-btn ad-reviews-btn--delete"
                      title="Eliminar reseña"
                      onClick={() => onDelete(review.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="ad-delete__spinner" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
