import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api/orders";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Badge from "../components/Badge";

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
    // kept for compatibility with logic that might use it elsewhere
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
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
        {orders.map((order) => (
          <div key={order.id} className="card">
            <h3 style={{margin:0}}>Orden #{order.id}</h3>
            <p style={{ fontSize: "0.9em", color: "#666" }}>Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p style={{margin:'6px 0'}}>Total: ${order.total.toFixed(2)}</p>
            <p style={{margin:'6px 0'}}>Estado: <Badge status={order.status}>{order.status}</Badge></p>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <Button onClick={() => navigate(`/orders/${order.id}`)} variant="ghost">Ver detalle</Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Orders;
