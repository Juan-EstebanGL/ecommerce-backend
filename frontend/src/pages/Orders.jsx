import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await getOrders();
        setOrders(response.data?.orders || []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar las órdenes");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <main>
      <h1>Órdenes</h1>
      {loading && <p>Cargando órdenes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && orders.length === 0 && <p>No hay órdenes.</p>}
      <div style={{ display: "grid", gap: "1rem" }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
            }}
          >
            <h2>Orden #{order.id}</h2>
            <p>Fecha: {new Date(order.createdAt).toLocaleString()}</p>
            <p>Total: {order.total}</p>
            <p>Estado: {order.status}</p>
            <button type="button" onClick={() => navigate(`/orders/${order.id}`)}>
              Ver detalle
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Orders;
