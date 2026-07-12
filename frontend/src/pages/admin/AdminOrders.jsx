import { useEffect, useState, useRef } from "react";
import { getAdminOrders, updateOrderStatus } from "../../api/orders";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import OrderTable from "../../components/admin/OrderTable";
import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 8;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const tableRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAdminOrders({ page, limit: PAGE_SIZE });
        if (!cancelled) {
          setOrders(res.data?.orders || []);
          setTotal(res.data?.total || 0);
          setTotalPages(res.data?.totalPages || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar órdenes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

  function handlePageChange(newPage) {
    setPage(newPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleView(order) {
    setViewingOrder(order);
  }

  async function handleStatusChange(orderId, newStatus) {
    const statusLabels = {
      PAID: "Pagado",
      PROCESSING: "Procesando",
      SHIPPED: "Enviado",
      DELIVERED: "Entregado",
      CANCELLED: "Cancelado",
    };

    const isCancel = newStatus === "CANCELLED";

    const result = await showConfirm(
      isCancel ? "Cancelar orden" : "Cambiar estado",
      isCancel
        ? "Esta acción cancelará la orden y no podrá continuar su flujo normal."
        : `¿Estás seguro de marcar esta orden como "${statusLabels[newStatus]}"?`,
      isCancel ? "Sí, cancelar" : "Cambiar",
      "Cancelar"
    );

    if (!result.isConfirmed) return;

    setLoadingId(orderId);

    try {
      const res = await updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data.order : o)));
      showSuccess(`Estado actualizado a "${statusLabels[newStatus]}"`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al actualizar estado";
      showError(msg);
    } finally {
      setLoadingId(null);
    }
  }

  const stats = [
    {
      label: "Total órdenes",
      value: total,
      color: "teal",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      label: "Pendientes",
      value: orders.filter((o) => o.status === "PENDING").length,
      color: "warning",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Completadas",
      value: orders.filter((o) => o.status === "DELIVERED").length,
      color: "success",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Canceladas",
      value: orders.filter((o) => o.status === "CANCELLED").length,
      color: "danger",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Órdenes</h1>
            <p className="ad-header__subtitle">Administración de órdenes</p>
          </div>
        </div>
        <div className="ad-orders-loader">
          <div className="ad-orders-loader__spinner" />
          <p>Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Órdenes</h1>
            <p className="ad-header__subtitle">Administración de órdenes</p>
          </div>
        </div>
        <div className="ad-orders-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-orders">
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">Órdenes</h1>
          <p className="ad-header__subtitle">Administración de órdenes</p>
        </div>
      </div>

      <div className="ad-stats ad-orders-stats" ref={tableRef}>
        {stats.map((s) => (
          <div key={s.label} className={`ad-card ad-card--${s.color}`}>
            <div className="ad-card__top">
              <div className="ad-card__icon">{s.icon}</div>
            </div>
            <div className="ad-card__value">{s.value}</div>
            <div className="ad-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <OrderTable
        orders={orders}
        onView={handleView}
        onStatusChange={handleStatusChange}
        loadingId={loadingId}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <OrderViewModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
    </div>
  );
}

function OrderViewModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="ad-orders-modal-overlay" onClick={onClose}>
      <div className="ad-orders-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-orders-modal__header">
          <h2>Orden #{order.id}</h2>
          <button className="ad-orders-modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="ad-orders-modal__body">
          <div className="ad-orders-modal__section">
            <div className="ad-orders-modal__field">
              <span className="ad-orders-modal__label">Estado</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="ad-orders-modal__field">
              <span className="ad-orders-modal__label">Cliente</span>
              <span className="ad-orders-modal__value">{order.user?.email || "—"}</span>
            </div>
            <div className="ad-orders-modal__field">
              <span className="ad-orders-modal__label">Total</span>
              <span className="ad-orders-modal__value ad-orders-modal__value--price">
                ${Number(order.total).toLocaleString("es-CL")}
              </span>
            </div>
            <div className="ad-orders-modal__field">
              <span className="ad-orders-modal__label">Fecha</span>
              <span className="ad-orders-modal__value">
                {new Date(order.createdAt).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="ad-orders-modal__section">
            <h3 className="ad-orders-modal__subtitle">Productos ({order.items?.length || 0})</h3>
            <div className="ad-orders-modal__items">
              {(order.items || []).map((item) => (
                <div key={item.id} className="ad-orders-modal__item">
                  <div className="ad-orders-modal__item-media">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="ad-orders-modal__item-placeholder"
                      style={{ display: item.imageUrl ? "none" : "flex" }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                  </div>
                  <div className="ad-orders-modal__item-info">
                    <span className="ad-orders-modal__item-name">{item.productName}</span>
                    <span className="ad-orders-modal__item-meta">
                      {item.quantity} x ${Number(item.productPrice).toLocaleString("es-CL")}
                    </span>
                  </div>
                  <span className="ad-orders-modal__item-subtotal">
                    ${(item.quantity * Number(item.productPrice)).toLocaleString("es-CL")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
