import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../api/orders";
import Loader from "../components/Loader";
import Badge from "../components/Badge";
import Button from "../components/Button";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await getOrderById(id);
        setOrder(response.data?.order || null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="app-container">
        <h1>Detalle de orden</h1>
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-container">
        <h1>Detalle de orden</h1>
        <p className="form-error">{error}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="app-container">
        <h1>Detalle de orden</h1>
        <p>Orden no encontrada.</p>
      </main>
    );
  }

  return (
    <main>
      <div className="app-container">
        {/* Back Button */}
        <div style={{ marginBottom: 24 }}>
          <Button onClick={() => navigate("/orders")} variant="ghost">
            ← Volver a mis órdenes
          </Button>
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Orden #{order.id}</h1>
            <p style={{ color: "var(--muted)", margin: "8px 0 0 0" }}>
              {new Date(order.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge status={order.status}>{order.status}</Badge>
        </div>

        {/* Layout: Two columns */}
        <div className="order-detail-layout">
          {/* Left: Items */}
          <div className="order-detail__items">
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Productos</h2>

            {order.items && order.items.length > 0 ? (
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    {/* Item Media */}
                    <div className="order-item__media">
                      <div style={{ fontSize: "2.5rem", color: "#9ca3af" }}>
                        {item.productName?.slice(0, 1) || "P"}
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="order-item__info">
                      <h3 style={{ margin: "0 0 8px 0" }}>{item.productName}</h3>
                      <div style={{ display: "flex", gap: 16, fontSize: "0.95rem", color: "var(--muted)" }}>
                        <span>Cantidad: <strong style={{ color: "var(--text)" }}>{item.quantity}</strong></span>
                        <span>Precio: <strong style={{ color: "var(--text)" }}>${item.productPrice?.toFixed(2) || "0.00"}</strong></span>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="order-item__subtotal">
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>No hay productos en esta orden.</p>
            )}
          </div>

          {/* Right: Summary */}
          <aside className="order-summary">
            <h2 style={{ marginTop: 0 }}>Resumen</h2>

            {/* Order Info */}
            <div className="order-summary__info">
              <div className="info-row">
                <span>Número de orden</span>
                <span style={{ fontWeight: 600 }}>#{order.id}</span>
              </div>
              <div className="info-row">
                <span>Fecha</span>
                <span style={{ fontWeight: 600 }}>
                  {new Date(order.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
              <div className="info-row">
                <span>Estado</span>
                <Badge status={order.status}>{order.status}</Badge>
              </div>
            </div>

            {/* Totals */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="summary-row" style={{ marginTop: 8 }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--brand)",
                  }}
                >
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action */}
            <Button
              onClick={() => navigate("/products")}
              style={{ width: "100%", padding: "12px 16px", marginTop: 24 }}
            >
              Seguir comprando
            </Button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetail;
