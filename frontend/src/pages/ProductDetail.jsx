import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, getProducts } from "../api/products";
import { addToCart } from "../api/cart";
import Loader from "../components/Loader";
import Button from "../components/Button";
import Card from "../components/Card";
import ProductCard from "../components/ProductCard";
import QuantityInput from "../components/QuantityInput";
import { showSuccess, showError, showWarning } from "../utils/alerts";
import { useCartContext } from "../context/CartContext";

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
  const { refreshCartCount } = useCartContext();

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

  const handleReviewClick = () => {
    showWarning("Funcionalidad no disponible", "Esta funcionalidad estará disponible próximamente.");
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
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
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
            <h1 className="pd-name">{product.name}</h1>

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
              <div className="pd-reviews__empty">
                <p>No hay reseñas para este producto.</p>
                <button className="pd-review-btn" onClick={handleReviewClick}>
                  Escribir una reseña
                </button>
              </div>
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
