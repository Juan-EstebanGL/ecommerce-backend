import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../api/cart";
import Button from "../components/Button";
import Loader from "../components/Loader";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [removedMessage, setRemovedMessage] = useState("");
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

  async function handleUpdateQuantity(itemId, quantity) {
    setActionId(itemId);
    setError("");
    setRemovedMessage("");

    try {
      const response = await updateCartItem(itemId, quantity);
      setItems((current) =>
        current.map((item) =>
          item.id === itemId ? response.data : item
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error actualizando el carrito");
    } finally {
      setActionId(null);
    }
  }

  async function handleRemoveItem(itemId, productName) {
    setActionId(itemId);
    setError("");
    setRemovedMessage("");

    try {
      await removeCartItem(itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
      setRemovedMessage(`"${productName}" fue removido del carrito`);
      setTimeout(() => setRemovedMessage(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error eliminando item del carrito");
    } finally {
      setActionId(null);
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const total = subtotal; // Could add tax/shipping logic later

  const isEmpty = !loading && items.length === 0;

  return (
    <main>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 8px 0" }}>Carrito de compra</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {items.length === 0
              ? "Tu carrito está vacío"
              : `${items.length} ${items.length === 1 ? "producto" : "productos"}`}
          </p>
        </div>

        {/* Loading State */}
        {loading && <Loader />}

        {/* Error Messages */}
        {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}
        {removedMessage && <p style={{ color: "#16a34a", marginBottom: 16 }}>✓ {removedMessage}</p>}

        {/* Empty State */}
        {isEmpty && (
          <div className="empty-state">
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🛒</div>
            <h2 style={{ marginBottom: 8 }}>Tu carrito está vacío</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              Comienza a comprar y agrega productos a tu carrito
            </p>
            <Button onClick={() => navigate("/products")}>Ir a productos</Button>
          </div>
        )}

        {/* Cart Layout: Two Columns (Desktop) / Stacked (Mobile) */}
        {!isEmpty && (
          <div className="cart-layout">
            {/* Left: Items List */}
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  {/* Product Info */}
                  <div className="cart-item__main">
                    <h3 style={{ margin: "0 0 8px 0" }}>{item.product?.name || "Producto"}</h3>
                    <div style={{ display: "flex", gap: 16, color: "var(--muted)", fontSize: "0.95rem", marginBottom: 12 }}>
                      <div>Precio: <strong style={{ color: "var(--text)" }}>${(item.product?.price || 0).toFixed(2)}</strong></div>
                      <div>Stock: <strong style={{ color: "var(--text)" }}>{item.product?.stock ?? "-"}</strong></div>
                    </div>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="cart-item__actions">
                    <div className="quantity-selector" style={{ marginBottom: 12 }}>
                      <button
                        className="quantity-btn"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={actionId === item.id || item.quantity <= 1}
                      >
                        −
                      </button>
                      <div className="quantity-display">{item.quantity}</div>
                      <button
                        className="quantity-btn"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={actionId === item.id || item.quantity >= (item.product?.stock || Infinity)}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ marginBottom: 12, fontWeight: 600 }}>
                      Subtotal: ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button
                      className="btn btn--danger"
                      disabled={actionId === item.id}
                      onClick={() => handleRemoveItem(item.id, item.product?.name || "Producto")}
                    >
                      {actionId === item.id ? "Removiendo..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <aside className="cart-summary">
              <h2 style={{ marginTop: 0 }}>Resumen del pedido</h2>

              {/* Summary Details */}
              <div className="cart-summary__details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand)" }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
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
                  Continuar comprando
                </Button>
              </div>

              {/* Note */}
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "center", margin: "12px 0 0 0" }}>
                Los impuestos y envío se calcularán en el checkout
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
