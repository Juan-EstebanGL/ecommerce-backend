import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../api/orders";
import Loader from "../components/Loader";
import Button from "../components/Button";
import { ORDER_STATUS_LABELS as STATUS_LABELS } from "../utils/orderLabels";

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Pedido recibido" },
  { key: "PROCESSING", label: "Procesando" },
  { key: "SHIPPED", label: "Enviado" },
  { key: "DELIVERED", label: "Entregado" },
];

const STATUS_ORDER = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

function Timeline({ status }) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  if (currentIndex === -1) return null;

  return (
    <div className="otl" role="list" aria-label="Progreso del pedido">
      {TIMELINE_STEPS.map((step, idx) => {
        const isActive = idx <= currentIndex;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.key} className="otl__step" role="listitem">
            <div
              className={`otl__dot ${
                isActive ? "otl__dot--active" : "otl__dot--future"
              }`}
              aria-current={idx === currentIndex ? "step" : undefined}
            >
              {isActive ? "✓" : idx + 1}
            </div>
            <span
              className={`otl__label ${
                isActive ? "otl__label--active" : "otl__label--future"
              }`}
            >
              {step.label}
            </span>
            {!isLast && (
              <div
                className={`otl__connector ${
                  isActive && currentIndex > idx
                    ? "otl__connector--active"
                    : "otl__connector--future"
                }`}
                aria-hidden="true"
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
        <div className="od-page__glow od-page__glow--teal" />
        <div className="od-page__glow od-page__glow--purple" />
        <div className="app-container">
          <div className="od-loading">
            <Loader />
            <p className="od-loading__text">Cargando detalle del pedido...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="od-page">
        <div className="od-page__glow od-page__glow--teal" />
        <div className="od-page__glow od-page__glow--purple" />
        <div className="app-container">
          <div className="od-error">
            <div className="or-error__icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
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
        <div className="od-page__glow od-page__glow--teal" />
        <div className="od-page__glow od-page__glow--purple" />
        <div className="app-container">
          <div className="od-not-found">
            <div className="od-not-found__icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h2 className="od-not-found__title">Orden no encontrada</h2>
            <p className="od-not-found__desc">
              No pudimos encontrar la orden que buscas. Puede que haya sido eliminada o que el identificador sea incorrecto.
            </p>
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
      <div className="od-page__glow od-page__glow--teal" />
      <div className="od-page__glow od-page__glow--purple" />

      <div className="app-container">
        <nav className="breadcrumb" aria-label="Navegación">
          <Link to="/">Inicio</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/orders">Órdenes</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Pedido #{order.id}</span>
        </nav>

        <header className="od-header">
          <div className="od-header__text">
            <h1 className="od-header__title">Pedido #{order.id}</h1>
            <p className="od-header__date">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {new Date(order.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span className={`ost ost--lg ost--${order.status}`}>
            <span className="ost__dot" />
            {STATUS_LABELS[order.status] || order.status}
          </span>
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
          <div className="od-timeline">
            <Timeline status={order.status} />
          </div>
        )}

        <div className="od-layout">
          <div className="od-items">
            <h2 className="od-items__title">
              Productos ({items.length})
            </h2>

            {items.length > 0 ? (
              <div className="od-items__list">
                {items.map((item, idx) => {
                  const imgSrc = item.imageUrl;
                  const name = item.productName || "Producto";
                  const unitPrice = item.productPrice || 0;
                  const qty = item.quantity || 0;

                  return (
                    <div
                      key={idx}
                      className="od-item"
                      style={{ animationDelay: `${idx * 0.06}s` }}
                    >
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
              <div className="od-items__empty">
                <p>No hay productos en esta orden.</p>
              </div>
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
