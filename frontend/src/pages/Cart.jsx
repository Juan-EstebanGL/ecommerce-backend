import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../api/cart";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { showSuccess, showError, showConfirm } from "../utils/alerts";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [syncingId, setSyncingId] = useState(null);
  const navigate = useNavigate();
  const timers = useRef({});

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    setEditValues((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        if (!(item.id in next)) {
          next[item.id] = String(item.quantity);
        }
      });
      Object.keys(next).forEach((id) => {
        if (!items.find((i) => i.id === Number(id))) {
          delete next[id];
        }
      });
      return next;
    });
  }, [items]);

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

  async function commitQtyChange(itemId, rawValue) {
    const item = items.find((i) => i.id === itemId);
    const parsed = parseInt(rawValue, 10);
    const stock = item?.product?.stock || Infinity;
    let newQty;

    if (isNaN(parsed) || parsed < 1) {
      newQty = 1;
    } else if (parsed > stock) {
      newQty = stock;
    } else {
      newQty = parsed;
    }

    setEditValues((prev) => ({ ...prev, [itemId]: String(newQty) }));

    if (newQty === item?.quantity) return;

    setSyncingId(itemId);

    try {
      const response = await updateCartItem(itemId, newQty);
      setItems((current) =>
        current.map((i) => (i.id === itemId ? response.data : i))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Error actualizando cantidad");
      const cartResponse = await getCart();
      setItems(cartResponse.data?.items || []);
    } finally {
      setSyncingId(null);
    }
  }

  function handleQtyInput(itemId, value) {
    setEditValues((prev) => ({ ...prev, [itemId]: value }));

    if (timers.current[itemId]) {
      clearTimeout(timers.current[itemId]);
    }
  }

  function handleQtyBlur(itemId) {
    if (timers.current[itemId]) {
      clearTimeout(timers.current[itemId]);
      delete timers.current[itemId];
    }
    commitQtyChange(itemId, editValues[itemId]);
  }

  function handleQtyKeyDown(itemId, e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timers.current[itemId]) {
        clearTimeout(timers.current[itemId]);
        delete timers.current[itemId];
      }
      commitQtyChange(itemId, editValues[itemId]);
    }
  }

  function handleIncrement(itemId) {
    const item = items.find((i) => i.id === itemId);
    const currentRaw = editValues[itemId];
    const current = parseInt(currentRaw, 10);
    const base = isNaN(current) ? (item?.quantity || 1) : current;
    const newVal = Math.min(base + 1, item?.product?.stock || Infinity);
    setEditValues((prev) => ({ ...prev, [itemId]: String(newVal) }));
    commitQtyChange(itemId, String(newVal));
  }

  function handleDecrement(itemId) {
    const item = items.find((i) => i.id === itemId);
    const currentRaw = editValues[itemId];
    const current = parseInt(currentRaw, 10);
    const base = isNaN(current) ? (item?.quantity || 1) : current;
    const newVal = Math.max(base - 1, 1);
    setEditValues((prev) => ({ ...prev, [itemId]: String(newVal) }));
    commitQtyChange(itemId, String(newVal));
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
                const qty = editValues[item.id] ?? String(item.quantity);
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
                      <div className="quantity-selector">
                        <button
                          className="quantity-btn"
                          onClick={() => handleDecrement(item.id)}
                          disabled={isSyncing || parseInt(qty, 10) <= 1}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <input
                          className="quantity-input"
                          type="text"
                          inputMode="numeric"
                          value={qty}
                          onChange={(e) => handleQtyInput(item.id, e.target.value)}
                          onBlur={() => handleQtyBlur(item.id)}
                          onKeyDown={(e) => handleQtyKeyDown(item.id, e)}
                          disabled={isSyncing}
                          aria-label="Cantidad"
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => handleIncrement(item.id)}
                          disabled={isSyncing || parseInt(qty, 10) >= (item.product?.stock || Infinity)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
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
