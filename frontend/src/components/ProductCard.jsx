import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import QuantityInput from "./QuantityInput";

function ProductCard({ product, onAddToCart, addingId }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const isAvailable = product.stock > 0;

  const handleAdd = () => {
    if (!onAddToCart) return;
    onAddToCart(product.id, quantity);
    setQuantity(1);
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
        <QuantityInput value={quantity} min={1} max={product.stock} onChange={setQuantity} />
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
