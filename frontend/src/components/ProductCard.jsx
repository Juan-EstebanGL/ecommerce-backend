import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuantityInput from "./QuantityInput";
import { useFavoriteContext } from "../context/FavoriteContext";
import { showSuccess } from "../utils/alerts";

const CartIcon = () => (
  <svg className="pc__cart-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const ImageIcon = () => (
  <svg className="pc__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

function ProductCard({ product, onAddToCart, addingId }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoriteContext();
  const [quantity, setQuantity] = useState(1);
  const [favAnimating, setFavAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isAvailable = product.stock > 0;
  const isFav = isFavorite(product.id);

  const handleToggleFav = async (e) => {
    e.stopPropagation();
    const wasFavorite = isFav;
    const success = await toggleFavorite(product.id);

    if (success) {
      showSuccess(wasFavorite ? "Producto eliminado de favoritos" : "Producto agregado a favoritos");
      setFavAnimating(true);
      setTimeout(() => setFavAnimating(false), 350);
    }
  };

  const stockStatus = isAvailable
    ? product.stock <= 5
      ? { label: "Poco stock", className: "pc__stock--low", dot: "pc__dot--low" }
      : { label: "Disponible", className: "pc__stock--available", dot: "pc__dot--available" }
    : { label: "Agotado", className: "pc__stock--empty", dot: "pc__dot--empty" };

  const formattedPrice = Number(product.price).toLocaleString("es-CO");

  const handleAdd = () => {
    if (!onAddToCart) return;
    onAddToCart(product.id, quantity);
    setQuantity(1);
  };

  return (
    <article className={`pc${!onAddToCart ? " pc--browse-only" : ""}`}>
      <div
        className="pc__media"
        onClick={() => navigate(`/products/${product.id}`)}
        role="link"
        tabIndex={0}
        aria-label={`Ver detalle de ${product.name}`}
      >
        {product.imageUrl && !imgError ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="pc__placeholder">
            <ImageIcon />
          </div>
        )}
        <button
          className={`pc__fav-btn ${isFav ? "pc__fav-btn--active" : ""} ${favAnimating ? "pc__fav-btn--animate" : ""}`}
          onClick={handleToggleFav}
          aria-label={isFav ? "Eliminar de favoritos" : "Agregar a favoritos"}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>
      <div className="pc__body">
        <h3 className="pc__name">{product.name}</h3>
        <div className="pc__price">${formattedPrice}</div>
        <div className={`pc__stock ${stockStatus.className}`}>
          <span className={`pc__dot ${stockStatus.dot}`} />
          <span>{stockStatus.label}</span>
        </div>
        {isAvailable ? (
          <div className="pc__actions">
            <div className="pc__qty">
              <QuantityInput value={quantity} min={1} max={product.stock} onChange={setQuantity} />
            </div>
            <button
              className="pc__add-btn"
              disabled={addingId === product.id}
              onClick={handleAdd}
            >
              {addingId === product.id ? (
                <span className="pc__btn-inner">
                  <span className="pc__spinner" />
                  Agregando...
                </span>
              ) : (
                <span className="pc__btn-inner">
                  <CartIcon />
                  Agregar{quantity > 1 ? ` (${quantity})` : ""}
                </span>
              )}
            </button>
          </div>
        ) : (
          <button className="pc__add-btn pc__add-btn--sold-out" disabled>
            Agotado
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
