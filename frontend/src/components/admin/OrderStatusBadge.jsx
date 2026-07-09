export default function OrderStatusBadge({ status }) {
  const labels = {
    PENDING: "Pendiente",
    PAID: "Pagado",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return <span className={`badge badge--${status}`}>{labels[status] || status}</span>;
}
