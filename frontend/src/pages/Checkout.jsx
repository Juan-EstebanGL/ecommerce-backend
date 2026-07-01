import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../api/cart";
import { checkout } from "../api/orders";
import Loader from "../components/Loader";
import Button from "../components/Button";
import { showWarning } from "../utils/alerts";

function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
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
    <main className="app-container">
      <h1 style={{ marginBottom: 8 }}>Checkout</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 32px 0" }}>
        Revisa tu pedido antes de confirmar la compra
      </p>

      {loading && <Loader />}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <h2>El carrito está vacío</h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>Agrega productos al carrito antes de continuar.</p>
          <Button onClick={() => navigate("/products")}>Ir a productos</Button>
        </div>
      )}

      {items.length > 0 && (
        <div className="checkout-layout">
          <div className="checkout-items">
            <h2 style={{ marginTop: 0, fontSize: "1.1rem", color: "var(--muted)", fontWeight: 600 }}>
              Productos ({totalItems})
            </h2>
            {items.map((item) => {
              const itemSubtotal = (item.product?.price || 0) * item.quantity;
              return (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item__info">
                    <span className="checkout-item__name">{item.product?.name || "Producto"}</span>
                    <span className="checkout-item__qty">x{item.quantity}</span>
                  </div>
                  <span className="checkout-item__price">${formatPrice(item.product?.price || 0)}</span>
                  <span className="checkout-item__subtotal">${formatPrice(itemSubtotal)}</span>
                </div>
              );
            })}
          </div>

          <aside className="checkout-summary">
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: "1.15rem" }}>Resumen</h2>

            <div className="checkout-summary__rows">
              <div className="summary-row">
                <span>Productos ({totalItems})</span>
                <span>${formatPrice(total)}</span>
              </div>
              <div className="summary-row">
                <span>Envío</span>
                <span className="cart-summary__shipping">Gratis</span>
              </div>
            </div>

            <div className="checkout-summary__total">
              <span>Total</span>
              <span className="checkout-summary__total-value">${formatPrice(total)}</span>
            </div>

            {checkoutError && (
              <div className="cart-message cart-message--error" style={{ marginBottom: 16 }}>
                <span>✕</span> {checkoutError}
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{ width: "100%", padding: "14px 16px", fontSize: "1rem" }}
            >
              {checkoutLoading ? "Procesando..." : "Confirmar compra"}
            </Button>

            <Button
              onClick={() => navigate("/cart")}
              variant="ghost"
              style={{ width: "100%", padding: "12px 16px", marginTop: 8 }}
            >
              ← Volver al carrito
            </Button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Checkout;
