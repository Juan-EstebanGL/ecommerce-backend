import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuantityInput from "./QuantityInput";

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
  const [quantity, setQuantity] = useState(1);
  const isAvailable = product.stock > 0;

  const mockRating = ((product.id * 7) % 3) + 3;
  const mockReviews = ((product.id * 13) % 50) + 10;
  const mockBadge = product.id % 5 === 0 ? "Nuevo" : product.id % 7 === 0 ? "Más vendido" : null;

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
    <article className="pc">
      <div className="pc__media" onClick={() => navigate(`/products/${product.id}`)}>
        {mockBadge && (
          <span className={`pc__badge pc__badge--${mockBadge === "Nuevo" ? "new" : "bestseller"}`}>
            {mockBadge}
          </span>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="pc__placeholder">
            <ImageIcon />
          </div>
        )}
      </div>
      <div className="pc__body">
        <div className="pc__stars">
          <span className="pc__stars-value">{'★'.repeat(mockRating)}{'☆'.repeat(5 - mockRating)}</span>
          <span className="pc__reviews">({mockReviews} reseñas)</span>
        </div>
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
