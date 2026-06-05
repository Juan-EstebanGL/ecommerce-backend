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

  return (
    <main>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 8px 0" }}>Mis órdenes</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Historial y estado de tus compras
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div>
            <p style={{ color: "var(--muted)", marginBottom: 12 }}>Cargando tus órdenes...</p>
            <Loader />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p className="form-error">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📦</div>
            <h2 style={{ marginBottom: 8 }}>Sin órdenes aún</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              Comienza a comprar y tus órdenes aparecerán aquí
            </p>
            <Button onClick={() => navigate("/products")}>Ir a productos</Button>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                {/* Order Header */}
                <div className="order-card__header">
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Orden #{order.id}</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge status={order.status}>{order.status}</Badge>
                </div>

                {/* Order Details */}
                <div className="order-card__body">
                  <div className="order-meta">
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>Total</p>
                      <p className="order-total">${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>Productos</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "1.1rem", fontWeight: 600 }}>
                        {order.items?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <Button onClick={() => navigate(`/orders/${order.id}`)} variant="ghost">
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;
