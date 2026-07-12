const placeholderImg = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

export default function CategoryTable({ categories, onEdit, onDelete, onView, deletingId }) {
  if (!categories.length) {
    return (
      <div className="ad-products-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
        <p>No hay categorías registradas</p>
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
            <th>Descripción</th>
            <th>Productos</th>
            <th>Creada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const isDeleting = deletingId === category.id;

            return (
              <tr key={category.id} className={isDeleting ? "ad-delete--fade-out" : ""}>
                <td>
                  <div className="ad-products-thumb">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="ad-products-thumb__placeholder"
                      style={{ display: category.imageUrl ? "none" : "flex" }}
                    >
                      {placeholderImg}
                    </span>
                  </div>
                </td>
                <td className="ad-products-cell-name">{category.name}</td>
                <td className="ad-categories-cell-desc">
                  {category.description ? (
                    <span title={category.description}>
                      {category.description.length > 60
                        ? category.description.slice(0, 60) + "..."
                        : category.description}
                    </span>
                  ) : (
                    <span className="ad-categories-no-desc">—</span>
                  )}
                </td>
                <td>{category.productCount}</td>
                <td>{new Date(category.createdAt).toLocaleDateString("es-CL")}</td>
                <td>
                  <div className="ad-products-actions">
                    <button
                      className="ad-products-btn ad-products-btn--view"
                      title="Ver detalles"
                      onClick={() => onView(category)}
                      disabled={isDeleting}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button className="ad-products-btn ad-products-btn--edit" title="Editar" onClick={() => onEdit(category)} disabled={isDeleting}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="ad-products-btn ad-products-btn--delete"
                      title="Eliminar"
                      onClick={() => onDelete(category.id)}
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
