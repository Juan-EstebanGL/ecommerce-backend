import { useEffect, useState, useRef } from "react";
import { getAdminReviews, deleteReview } from "../../api/reviews";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import ReviewTable from "../../components/admin/ReviewTable";
import ReviewRating from "../../components/admin/ReviewRating";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 8;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingReview, setViewingReview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const tableRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAdminReviews({ page, limit: PAGE_SIZE });
        if (!cancelled) {
          setReviews(res.data?.data || []);
          setTotal(res.data?.total || 0);
          setTotalPages(res.data?.totalPages || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar reseñas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

  function handlePageChange(newPage) {
    setPage(newPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleView(review) {
    setViewingReview(review);
  }

  async function handleDelete(reviewId) {
    const result = await showConfirm(
      "¿Eliminar reseña?",
      "Esta acción eliminará permanentemente la reseña."
    );

    if (!result.isConfirmed) return;

    setDeletingId(reviewId);

    try {
      await deleteReview(reviewId);
      showSuccess("Reseña eliminada correctamente");
      const res = await getAdminReviews({ page, limit: PAGE_SIZE });
      setReviews(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al eliminar reseña";
      showError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const fiveStars = reviews.filter((r) => r.rating === 5).length;
  const oneStar = reviews.filter((r) => r.rating === 1).length;

  const stats = [
    {
      label: "Total reseñas",
      value: total,
      color: "teal",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      label: "Promedio general",
      value: avgRating,
      color: "amber",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "5 estrellas",
      value: fiveStars,
      color: "success",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "1 estrella",
      value: oneStar,
      color: "danger",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Reseñas</h1>
            <p className="ad-header__subtitle">Administración de reseñas</p>
          </div>
        </div>
        <div className="ad-reviews-loader">
          <div className="ad-reviews-loader__spinner" />
          <p>Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Reseñas</h1>
            <p className="ad-header__subtitle">Administración de reseñas</p>
          </div>
        </div>
        <div className="ad-reviews-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-reviews">
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">Reseñas</h1>
          <p className="ad-header__subtitle">Administración de reseñas</p>
        </div>
      </div>

      <div className="ad-stats ad-reviews-stats" ref={tableRef}>
        {stats.map((s) => (
          <div key={s.label} className={`ad-card ad-card--${s.color}`}>
            <div className="ad-card__top">
              <div className="ad-card__icon">{s.icon}</div>
            </div>
            <div className="ad-card__value">{s.value}</div>
            <div className="ad-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <ReviewTable
        reviews={reviews}
        onView={handleView}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <ReviewViewModal review={viewingReview} onClose={() => setViewingReview(null)} />
    </div>
  );
}

function ReviewViewModal({ review, onClose }) {
  if (!review) return null;

  return (
    <div className="ad-reviews-modal-overlay" onClick={onClose}>
      <div className="ad-reviews-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-reviews-modal__header">
          <h2>Detalles de la reseña</h2>
          <button className="ad-reviews-modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="ad-reviews-modal__body">
          <div className="ad-reviews-modal__product">
            <div className="ad-reviews-modal__product-thumb">
              {review.product?.imageUrl ? (
                <img
                  src={review.product.imageUrl}
                  alt={review.product.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="ad-reviews-modal__product-placeholder"
                style={{ display: review.product?.imageUrl ? "none" : "flex" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
            </div>
            <div className="ad-reviews-modal__product-info">
              <span className="ad-reviews-modal__product-label">Producto</span>
              <span className="ad-reviews-modal__product-name">{review.product?.name || "—"}</span>
            </div>
          </div>

          <div className="ad-reviews-modal__field">
            <span className="ad-reviews-modal__label">Usuario</span>
            <span className="ad-reviews-modal__value">{review.user?.email || "—"}</span>
          </div>

          <div className="ad-reviews-modal__field">
            <span className="ad-reviews-modal__label">Calificación</span>
            <ReviewRating rating={review.rating} size={20} />
          </div>

          <div className="ad-reviews-modal__field">
            <span className="ad-reviews-modal__label">Comentario</span>
            <p className="ad-reviews-modal__comment">{review.comment}</p>
          </div>

          <div className="ad-reviews-modal__field">
            <span className="ad-reviews-modal__label">Fecha</span>
            <span className="ad-reviews-modal__value">
              {new Date(review.createdAt).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
