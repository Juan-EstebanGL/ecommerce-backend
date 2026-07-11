import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api/orders";
import Loader from "../components/Loader";

const STATUS_LABELS = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

function Badge({ status, children }) {
  const cls = `badge ${status ? `badge--${status}` : ""}`;
  return <span className={cls}>{children}</span>;
}

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
    <main className="or-page">
      <div className="app-container">
        <nav className="breadcrumb or-breadcrumb" aria-label="Navegación">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Inicio</a>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Mis pedidos</span>
        </nav>

        <header className="or-header">
          <div className="or-header__text">
            <h1 className="or-header__title">Mis pedidos</h1>
            <p className="or-header__sub">
              Consulta el historial y el estado de todas tus compras.
            </p>
          </div>
          {!loading && !error && orders.length > 0 && (
            <span className="or-header__count">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {orders.length} {orders.length === 1 ? "pedido realizado" : "pedidos realizados"}
            </span>
          )}
        </header>

        {loading && (
          <div className="or-loading">
            <Loader />
            <p className="or-loading__text">Cargando tus órdenes...</p>
          </div>
        )}

        {error && !loading && (
          <div className="or-error">
            <div className="or-error__icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="or-error__text">{error}</p>
            <button className="or-error__btn" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="or-empty">
            <div className="or-empty__icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <h2 className="or-empty__title">Todavía no has realizado ninguna compra</h2>
            <p className="or-empty__desc">
              Explora nuestros productos y encuentra lo que necesitas. Tus pedidos aparecerán aquí una vez que realices tu primera compra.
            </p>
            <button className="or-empty__btn" onClick={() => navigate("/products")}>
              Explorar productos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="or-list">
            {orders.map((order, idx) => (
              <div
                key={order.id}
                className="or-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="or-card__info">
                  <span className="or-card__number">Pedido #{order.id}</span>
                  <span className="or-card__date">
                    {new Date(order.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="or-card__divider" />

                <div className="or-card__badge">
                  <Badge status={order.status}>
                    {STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </div>

                <div className="or-card__stats">
                  <div className="or-card__stat">
                    <span className="or-card__stat-label">Productos</span>
                    <span className="or-card__stat-value">
                      {order.items?.length || 0}
                    </span>
                  </div>
                  <div className="or-card__stat">
                    <span className="or-card__stat-label">Total</span>
                    <span className="or-card__stat-value or-card__stat-value--price">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="or-card__action">
                  <button
                    className="or-card__btn"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    Ver detalle
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
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
