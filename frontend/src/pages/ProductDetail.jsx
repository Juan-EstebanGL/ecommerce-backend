import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, getProducts } from "../api/products";
import { addToCart } from "../api/cart";
import Loader from "../components/Loader";
import Button from "../components/Button";
import Card from "../components/Card";
import ProductCard from "../components/ProductCard";
import { showSuccess, showError } from "../utils/alerts";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [qtyInput, setQtyInput] = useState("1");
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
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

  const clampQty = (val) => Math.max(1, Math.min(val, product?.stock || 0));

  const commitQty = (raw) => {
    const parsed = parseInt(raw, 10);
    const max = product?.stock || 0;
    const clamped = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, max);
    setQuantity(clamped);
    setQtyInput(String(clamped));
  };

  const handleQuantityChange = (newQuantity) => {
    const max = product?.stock || 0;
    if (newQuantity >= 1 && newQuantity <= max) {
      setQuantity(newQuantity);
      setQtyInput(String(newQuantity));
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setCartLoading(true);

    try {
      await addToCart(product.id, quantity);
      const msg = `${quantity} ${quantity === 1 ? "producto" : "productos"} agregados al carrito`;
      showSuccess(msg);
      setQuantity(1);
      setQtyInput("1");
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Error al agregar al carrito");
    } finally {
      setCartLoading(false);
    }
  };

  const formatPrice = (price) => Number(price).toLocaleString("es-CO");

  const getStockInfo = (stock) => {
    if (stock === 0) return { text: "Agotado", className: "badge--CANCELLED" };
    if (stock <= 5) return { text: "Pocas unidades", className: "badge--PENDING" };
    return { text: "Disponible", className: "badge--PAID" };
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
  const stockInfo = getStockInfo(product.stock);

  return (
    <main>
      <div className="app-container">
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/products">Productos</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">{product.name}</span>
        </nav>

        <div className="product-layout">
          <div className="product-gallery">
            <div className="product-image">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="product-image__placeholder" aria-hidden>
                  {product.name?.slice(0, 1) || "P"}
                </div>
              )}
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-info__name">{product.name}</h1>

            <div className="product-stock">
              <span className={`badge ${stockInfo.className}`}>{stockInfo.text}</span>
              {isAvailable && (
                <span className="product-stock__count">{product.stock} en stock</span>
              )}
            </div>

            <div className="product-price">
              <span className="product-price__value">${formatPrice(product.price)}</span>
            </div>

            <p className="product-info__description">
              {product.description || "Producto sin descripción."}
            </p>

            {isAvailable && (
              <div className="product-info__actions">
                <label className="quantity-label" id="quantity-label">Cantidad</label>
                  <div className="quantity-selector" role="group" aria-labelledby="quantity-label">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>
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
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    fontSize: "1.05rem",
                  }}
                >
                  {cartLoading ? "Agregando..." : `Agregar al carrito${quantity > 1 ? ` (${quantity})` : ""}`}
                </Button>
              </div>
            )}
          </div>
        </div>

        <section className="product-extra">
          <h2 className="product-extra__title">¿Por qué comprar este producto?</h2>
          <div className="product-extra__grid">
            <div className="product-extra__item">
              <span className="product-extra__icon">✓</span>
              <div>
                <strong>Compra segura</strong>
                <p>Pago 100% protegido</p>
              </div>
            </div>
            <div className="product-extra__item">
              <span className="product-extra__icon">✓</span>
              <div>
                <strong>Envío rápido</strong>
                <p>Entrega en 2-3 días hábiles</p>
              </div>
            </div>
            <div className="product-extra__item">
              <span className="product-extra__icon">✓</span>
              <div>
                <strong>Garantía de calidad</strong>
                <p>Productos verificados</p>
              </div>
            </div>
            <div className="product-extra__item">
              <span className="product-extra__icon">✓</span>
              <div>
                <strong>Soporte 24/7</strong>
                <p>Atención al cliente siempre disponible</p>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>También podría interesarte</h2>
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
