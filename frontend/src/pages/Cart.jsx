import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../api/cart";
import Loader from "../components/Loader";
import QuantityInput from "../components/QuantityInput";
import { showSuccess, showError, showConfirm } from "../utils/alerts";
import { useCartContext } from "../context/CartContext";

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [imgErrors, setImgErrors] = useState(new Set());
  const { refreshCartCount } = useCartContext();
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
      refreshCartCount();
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
      refreshCartCount();
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
        <div className="ct-header">
          <h1 className="ct-header__title">Mi carrito</h1>
          {!isEmpty && (
            <p className="ct-header__sub">
              Tienes {totalItems} {totalItems === 1 ? "producto" : "productos"} listos para comprar.
            </p>
          )}
        </div>

        {loading && <Loader />}

        {error && (
          <div className="ct-message ct-message--error">{error}</div>
        )}

        {isEmpty && (
          <div className="ct-empty">
            <div className="ct-empty__icon">
              <CartIcon />
            </div>
            <h2 className="ct-empty__title">Tu carrito está vacío</h2>
            <p className="ct-empty__desc">
              Comienza a comprar y agrega productos a tu carrito para recibirlos en la puerta de tu casa.
            </p>
            <button className="ct-empty__btn" onClick={() => navigate("/products")}>
              Ir al catálogo
            </button>
          </div>
        )}

        {!isEmpty && (
          <div className="ct-layout">
            <div className="ct-items">
              {items.map((item) => {
                const isSyncing = syncingId === item.id;
                const itemSubtotal = (item.product?.price || 0) * item.quantity;
                const stockLow = item.product?.stock != null && item.product.stock <= 5 && item.product.stock > 0;

                return (
                  <div key={item.id} className={`ct-item${isSyncing ? " ct-item--syncing" : ""}`}>
                    <div className="ct-item__media">
                      {item.product?.imageUrl && !imgErrors.has(item.id) ? (
                        <img src={item.product.imageUrl} alt={item.product.name} loading="lazy" onError={() => setImgErrors(prev => new Set(prev).add(item.id))} />
                      ) : (
                        <span className="ct-item__placeholder">
                          {item.product?.name?.slice(0, 2).toUpperCase() || "PR"}
                        </span>
                      )}
                    </div>
                    <div className="ct-item__body">
                      <div className="ct-item__header">
                        <h3 className="ct-item__name">{item.product?.name || "Producto"}</h3>
                        <span className="ct-item__price-badge">${formatPrice(itemSubtotal)}</span>
                      </div>
                      <div className="ct-item__meta">
                        <span>Precio unit.: <strong>${formatPrice(item.product?.price || 0)}</strong></span>
                        {item.product?.stock != null && (
                          <span>Stock: <strong>{item.product.stock}</strong></span>
                        )}
                      </div>
                      {stockLow && (
                        <span className="ct-item__stock-warning">Pocas unidades disponibles</span>
                      )}
                      <div className="ct-item__actions">
                        <div className="ct-item__qty">
                          <QuantityInput
                            value={item.quantity}
                            min={1}
                            max={item.product?.stock}
                            onChange={(v) => handleQtyChange(item.id, v)}
                            disabled={isSyncing}
                          />
                        </div>
                        <span className="ct-item__subtotal-label">
                          Subtotal: <strong>${formatPrice(itemSubtotal)}</strong>
                        </span>
                      </div>
                      <button
                        className="ct-item__remove"
                        disabled={actionId === item.id}
                        onClick={() => handleRemoveItem(item.id, item.product?.name || "Producto")}
                      >
                        <TrashIcon />
                        {actionId === item.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="ct-summary">
              <h2 className="ct-summary__title">Resumen de compra</h2>

              <div className="ct-summary__rows">
                <div className="ct-summary__row">
                  <span>Productos ({totalItems})</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="ct-summary__row">
                  <span>Envío</span>
                  <span className="ct-summary__shipping">Gratis</span>
                </div>
                <div className="ct-summary__row">
                  <span>Descuentos</span>
                  <span>$0</span>
                </div>
              </div>

              <div className="ct-summary__total">
                <span>TOTAL</span>
                <span className="ct-summary__total-value">${formatPrice(total)}</span>
              </div>

              <button
                className="ct-checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Continuar compra
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button className="ct-back-btn" onClick={() => navigate("/products")}>
                ← Seguir comprando
              </button>

              <p className="ct-summary__note">
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
