import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

function ProductCard({ product, onAddToCart, addingId }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [qtyInput, setQtyInput] = useState("1");
  const isAvailable = product.stock > 0;

  const clampQty = (val) => Math.max(1, Math.min(val, product.stock));

  const commitQty = (raw) => {
    const parsed = parseInt(raw, 10);
    const clamped = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, product.stock);
    setQuantity(clamped);
    setQtyInput(String(clamped));
  };

  const handleQtyChange = (next) => {
    const clamped = clampQty(next);
    setQuantity(clamped);
    setQtyInput(String(clamped));
  };

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
      setQuantity(1);
      setQtyInput("1");
    }
  };

  return (
    <article className="product-card">
      <div className="product-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div style={{ textAlign: "center", color: "#9ca3af" }}>{product.name?.slice(0, 1) || "P"}</div>
        )}
      </div>
      <div>
        <div className="product-title">{product.name}</div>
        <div className="product-price">${Number(product.price).toLocaleString("es-CO")}</div>
        <div className="product-stock">Stock: {product.stock}</div>
      </div>
      {isAvailable && (
        <div className="quantity-selector">
          <button className="quantity-btn" onClick={() => handleQtyChange(quantity - 1)} disabled={quantity <= 1} aria-label="Disminuir cantidad">−</button>
          <input
            className="quantity-input"
            type="text"
            inputMode="numeric"
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            onBlur={() => commitQty(qtyInput)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitQty(qtyInput); } }}
            aria-label="Cantidad"
          />
          <button className="quantity-btn" onClick={() => handleQtyChange(quantity + 1)} disabled={quantity >= product.stock} aria-label="Aumentar cantidad">+</button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Button onClick={() => navigate(`/products/${product.id}`)} variant="ghost">Ver</Button>
        {onAddToCart && (
          <Button disabled={addingId === product.id || !isAvailable} onClick={handleAdd}>
            {!isAvailable ? "Agotado" : addingId === product.id ? "Agregando..." : `Agregar${quantity > 1 ? ` (${quantity})` : ""}`}
          </Button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
