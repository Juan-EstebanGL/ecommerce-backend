import { useState, useEffect, useCallback } from "react";
import OrderStatusBadge from "./OrderStatusBadge";

const STATUS_TRANSITIONS = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS = {
  PAID: "Marcar como pagada",
  PROCESSING: "Procesar pedido",
  SHIPPED: "Marcar como enviada",
  DELIVERED: "Marcar como entregada",
};

export default function OrderTable({ orders, onView, onStatusChange, loadingId }) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const closeDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  useEffect(() => {
    if (openDropdownId === null) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") closeDropdown();
    }

    function handleClickOutside(e) {
      const el = document.querySelector(`[data-dropdown-id="${openDropdownId}"]`);
      if (el && !el.contains(e.target)) {
        closeDropdown();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId, closeDropdown]);

  function toggleDropdown(orderId) {
    setOpenDropdownId((prev) => (prev === orderId ? null : orderId));
  }

  function handleSelect(orderId, value) {
    closeDropdown();
    onStatusChange(orderId, value);
  }

  if (!orders.length) {
    return (
      <div className="ad-orders-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <p>No hay órdenes registradas</p>
      </div>
    );
  }

  return (
    <div className="ad-orders-table-wrapper">
      <table className="ad-orders-table">
        <thead>
          <tr>
            <th>N° Orden</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isLoading = loadingId === order.id;
            const isOpen = openDropdownId === order.id;
            const transitions = STATUS_TRANSITIONS[order.status] || [];

            return (
              <tr key={order.id} className={isLoading ? "ad-orders-row--loading" : ""}>
                <td className="ad-orders-cell-id">#{order.id}</td>
                <td className="ad-orders-cell-client">
                  <span className="ad-orders-cell-client__email">{(order.user?.firstName || order.user?.lastName) ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : order.user?.email || "—"}</span>
                </td>
                <td>{order.items?.length || 0}</td>
                <td className="ad-orders-cell-total">
                  ${Number(order.total).toLocaleString("es-CL")}
                </td>
                <td><OrderStatusBadge status={order.status} /></td>
                <td className="ad-orders-cell-date">
                  {new Date(order.createdAt).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  <div className="ad-orders-actions">
                    <button
                      className="ad-orders-btn ad-orders-btn--view"
                      title="Ver detalle"
                      onClick={() => onView(order)}
                      disabled={isLoading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    {transitions.length > 0 && (
                      <div
                        className="ad-orders-status-dropdown"
                        data-dropdown-id={order.id}
                      >
                        <button
                          className={`ad-orders-btn--status${isOpen ? " ad-orders-btn--status--active" : ""}`}
                          onClick={() => toggleDropdown(order.id)}
                          disabled={isLoading}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                          </svg>
                          Estado
                        </button>
                        <div className={`ad-orders-status-options${isOpen ? " ad-orders-status-options--open" : ""}`}>
                          {transitions.map((value) => (
                            value === "CANCELLED" ? (
                              <div key={value}>
                                <div className="ad-orders-status-divider" />
                                <button
                                  className="ad-orders-status-option ad-orders-status-option--danger"
                                  onClick={() => handleSelect(order.id, value)}
                                >
                                  Cancelar orden
                                </button>
                              </div>
                            ) : (
                              <button
                                key={value}
                                className="ad-orders-status-option"
                                onClick={() => handleSelect(order.id, value)}
                              >
                                {STATUS_LABELS[value] || value}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
