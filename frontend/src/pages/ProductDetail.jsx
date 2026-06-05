import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProducts } from "../api/products";
import { addToCart } from "../api/cart";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState("");
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await getProductById(id);
        setProduct(response.data);
        setQuantity(1);

        // Load related products
        try {
          const allProducts = await getProducts();
          const others = (allProducts.data || [])
            .filter((p) => p.id !== response.data.id)
            .slice(0, 4);
          setRelatedProducts(others);
        } catch {
          setRelatedProducts([]);
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

  const handleQuantityChange = (newQuantity) => {
    const min = 1;
    const max = product?.stock || 0;
    if (newQuantity >= min && newQuantity <= max) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setCartLoading(true);
    setCartError("");
    setCartSuccess("");

    try {
      await addToCart(product.id, quantity);
      setCartSuccess(`${quantity} ${quantity === 1 ? "producto" : "productos"} agregados al carrito`);
      setQuantity(1);
      setTimeout(() => setCartSuccess(""), 4000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Error al agregar al carrito";
      setCartError(msg);
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="app-container">
        <h1>Detalle del producto</h1>
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-container">
        <h1>Detalle del producto</h1>
        <p className="form-error">{error}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="app-container">
        <h1>Detalle del producto</h1>
        <p>Producto no encontrado.</p>
      </main>
    );
  }

  const isAvailable = product.stock > 0;

  return (
    <main>
      <div className="app-container">
        {/* Product Detail Section */}
        <div className="product-detail">
          {/* Left: Image */}
          <div className="product-detail__media">
            <div className="product-media" style={{ height: 400 }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "3rem" }}>
                  {product.name?.slice(0, 1) || "P"}
                </div>
              )}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="product-detail__info">
            <h1 style={{ marginTop: 0, marginBottom: 12 }}>{product.name}</h1>

            {/* Availability Badge */}
            <div style={{ marginBottom: 20 }}>
              {isAvailable ? (
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "#ecfdf5",
                    color: "#16a34a",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  ✓ Disponible
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "#fff1f2",
                    color: "#b91c1c",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  Sin stock
                </span>
              )}
            </div>

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 4 }}>Precio</div>
              <div className="product-price" style={{ fontSize: "2rem" }}>
                ${product.price}
              </div>
            </div>

            {/* Stock Info */}
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                Stock disponible: <strong>{product.stock}</strong>
              </p>
            </div>

            {/* Quantity Selector */}
            {isAvailable && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 8 }}>Cantidad</div>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <div className="quantity-display">{quantity}</div>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            {cartSuccess && <p style={{ color: "#16a34a", marginBottom: 12 }}>✓ {cartSuccess}</p>}
            {cartError && <p className="form-error" style={{ marginBottom: 12 }}>{cartError}</p>}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!isAvailable || cartLoading}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "1rem",
              }}
            >
              {!isAvailable
                ? "No disponible"
                : cartLoading
                ? "Agregando..."
                : `Agregar al carrito${quantity > 1 ? ` (${quantity})` : ""}`}
            </Button>

            {/* Description */}
            {product.description && (
              <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #e5e7eb" }}>
                <h3 style={{ marginTop: 0 }}>Descripción</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid #e5e7eb" }}>
            <h2 style={{ marginBottom: 24 }}>También te puede interesar</h2>
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
