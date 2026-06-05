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
    <main className="app-container">
      <h1>Carrito</h1>
      {loading && <Loader />}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="card" style={{textAlign:'center'}}>
          <p>El carrito está vacío.</p>
        </div>
      )}

      <div style={{display:'grid',gap:12}}>
        {items.map((item) => (
          <div key={item.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div style={{minWidth:200}}>
              <h3 style={{margin:0}}>{item.product?.name || "Producto"}</h3>
              <p style={{margin:'6px 0'}}>Precio: ${item.product?.price ?? "-"}</p>
              <p style={{margin:'6px 0'}}>Subtotal: ${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
              <p className="product-stock">Stock disponible: {item.product?.stock ?? "-"}</p>
            </div>

            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <Button disabled={actionId === item.id || item.quantity <= 1} onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} variant="ghost">-</Button>
              <div style={{minWidth:36,textAlign:'center'}}>{item.quantity}</div>
              <Button disabled={actionId === item.id || item.quantity >= (item.product?.stock || Infinity)} onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} variant="ghost">+</Button>
              <Button disabled={actionId === item.id} onClick={() => handleRemoveItem(item.id)} variant="ghost">Eliminar</Button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <aside className="card" style={{marginTop:16}}>
          <h2 style={{marginBottom:8}}>Total: ${total.toFixed(2)}</h2>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <Button onClick={() => navigate("/checkout")}>Confirmar compra</Button>
          </div>
        </aside>
      )}
    </main>
  );
}

export default Cart;
