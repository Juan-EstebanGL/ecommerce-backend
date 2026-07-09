import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, getProducts } from "../api/products";
import { addToCart } from "../api/cart";
import Loader from "../components/Loader";
import Button from "../components/Button";
import Card from "../components/Card";
import ProductCard from "../components/ProductCard";
import QuantityInput from "../components/QuantityInput";
import { showSuccess, showError, showConfirm } from "../utils/alerts";
import { useCartContext } from "../context/CartContext";
import { useAuthContext } from "../context/AuthContext";
import { useFavoriteContext } from "../context/FavoriteContext";
import { getProductReviews, createReview, updateReview, deleteReview } from "../api/reviews";
import ReviewModal from "../components/ReviewModal";

const benefits = [
  { icon: "🚚", title: "Envío rápido", desc: "Entrega en 2-3 días hábiles" },
  { icon: "🔒", title: "Compra segura", desc: "Pago 100% protegido" },
  { icon: "↩", title: "Devoluciones gratis", desc: "30 días de garantía" },
  { icon: "💬", title: "Soporte 24/7", desc: "Atención personalizada" },
];

const features = [
  { title: "Material Premium", desc: "Fabricado con los más altos estándares de calidad y durabilidad." },
  { title: "Garantía Extendida", desc: "Cubre defectos de fábrica por 12 meses desde la compra." },
  { title: "Calidad Certificada", desc: "Producto certificado bajo norma internacional ISO 9001." },
  { title: "Envío Nacional", desc: "Disponible en todo el territorio colombiano." },
];

