import ProductStatusBadge from "./ProductStatusBadge";

const placeholderImg = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function ProductTable({ products, onEdit, onDelete, deletingId }) {
  if (!products.length) {
    return (
      <div className="ad-products-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <p>No hay productos registrados</p>
      </div>
    );
  }

  return (
    <div className="ad-products-table-wrapper">
      <table className="ad-products-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isDeleting = deletingId === product.id;

            return (
              <tr key={product.id} className={isDeleting ? "ad-delete--fade-out" : ""}>
                <td>
                  <div className="ad-products-thumb">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="ad-products-thumb__placeholder"
                      style={{ display: product.imageUrl ? "none" : "flex" }}
                    >
                      {placeholderImg}
                    </span>
                  </div>
                </td>
                <td className="ad-products-cell-name">{product.name}</td>
                <td className="ad-products-cell-price">
                  ${Number(product.price).toLocaleString("es-CL")}
                </td>
                <td>{product.stock}</td>
                <td><ProductStatusBadge stock={product.stock} /></td>
                <td>
                  <div className="ad-products-actions">
                    <button className="ad-products-btn ad-products-btn--edit" title="Editar" onClick={() => onEdit(product)} disabled={isDeleting}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="ad-products-btn ad-products-btn--delete"
                      title="Eliminar"
                      onClick={() => onDelete(product.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="ad-delete__spinner" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      )}
                    </button>
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
