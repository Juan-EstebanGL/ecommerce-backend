import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../api/orders";
import Loader from "../components/Loader";
import Button from "../components/Button";

const STATUS_LABELS = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Pedido recibido" },
  { key: "PROCESSING", label: "Procesando" },
  { key: "SHIPPED", label: "Enviado" },
  { key: "DELIVERED", label: "Entregado" },
];

const STATUS_ORDER = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

function Badge({ status, children }) {
  const cls = `badge ${status ? `badge--${status}` : ""}`;
  return <span className={cls}>{children}</span>;
}

function Timeline({ status }) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  if (currentIndex === -1) return null;

  return (
    <div className="od-timeline">
      {TIMELINE_STEPS.map((step, idx) => {
        const isActive = idx <= currentIndex;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.key} className="od-timeline__step">
            <div
              className={`od-timeline__dot ${
                isActive ? "od-timeline__dot--active" : "od-timeline__dot--future"
              }`}
            >
              {isActive ? "✓" : idx + 1}
            </div>
            <span
              className={`od-timeline__label ${
                isActive ? "od-timeline__label--active" : "od-timeline__label--future"
              }`}
            >
              {step.label}
            </span>
            {!isLast && (
              <div
                className={`od-timeline__connector ${
                  isActive && currentIndex > idx
                    ? "od-timeline__connector--active"
                    : "od-timeline__connector--future"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgErrors, setImgErrors] = useState(new Set());

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
      <main className="od-page">
        <div className="app-container">
          <div className="od-loading">
            <Loader />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="od-page">
        <div className="app-container">
          <div className="od-error">
            <p className="od-error__text">{error}</p>
            <Button onClick={() => navigate("/orders")} variant="ghost">
              ← Volver a mis pedidos
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="od-page">
        <div className="app-container">
          <div className="od-not-found">
            <p className="od-not-found__text">Orden no encontrada.</p>
            <Button onClick={() => navigate("/orders")} variant="ghost">
              ← Volver a mis pedidos
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.productPrice || 0) * (item.quantity || 0),
    0
  );

  return (
    <main className="od-page">
      <div className="app-container">
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="breadcrumb__sep">›</span>
          <Link to="/orders">Órdenes</Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">Pedido #{order.id}</span>
        </nav>

        <header className="od-header">
          <div>
            <h1 className="od-header__title">Pedido #{order.id}</h1>
            <p className="od-header__date">
              {new Date(order.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge status={order.status}>
            {STATUS_LABELS[order.status] || order.status}
          </Badge>
        </header>

        {order.status === "CANCELLED" ? (
          <div className="od-cancelled">
            <svg className="od-cancelled__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>Este pedido fue cancelado.</span>
          </div>
        ) : (
          <Timeline status={order.status} />
        )}

        <div className="od-layout">
          <div>
            <h2 className="od-items__title">
              Productos ({items.length})
            </h2>

            {items.length > 0 ? (
              <div>
                {items.map((item, idx) => {
                  const imgSrc = item.imageUrl;
                  const name = item.productName || "Producto";
                  const unitPrice = item.productPrice || 0;
                  const qty = item.quantity || 0;

                  return (
                    <div key={idx} className="od-item">
                      <div className="od-item__media">
                        {imgSrc && !imgErrors.has(idx) ? (
                          <img src={imgSrc} alt={name} loading="lazy" onError={() => setImgErrors(prev => new Set(prev).add(idx))} />
                        ) : (
                          <span className="od-item__placeholder">
                            {name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="od-item__info">
                        <h4 className="od-item__name">{name}</h4>
                        <div className="od-item__meta">
                          <span className="od-item__meta-field">
                            Cantidad: <strong>{qty}</strong>
                          </span>
                          <span className="od-item__meta-field">
                            Precio: <strong>${unitPrice.toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="od-item__subtotal">
                        ${(unitPrice * qty).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>No hay productos en esta orden.</p>
            )}
          </div>

          <aside className="od-summary">
            <h3 className="od-summary__title">Resumen del pedido</h3>

            <div className="od-summary__rows">
              <div className="od-summary__row">
                <span>Productos ({items.length})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="od-summary__row">
                <span>Envío</span>
                <span className="od-summary__free">Gratis</span>
              </div>
              <div className="od-summary__row">
                <span>Descuento</span>
                <span>$0</span>
              </div>
            </div>

            <div className="od-summary__total">
              <span>TOTAL</span>
              <span className="od-summary__total-value">
                ${order.total.toFixed(2)}
              </span>
            </div>

            <div className="od-summary__actions">
              <Button onClick={() => navigate("/orders")} variant="ghost">
                ← Volver a mis pedidos
              </Button>
              <Button onClick={() => navigate("/products")}>
                Seguir comprando
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetail;
