import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../api/cart";
import Button from "../components/Button";
import Loader from "../components/Loader";
import QuantityInput from "../components/QuantityInput";
import { showSuccess, showError, showConfirm } from "../utils/alerts";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

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

  async function handleQtyChange(itemId, newQty) {
    const item = items.find((i) => i.id === itemId);
    if (!item || newQty === item.quantity) return;

    setSyncingId(itemId);

    try {
      const response = await updateCartItem(itemId, newQty);
      setItems((current) =>
        current.map((i) => (i.id === itemId ? response.data : i))
      );
    } catch (err) {
      showError(err?.response?.data?.message || "Error actualizando cantidad");
      const cartResponse = await getCart();
      setItems(cartResponse.data?.items || []);
    } finally {
      setSyncingId(null);
    }
  }

  async function handleRemoveItem(itemId, productName) {
    const result = await showConfirm(
      "Eliminar producto",
      `¿Deseas eliminar "${productName}" del carrito?`
    );

    if (!result.isConfirmed) return;

    setActionId(itemId);
    setError("");

    try {
      await removeCartItem(itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
      showSuccess("Producto eliminado del carrito");
    } catch (err) {
      showError("No fue posible eliminar el producto.");
    } finally {
      setActionId(null);
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const total = subtotal;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const isEmpty = !loading && items.length === 0;

  const formatPrice = (price) => Number(price).toLocaleString("es-CO", { minimumFractionDigits: 2 });

  return (
    <main>
      <div className="app-container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 8px 0" }}>Carrito de compra</h1>
          {!isEmpty && (
            <p style={{ color: "var(--muted)", margin: 0 }}>
              {totalItems} {totalItems === 1 ? "producto" : "productos"}
            </p>
          )}
        </div>

        {loading && <Loader />}

        {error && (
          <div className="cart-message cart-message--error">
            <span>✕</span> {error}
          </div>
        )}

        {isEmpty && (
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h2 style={{ marginBottom: 8 }}>Tu carrito está vacío</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24, maxWidth: 400 }}>
              Comienza a comprar y agrega productos a tu carrito para recibirlos en la puerta de tu casa.
            </p>
            <Button onClick={() => navigate("/products")}>Ir a comprar</Button>
          </div>
        )}

        {!isEmpty && (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const isSyncing = syncingId === item.id;
                const itemSubtotal = (item.product?.price || 0) * item.quantity;

                return (
                  <div key={item.id} className={`cart-item${isSyncing ? " cart-item--syncing" : ""}`}>
                    <div className="cart-item__info">
                      <h3 className="cart-item__name">{item.product?.name || "Producto"}</h3>
                      <div className="cart-item__meta">
                        <span>Precio: <strong>${formatPrice(item.product?.price || 0)}</strong></span>
                        {item.product?.stock != null && (
                          <span>Stock: <strong>{item.product.stock}</strong></span>
                        )}
                      </div>
                      <div className="cart-item__subtotal-mobile">
                        Subtotal: <strong>${formatPrice(itemSubtotal)}</strong>
                      </div>
                    </div>
                    <div className="cart-item__actions">
                      <QuantityInput
                        value={item.quantity}
                        min={1}
                        max={item.product?.stock}
                        onChange={(v) => handleQtyChange(item.id, v)}
                        disabled={isSyncing}
                      />
                      <div className="cart-item__subtotal">
                        ${formatPrice(itemSubtotal)}
                      </div>
                      <button
                        className="btn btn--danger"
                        disabled={actionId === item.id}
                        onClick={() => handleRemoveItem(item.id, item.product?.name || "Producto")}
                      >
                        {actionId === item.id ? "Removiendo..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="cart-summary">
              <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: "1.15rem" }}>Resumen del pedido</h2>

              <div className="cart-summary__details">
                <div className="summary-row">
                  <span>Productos ({totalItems})</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <span className="cart-summary__shipping">Gratis</span>
                </div>
              </div>

              <div className="cart-summary__total">
                <span>Total</span>
                <span className="cart-summary__total-value">${formatPrice(total)}</span>
              </div>

              <div className="cart-summary__buttons">
                <Button
                  onClick={() => navigate("/checkout")}
                  style={{ width: "100%", padding: "12px 16px", fontSize: "1rem" }}
                >
                  Proceder al checkout
                </Button>
                <Button
                  onClick={() => navigate("/products")}
                  variant="ghost"
                  style={{ width: "100%", padding: "12px 16px" }}
                >
                  ← Seguir comprando
                </Button>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "center", margin: "16px 0 0 0" }}>
                Los impuestos se calcularán al confirmar la compra
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
