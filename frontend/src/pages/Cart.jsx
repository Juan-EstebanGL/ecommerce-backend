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
      {loading && <Loader />}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>El carrito está vacío.</p>
        </div>
      )}
      <div style={{ display: "grid", gap: "1rem" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h3>{item.product?.name || "Producto"}</h3>
              <p>Precio: ${item.product?.price ?? "-"}</p>
              <p>Cantidad: {item.quantity}</p>
              <p>Subtotal: ${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
              <p style={{ fontSize: "0.9em", color: "#666" }}>Stock disponible: {item.product?.stock ?? "-"}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Button
                disabled={actionId === item.id || item.quantity <= 1}
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                -
              </Button>
              <Button
                disabled={actionId === item.id || item.quantity >= (item.product?.stock || Infinity)}
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </Button>
              <Button
                disabled={actionId === item.id}
                onClick={() => handleRemoveItem(item.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "4px", background: "#f9f9f9" }}>
          <h2 style={{ marginBottom: "1rem" }}>Total: ${total.toFixed(2)}</h2>
          <Button onClick={() => navigate("/checkout")}>
            Confirmar compra
          </Button>
        </div>
      )}
    </main>
  );
}

export default Cart;
