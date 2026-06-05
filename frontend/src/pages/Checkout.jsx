import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../api/cart";
import { checkout } from "../api/orders";

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
      setCheckoutError(err?.response?.data?.message || err?.message || "Error al procesar la compra");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <main className="app-container">
      <h1>Checkout</h1>
      {loading && <p>Cargando resumen del carrito...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && items.length === 0 && <p>El carrito está vacío.</p>}
      {items.length > 0 && (
        <div style={{display:'grid',gap:12}}>
          {items.map((item) => (
            <div key={item.id} className="card">
              <h2 style={{margin:0}}>{item.product?.name || "Producto"}</h2>
              <p>Precio: {item.product?.price ?? "-"}</p>
              <p>Cantidad: {item.quantity}</p>
              <p>Subtotal: {(item.product?.price || 0) * item.quantity}</p>
            </div>
          ))}
          <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontWeight:'bold'}}>Total: {total.toFixed(2)}</div>
            <div>
              {checkoutError && <p className="form-error">{checkoutError}</p>}
              <button className="btn btn--primary" type="button" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? "Procesando..." : "Confirmar compra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Checkout;
