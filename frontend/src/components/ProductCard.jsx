import { useNavigate } from "react-router-dom";
import Button from "./Button";

function ProductCard({ product, onAddToCart, addingId }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "4px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h3>{product.name}</h3>
      <p>Precio: ${product.price}</p>
      <p>Stock: {product.stock}</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <Button onClick={() => navigate(`/products/${product.id}`)}>
          Ver detalle
        </Button>
        {onAddToCart && (
          <Button disabled={addingId === product.id} onClick={() => onAddToCart(product.id)}>
            {addingId === product.id ? "Agregando..." : "Agregar al carrito"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
