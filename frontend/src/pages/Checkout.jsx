import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../api/cart";
import { checkout } from "../api/orders";
import Loader from "../components/Loader";
import { showWarning } from "../utils/alerts";
import { useCartContext } from "../context/CartContext";

const LockIcon = () => (
  <svg className="co-security__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const { refreshCartCount } = useCartContext();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      setError("");

      try {
        const response = await getCart();
        setItems(response.data?.items || []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar el carrito");
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      await checkout();
      refreshCartCount();
      navigate("/orders");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Error al procesar la compra";
      setCheckoutError(msg);
      showWarning("Error en la compra", msg);
    } finally {
      setCheckoutLoading(false);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price) => Number(price).toLocaleString("es-CO", { minimumFractionDigits: 2 });

  return (
    <main>
      <div className="app-container">
        <div className="co-header">
          <h1 className="co-header__title">Finalizar compra</h1>
          <p className="co-header__sub">Revisa tu pedido antes de confirmar la compra.</p>
        </div>

        {loading && <Loader />}

        {error && <div className="co-message co-message--error">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="co-empty">
            <div className="co-empty__icon">
              <CartIcon />
            </div>
            <h2 className="co-empty__title">El carrito está vacío</h2>
            <p className="co-empty__desc">Agrega productos al carrito antes de continuar.</p>
            <button className="co-empty__btn" onClick={() => navigate("/products")}>
              Ir al catálogo
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="co-layout">
            <div className="co-items">
              <h2 className="co-items__title">Productos ({totalItems})</h2>
              {items.map((item) => {
                const itemSubtotal = (item.product?.price || 0) * item.quantity;
                return (
                  <div key={item.id} className="co-item">
                    <div className="co-item__media">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} />
                      ) : (
                        <span className="co-item__placeholder">
                          {item.product?.name?.slice(0, 2).toUpperCase() || "PR"}
                        </span>
                      )}
                    </div>
                    <div className="co-item__body">
                      <div className="co-item__header">
                        <span className="co-item__name">{item.product?.name || "Producto"}</span>
                        <span className="co-item__unit-price">${formatPrice(item.product?.price || 0)}</span>
                      </div>
                      <div className="co-item__meta">
                        <span className="co-item__qty">Cantidad: <strong>{item.quantity}</strong></span>
                        <span className="co-item__subtotal">Subtotal: <strong>${formatPrice(itemSubtotal)}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="co-summary">
              <h2 className="co-summary__title">Resumen del pedido</h2>

              <div className="co-summary__rows">
                <div className="co-summary__row">
                  <span>Productos ({totalItems})</span>
                  <span>${formatPrice(total)}</span>
                </div>
                <div className="co-summary__row">
                  <span>Envío</span>
                  <span className="co-summary__shipping">Gratis</span>
                </div>
                <div className="co-summary__row">
                  <span>Descuento</span>
                  <span>$0</span>
                </div>
              </div>

              <div className="co-summary__total">
                <span>TOTAL</span>
                <span className="co-summary__total-value">${formatPrice(total)}</span>
              </div>

              {checkoutError && (
                <div className="co-message co-message--error">{checkoutError}</div>
              )}

              <button
                className="co-confirm-btn"
                disabled={checkoutLoading}
                onClick={handleCheckout}
              >
                {checkoutLoading ? (
                  <span className="co-btn-inner">
                    <span className="co-spinner" />
                    Procesando...
                  </span>
                ) : (
                  "Confirmar compra"
                )}
              </button>

              <button className="co-back-btn" onClick={() => navigate("/cart")}>
                ← Volver al carrito
              </button>

              <div className="co-security">
                <LockIcon />
                <div className="co-security__info">
                  <strong>Compra segura</strong>
                  <p>Tus datos serán procesados de forma segura.</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Checkout;
