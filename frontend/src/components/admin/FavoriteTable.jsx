import AdminThumb from "./AdminThumb";

const placeholderImg = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

function PopularityBadge({ count }) {
  if (count >= 10) {
    return <span className="ad-favorites-badge ad-favorites-badge--hot">🔥 Muy popular</span>;
  }
  if (count >= 5) {
    return <span className="ad-favorites-badge ad-favorites-badge--popular">⭐ Popular</span>;
  }
  return <span className="ad-favorites-badge ad-favorites-badge--low">📦 Poco popular</span>;
}

export default function FavoriteTable({ products, onView }) {
  if (!products.length) {
    return (
      <div className="ad-favorites-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        <p>No hay productos guardados como favoritos</p>
      </div>
    );
  }

  return (
    <div className="ad-favorites-table-wrapper">
      <table className="ad-favorites-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Total favoritos</th>
            <th>Popularidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <AdminThumb
                  imageUrl={product.imageUrl}
                  alt={product.name}
                  thumbClassName="ad-favorites-thumb"
                  placeholderClassName="ad-favorites-thumb__placeholder"
                >
                  {placeholderImg}
                </AdminThumb>
              </td>
              <td className="ad-favorites-cell-name">{product.name}</td>
              <td className="ad-favorites-cell-count">{product.totalFavorites}</td>
              <td><PopularityBadge count={product.totalFavorites} /></td>
              <td>
                <div className="ad-favorites-actions">
                  <button
                    className="ad-favorites-btn ad-favorites-btn--view"
                    title="Ver producto"
                    onClick={() => onView(product)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
