import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api/orders";
import Button from "../components/Button";
import Loader from "../components/Loader";

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

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#ffc107",
      PAID: "#28a745",
      PROCESSING: "#17a2b8",
      SHIPPED: "#007bff",
      DELIVERED: "#6f42c1",
      CANCELLED: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  return (
    <main>
      <h1>Órdenes</h1>
      {loading && <Loader />}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>No hay órdenes.</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <h3>Orden #{order.id}</h3>
            <p style={{ fontSize: "0.9em", color: "#666" }}>
              Fecha: {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p>Total: ${order.total.toFixed(2)}</p>
            <p>
              Estado: <span style={{ color: getStatusColor(order.status), fontWeight: "bold" }}>{order.status}</span>
            </p>
            <Button onClick={() => navigate(`/orders/${order.id}`)}>
              Ver detalle
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Orders;
