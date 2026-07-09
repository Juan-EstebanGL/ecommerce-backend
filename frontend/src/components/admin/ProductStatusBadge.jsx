export default function ProductStatusBadge({ stock }) {
  let label, className;

  if (stock === 0) {
    label = "Agotado";
    className = "ad-products-badge ad-products-badge--danger";
  } else if (stock <= 5) {
    label = "Poco stock";
    className = "ad-products-badge ad-products-badge--warning";
  } else {
    label = "Disponible";
    className = "ad-products-badge ad-products-badge--success";
  }

  return <span className={className}>{label}</span>;
}
