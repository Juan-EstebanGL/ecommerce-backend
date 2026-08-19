import { useEffect, useState, useRef, useMemo } from "react";
import { getAdminOrders, updateOrderStatus } from "../../api/orders";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import OrderTable from "../../components/admin/OrderTable";
import Pagination from "../../components/Pagination";
import useDebounce from "../../hooks/useDebounce";
import { ORDER_STATUS_LABELS as STATUS_LABELS } from "../../utils/orderLabels";

const PAGE_SIZE = 8;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statsData, setStatsData] = useState({ totalPending: 0, totalDelivered: 0, totalCancelled: 0 });
  const tableRef = useRef(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAdminOrders({ limit: 100 });
        if (!cancelled) {
          setOrders(res.data?.orders || []);
          setStatsData(res.data?.stats || { totalPending: 0, totalDelivered: 0, totalCancelled: 0 });
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar órdenes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return orders;
    const q = debouncedSearch.toLowerCase().trim();
    return orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        (o.user?.email && o.user.email.toLowerCase().includes(q)) ||
        ((o.user?.firstName || o.user?.lastName) && `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim().toLowerCase().includes(q)) ||
        (STATUS_LABELS[o.status] && STATUS_LABELS[o.status].toLowerCase().includes(q)) ||
        o.status.toLowerCase().includes(q)
    );
  }, [orders, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function refreshOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminOrders({ limit: 100 });
      setOrders(res.data?.orders || []);
      setStatsData(res.data?.stats || { totalPending: 0, totalDelivered: 0, totalCancelled: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  }

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
    const isCancel = newStatus === "CANCELLED";

    const result = await showConfirm(
      isCancel ? "Cancelar orden" : "Cambiar estado",
      isCancel
        ? "Esta acción cancelará la orden y no podrá continuar su flujo normal."
        : `¿Estás seguro de marcar esta orden como "${STATUS_LABELS[newStatus]}"?`,
      isCancel ? "Sí, cancelar" : "Cambiar",
      "Cancelar"
    );

    if (!result.isConfirmed) return;

    setLoadingId(orderId);

    try {
      const res = await updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data.order : o)));
      showSuccess(`Estado actualizado a "${STATUS_LABELS[newStatus]}"`);
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
      value: orders.length,
      color: "teal",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      label: "Pendientes",
      value: statsData.totalPending,
      color: "warning",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Completadas",
      value: statsData.totalDelivered,
      color: "success",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Canceladas",
      value: statsData.totalCancelled,
      color: "danger",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="ad-orders">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Órdenes</h1>
            <p className="ad-header__subtitle">Gestiona los pedidos de tu tienda</p>
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
      <div className="ad-orders">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Órdenes</h1>
            <p className="ad-header__subtitle">Gestiona los pedidos de tu tienda</p>
          </div>
        </div>
        <div className="ad-orders-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => refreshOrders()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-orders">
      <div className="ad-orders-header">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Órdenes</h1>
            <p className="ad-header__subtitle">Gestiona los pedidos de tu tienda</p>
          </div>
        </div>
      </div>

      <div className="ad-products-stats" ref={tableRef}>
        {stats.map((s, i) => (
          <div key={s.label} className={`ad-card ad-card--${s.color}`} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="ad-card__top">
              <div className="ad-card__icon">{s.icon}</div>
            </div>
            <div className="ad-card__value">{s.value}</div>
            <div className="ad-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ad-products-toolbar">
        <div className="ad-products-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por ID, nombre o estado..."
            className="ad-products-search__input"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              className="ad-products-search__clear"
              onClick={() => { setSearch(""); setPage(1); }}
              aria-label="Limpiar búsqueda"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div className="ad-products-count">
          <span className="ad-products-count__num">{filtered.length}</span>
          <span className="ad-products-count__label">{filtered.length === 1 ? "orden" : "órdenes"}</span>
        </div>
      </div>

      <OrderTable
        orders={paged}
        onView={handleView}
        onStatusChange={handleStatusChange}
        loadingId={loadingId}
      />

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <OrderViewModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
    </div>
  );
}

function OrderViewModal({ order, onClose }) {
  if (!order) return null;

  const statusMap = {
    PENDING: { cls: "ad-modal__badge--warning", label: "Pendiente" },
    PROCESSING: { cls: "ad-modal__badge--info", label: "Procesando" },
    SHIPPED: { cls: "ad-modal__badge--info", label: "Enviado" },
    DELIVERED: { cls: "ad-modal__badge--success", label: "Entregado" },
    CANCELLED: { cls: "ad-modal__badge--danger", label: "Cancelado" },
  };
  const st = statusMap[order.status] || { cls: "ad-modal__badge--neutral", label: order.status };

  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__header">
          <div className="ad-modal__header-icon">📋</div>
          <div className="ad-modal__header-text">
            <h2 className="ad-modal__title">Orden #{order.id}</h2>
            <p className="ad-modal__subtitle">Detalle del pedido</p>
          </div>
          <button className="ad-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ad-modal__body">
          <div className="ad-modal__grid">
            <div className="ad-modal__field">
              <span className="ad-modal__label">Estado</span>
              <span className="ad-modal__value">
                <span className={`ad-modal__badge ${st.cls}`}>
                  <span className="ad-modal__badge-dot" />
                  {st.label}
                </span>
              </span>
            </div>
            <div className="ad-modal__field">
              <span className="ad-modal__label">Total</span>
              <span className="ad-modal__value ad-modal__value--price">
                ${Number(order.total).toLocaleString("es-CL")}
              </span>
            </div>
            <div className="ad-modal__field">
              <span className="ad-modal__label">Cliente</span>
              <span className="ad-modal__value">{(order.user?.firstName || order.user?.lastName) ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : order.user?.email || "—"}</span>
            </div>
            <div className="ad-modal__field">
              <span className="ad-modal__label">Fecha</span>
              <span className="ad-modal__value ad-modal__value--muted">
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

          {order.items && order.items.length > 0 && (
            <>
              <div className="ad-modal__separator" />
              <h4 className="ad-modal__section-title">Productos ({order.items.length})</h4>
              <div className="ad-modal__items">
                {order.items.map((item) => (
                  <div key={item.id} className="ad-modal__item">
                    <div className="ad-modal__item-thumb">
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
                        className="ad-modal__media-thumb"
                        style={{ display: item.imageUrl ? "none" : "flex" }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </span>
                    </div>
                    <div className="ad-modal__item-info">
                      <span className="ad-modal__item-name">{item.productName}</span>
                      <span className="ad-modal__item-meta">
                        {item.quantity} x ${Number(item.productPrice).toLocaleString("es-CL")}
                      </span>
                    </div>
                    <span className="ad-modal__item-price">
                      ${(item.quantity * Number(item.productPrice)).toLocaleString("es-CL")}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ad-modal__footer">
          <button className="ad-modal__btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