const CartIcon = () => (
  <svg className="pd-cart-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const { user } = useAuthContext();
  const { refreshCartCount } = useCartContext();
  const { isFavorite, toggleFavorite } = useFavoriteContext();
  const [favAnimating, setFavAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setReviewsLoading(true);
      setError("");

      try {
        const response = await getProductById(id);
        setProduct(response.data);
        setQuantity(1);

        try {
          const allProducts = await getProducts();
          const others = (allProducts.data || [])
            .filter((p) => p.id !== response.data.id)
            .slice(0, 4);
          setRelatedProducts(others);
        } catch {
          setRelatedProducts([]);
        }
        try {
          const reviewsRes = await getProductReviews(id);
          setReviews(reviewsRes.data);
          setReviewsError("");
        } catch {
          setReviewsError("No se pudieron cargar las reseñas.");
        } finally {
          setReviewsLoading(false);
        }
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Error al cargar el producto";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setCartLoading(true);

    try {
      await addToCart(product.id, quantity);
      refreshCartCount();
      const msg = `${quantity} ${quantity === 1 ? "producto" : "productos"} agregados al carrito`;
      showSuccess(msg);
      setQuantity(1);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Error al agregar al carrito");
    } finally {
      setCartLoading(false);
    }
  };

  const formatPrice = (price) => Number(price).toLocaleString("es-CO");

  const formatDate = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 30) return `Hace ${diffDays} días`;

    const day = String(date.getDate()).padStart(2, "0");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const renderStars = (rating) => {
    const full = "★";
    const empty = "☆";
    return full.repeat(rating) + empty.repeat(5 - rating);
  };

  const currentUserEmail = user?.email?.toLowerCase();
  const userReview = reviews.find((r) => r.user?.email?.toLowerCase() === currentUserEmail) || null;

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const refreshReviews = async () => {
    try {
      const res = await getProductReviews(id);
      setReviews(res.data);
      setReviewsError("");
    } catch {
      setReviewsError("No se pudieron cargar las reseñas.");
    }
  };

  const handleOpenReviewModal = () => {
    if (userReview) {
      setEditingReview(userReview);
    } else {
      setEditingReview(null);
    }
    setModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setModalOpen(false);
    setEditingReview(null);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    setModalLoading(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, { rating, comment });
        showSuccess("Reseña actualizada correctamente.");
      } else {
        await createReview(id, { rating, comment });
        showSuccess("Reseña publicada correctamente.");
      }
      setModalOpen(false);
      setEditingReview(null);
      await refreshReviews();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al guardar la reseña.";
      showError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await showConfirm(
      "¿Eliminar reseña?",
      "Esta acción eliminará permanentemente tu reseña.",
      "Eliminar",
      "Cancelar"
    );

    if (!result.isConfirmed) return;

    try {
      await deleteReview(reviewId);
      showSuccess("Reseña eliminada correctamente.");
      setModalOpen(false);
      setEditingReview(null);
      await refreshReviews();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al eliminar la reseña.";
      showError(msg);
    }
  };

  const handleToggleFav = async () => {
    if (!product) return;

    const wasFavorite = isFavorite(product.id);
    const success = await toggleFavorite(product.id);

    if (success) {
      showSuccess(wasFavorite ? "Producto eliminado de favoritos" : "Producto agregado a favoritos");
      setFavAnimating(true);
      setTimeout(() => setFavAnimating(false), 350);
    }
  };

  if (loading) {
    return (
      <main className="app-container">
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-container">
        <Card className="error-state">
          <p className="form-error">{error}</p>
        </Card>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="app-container">
        <Card className="error-state">
          <h2>Producto no encontrado</h2>
          <p>El producto que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate("/products")}>Volver a productos</Button>
        </Card>
      </main>
    );
  }

  const isAvailable = product.stock > 0;

  const getStockInfo = (stock) => {
    if (stock === 0) return { label: "Agotado", dotClass: "pd-dot--empty", textClass: "pd-stock--empty", extra: "Producto no disponible por el momento." };
    if (stock <= 5) return { label: "Poco stock", dotClass: "pd-dot--low", textClass: "pd-stock--low", extra: `Solo quedan ${stock} unidades.` };
    return { label: "Disponible", dotClass: "pd-dot--available", textClass: "pd-stock--available", extra: `${stock} unidades disponibles.` };
  };

  const stockInfo = getStockInfo(product.stock);

  return (
    <main className="pd-page">
      <div className="app-container">
        <nav className="pd-breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="pd-breadcrumb__sep">›</span>
          <Link to="/products">Productos</Link>
          <span className="pd-breadcrumb__sep">›</span>
          <span className="pd-breadcrumb__current">{product.name}</span>
        </nav>

        <div className="pd-layout">
          <div className="pd-gallery">
            <div className="pd-image">
              {product.imageUrl && !imgError ? (
                <img src={product.imageUrl} alt={product.name} loading="lazy" onError={() => setImgError(true)} />
              ) : (
                <div className="pd-image__placeholder">
                  <div className="pd-placeholder__bg" />
                  <div className="pd-placeholder__content">
                    <svg className="pd-placeholder__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="pd-placeholder__text">Imagen no disponible</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pd-info">
            <div className="pd-name-row">
              <h1 className="pd-name">{product.name}</h1>
              <button
                className={`pd-fav-btn ${isFavorite(product.id) ? "pd-fav-btn--active" : ""} ${favAnimating ? "pd-fav-btn--animate" : ""}`}
                onClick={handleToggleFav}
                aria-label={isFavorite(product.id) ? "Eliminar de favoritos" : "Agregar a favoritos"}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill={isFavorite(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>

            <div className="pd-price-line">
              <span className="pd-price-value">${formatPrice(product.price)}</span>
            </div>

            <div className={`pd-stock ${stockInfo.textClass}`}>
              <span className={`pd-dot ${stockInfo.dotClass}`} />
              <span className="pd-stock__label">{stockInfo.label}</span>
              <span className="pd-stock__extra">{stockInfo.extra}</span>
            </div>

            <p className="pd-description">
              {product.description || "Producto sin descripción."}
            </p>

            {isAvailable && (
              <div className="pd-actions">
                <div className="pd-qty-row">
                  <QuantityInput value={quantity} min={1} max={product.stock} onChange={setQuantity} />
                  <button
                    className="pd-add-btn"
                    disabled={cartLoading}
                    onClick={handleAddToCart}
                  >
                    {cartLoading ? (
                      <span className="pd-btn-inner">
                        <span className="pd-spinner" />
                        Agregando...
                      </span>
                    ) : (
                      <span className="pd-btn-inner">
                        <CartIcon />
                        Agregar al carrito{quantity > 1 ? ` (${quantity})` : ""}
                      </span>
                    )}
                  </button>
                </div>
                <button className="pd-back-btn" onClick={() => navigate("/products")}>
                  ← Seguir comprando
                </button>
              </div>
            )}

            <section className="pd-reviews">
              <h2 className="pd-reviews__title">Reseñas</h2>

              {averageRating !== null ? (
                <div className="pd-reviews__summary">
                  <div className="pd-reviews__average">
                    <span className="pd-reviews__stars-display">{renderStars(Math.round(averageRating))}</span>
                    <span className="pd-reviews__avg-value">{averageRating}</span>
                  </div>
                  <span className="pd-reviews__count">{reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              ) : null}

              {reviewsLoading && (
                <div className="pd-reviews__loader">
                  <Loader />
                </div>
              )}

              {reviewsError && !reviewsLoading && (
                <div className="pd-reviews__error">
                  <svg className="pd-reviews__error-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>{reviewsError}</p>
                </div>
              )}

              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <div className="pd-reviews__empty">
                  <svg className="pd-reviews__empty-icon" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h3 className="pd-reviews__empty-title">Todavía no existen reseñas para este producto.</h3>
                  <p className="pd-reviews__empty-desc">Sé el primero en compartir tu opinión.</p>
                  <button className="pd-review-btn" onClick={handleOpenReviewModal}>Escribir la primera reseña</button>
                </div>
              )}

              {!reviewsLoading && reviews.length > 0 && (
                <div className="pd-reviews__list">
                  {reviews.map((review) => (
                    <div key={review.id} className="pd-review">
                      <div className="pd-review__avatar">
                        {review.user?.email?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="pd-review__body">
                        <div className="pd-review__header">
                          <span className="pd-review__user">{review.user?.email || "Usuario"}</span>
                          {review.user?.email?.toLowerCase() === currentUserEmail && (
                            <span className="pd-review__mine">Tu reseña</span>
                          )}
                          <span className="pd-review__date">{formatDate(review.createdAt)}</span>
                        </div>
                        <span className="pd-review__stars">{renderStars(review.rating)}</span>
                        <p className="pd-review__comment">{review.comment}</p>
                        {review.user?.email?.toLowerCase() === currentUserEmail && (
                          <div className="pd-review__actions">
                            <button className="pd-review__action pd-review__action--edit" onClick={handleOpenReviewModal}>
                              <svg className="pd-review__action-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
                              Editar
                            </button>
                            <button className="pd-review__action pd-review__action--delete" onClick={() => handleDeleteReview(review.id)}>
                              <svg className="pd-review__action-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user && !reviewsLoading && !reviewsError && !userReview && (
                <div className="pd-reviews__action">
                  <button className="pd-review-btn pd-review-btn--primary" onClick={handleOpenReviewModal}>
                    Escribir reseña
                  </button>
                </div>
              )}

              <ReviewModal
                isOpen={modalOpen}
                onClose={handleCloseReviewModal}
                onSubmit={handleReviewSubmit}
                initialRating={editingReview?.rating || 0}
                initialComment={editingReview?.comment || ""}
                loading={modalLoading}
                title={editingReview ? "Editar reseña" : "Nueva reseña"}
              />
            </section>
          </div>
        </div>

        <section className="pd-section">
          <div className="pd-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="pd-benefit">
                <span className="pd-benefit__icon">{b.icon}</span>
                <div className="pd-benefit__info">
                  <strong className="pd-benefit__title">{b.title}</strong>
                  <p className="pd-benefit__desc">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pd-section">
          <h2 className="pd-section__title">Características del producto</h2>
          <div className="pd-features">
            {features.map((f, i) => (
              <div key={i} className="pd-feature">
                <div className="pd-feature__dot" />
                <div className="pd-feature__info">
                  <strong className="pd-feature__title">{f.title}</strong>
                  <p className="pd-feature__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="pd-section pd-section--related">
            <h2 className="pd-section__title">También podría interesarte</h2>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={null} addingId={null} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ProductDetail;
