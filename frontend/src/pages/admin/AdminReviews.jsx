import { useEffect, useState, useRef, useMemo } from "react";
import { getAdminReviews, deleteReview } from "../../api/reviews";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import ReviewTable from "../../components/admin/ReviewTable";
import ReviewRating from "../../components/admin/ReviewRating";
import Pagination from "../../components/Pagination";
import useDebounce from "../../hooks/useDebounce";

const PAGE_SIZE = 8;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingReview, setViewingReview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statsData, setStatsData] = useState({ averageRating: null, totalFiveStar: 0, totalOneStar: 0 });
  const tableRef = useRef(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAdminReviews({ limit: 100 });
        if (!cancelled) {
          setReviews(res.data?.data || []);
          setStatsData(res.data?.stats || { averageRating: null, totalFiveStar: 0, totalOneStar: 0 });
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar reseñas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return reviews;
    const q = debouncedSearch.toLowerCase().trim();
    return reviews.filter(
      (r) =>
        (r.product?.name && r.product.name.toLowerCase().includes(q)) ||
        (r.user?.email && r.user.email.toLowerCase().includes(q)) ||
        ((r.user?.firstName || r.user?.lastName) && `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim().toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q))
    );
  }, [reviews, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function refreshReviews() {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminReviews({ limit: 100 });
      setReviews(res.data?.data || []);
      setStatsData(res.data?.stats || { averageRating: null, totalFiveStar: 0, totalOneStar: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar reseñas");
    } finally {
      setLoading(false);
    }
  }

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
      refreshReviews();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al eliminar reseña";
      showError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const avgRating = statsData.averageRating !== null ? statsData.averageRating : "—";

  const stats = [
    {
      label: "Total reseñas",
      value: reviews.length,
      color: "teal",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      label: "Promedio general",
      value: avgRating,
      color: "amber",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "5 estrellas",
      value: statsData.totalFiveStar,
      color: "success",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "1 estrella",
      value: statsData.totalOneStar,
      color: "danger",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="ad-reviews">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Reseñas</h1>
            <p className="ad-header__subtitle">Gestiona las opiniones de tus clientes</p>
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
      <div className="ad-reviews">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Reseñas</h1>
            <p className="ad-header__subtitle">Gestiona las opiniones de tus clientes</p>
          </div>
        </div>
        <div className="ad-reviews-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => refreshReviews()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-reviews">
      <div className="ad-reviews-header">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Reseñas</h1>
            <p className="ad-header__subtitle">Gestiona las opiniones de tus clientes</p>
          </div>
        </div>
      </div>

      <div className="ad-products-stats" ref={tableRef}>
        {stats.map((s, i) => (
          <div key={s.label} className={`ad-card ad-card--${s.color}`} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="ad-card__top">
              <div className="ad-card__icon">{s.icon}</div>
            </div>
            <div className="ad-card__value">{s.value}</div>
            <div className="ad-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ad-products-toolbar">
        <div className="ad-products-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por producto, nombre o comentario..."
            className="ad-products-search__input"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              className="ad-products-search__clear"
              onClick={() => { setSearch(""); setPage(1); }}
              aria-label="Limpiar búsqueda"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div className="ad-products-count">
          <span className="ad-products-count__num">{filtered.length}</span>
          <span className="ad-products-count__label">{filtered.length === 1 ? "reseña" : "reseñas"}</span>
        </div>
      </div>

      <ReviewTable
        reviews={paged}
        onView={handleView}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
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
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__header">
          <div className="ad-modal__header-icon">⭐</div>
          <div className="ad-modal__header-text">
            <h2 className="ad-modal__title">Detalles de la reseña</h2>
            <p className="ad-modal__subtitle">Reseña de producto</p>
          </div>
          <button className="ad-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ad-modal__body">
          {review.product && (
            <div className="ad-modal__media-row">
              <div className="ad-modal__media-thumb">
                {review.product.imageUrl ? (
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
                  className="ad-modal__media-thumb"
                  style={{ display: review.product.imageUrl ? "none" : "flex", position: "absolute" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </span>
              </div>
              <div className="ad-modal__media-info">
                <span className="ad-modal__media-label">Producto</span>
                <span className="ad-modal__media-name">{review.product.name}</span>
              </div>
            </div>
          )}

          <div className="ad-modal__grid">
            <div className="ad-modal__field">
              <span className="ad-modal__label">Usuario</span>
              <span className="ad-modal__value">{(review.user?.firstName || review.user?.lastName) ? `${review.user.firstName || ""} ${review.user.lastName || ""}`.trim() : review.user?.email || "—"}</span>
            </div>
            <div className="ad-modal__field">
              <span className="ad-modal__label">Calificación</span>
              <span className="ad-modal__value">
                <ReviewRating rating={review.rating} size={18} />
              </span>
            </div>
            <div className="ad-modal__field ad-modal__field--full">
              <span className="ad-modal__label">Fecha</span>
              <span className="ad-modal__value ad-modal__value--muted">
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

          {review.comment && (
            <>
              <div className="ad-modal__separator" />
              <h4 className="ad-modal__section-title">Comentario</h4>
              <p className="ad-modal__comment">{review.comment}</p>
            </>
          )}
        </div>

        <div className="ad-modal__footer">
          <button className="ad-modal__btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
