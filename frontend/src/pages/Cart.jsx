import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../api/cart";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
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

  async function handleRemoveItem(itemId) {
    setActionId(itemId);
    setError("");

    try {
      await removeCartItem(itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error eliminando item del carrito");
    } finally {
      setActionId(null);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <main>
      <h1>Carrito</h1>
      {loading && <p>Cargando carrito...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && items.length === 0 && <p>El carrito está vacío.</p>}
      <div style={{ display: "grid", gap: "1rem" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
            }}
          >
            <h2>{item.product?.name || "Producto"}</h2>
            <p>Precio: {item.product?.price ?? "-"}</p>
            <p>Cantidad: {item.quantity}</p>
            <p>Subtotal: {(item.product?.price || 0) * item.quantity}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={actionId === item.id || item.quantity <= 1}
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <button
                type="button"
                disabled={actionId === item.id || item.quantity >= (item.product?.stock || Infinity)}
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
              <button
                type="button"
                disabled={actionId === item.id}
                onClick={() => handleRemoveItem(item.id)}
              >
                Eliminar
              </button>
            </div>
            <p>Stock disponible: {item.product?.stock ?? "-"}</p>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
          Total: {total.toFixed(2)}
          <div style={{ marginTop: "1rem" }}>
            <button type="button" onClick={() => navigate("/checkout")}>
              Confirmar compra
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Cart;
