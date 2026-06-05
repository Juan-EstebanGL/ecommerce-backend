import { useNavigate } from "react-router-dom";
import Button from "./Button";

function ProductCard({ product, onAddToCart, addingId }) {
  const navigate = useNavigate();

  return (
    <article className="product-card">
      <div className="product-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div style={{textAlign:'center',color:'#9ca3af'}}>{product.name?.slice(0,1) || 'P'}</div>
        )}
      </div>
      <div>
        <div className="product-title">{product.name}</div>
        <div className="product-price">${product.price}</div>
        <div className="product-stock">Stock: {product.stock}</div>
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <Button onClick={() => navigate(`/products/${product.id}`)} variant="ghost">Ver</Button>
        {onAddToCart && (
          <Button disabled={addingId === product.id} onClick={() => onAddToCart(product.id)}>
            {addingId === product.id ? "Agregando..." : "Agregar"}
          </Button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
