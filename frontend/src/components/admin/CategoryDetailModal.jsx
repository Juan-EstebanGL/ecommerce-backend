import { useEffect, useState } from "react";
import { getCategoryById } from "../../api/categories";

export default function CategoryDetailModal({ category: initialCategory, onClose }) {
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCategoryById(initialCategory.id);
        if (!cancelled) setCategory(res.data);
      } catch {
        // use initial data as fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initialCategory.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ad-form-overlay" onClick={onClose}>
      <div className="ad-form-modal ad-categories-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-form-modal__header">
          <h2>Detalles de categoría</h2>
          <button className="ad-form-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ad-categories-detail-body">
          {loading ? (
            <div className="ad-categories-detail-loading">
              <div className="ad-products-loader__spinner" />
            </div>
          ) : (
            <>
              <div className="ad-categories-detail-top">
                <div className="ad-categories-detail-img">
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
                    className="ad-categories-detail-img__placeholder"
                    style={{ display: category.imageUrl ? "none" : "flex" }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                  </span>
                </div>

                <div className="ad-categories-detail-info">
                  <h3 className="ad-categories-detail-name">{category.name}</h3>
                  {category.description ? (
                    <p className="ad-categories-detail-desc">{category.description}</p>
                  ) : (
                    <p className="ad-categories-detail-desc ad-categories-detail-desc--empty">Sin descripción</p>
                  )}
                  <div className="ad-categories-detail-meta">
                    <div className="ad-categories-detail-meta__item">
                      <span className="ad-categories-detail-meta__label">Productos</span>
                      <span className="ad-categories-detail-meta__value">{category.productCount ?? 0}</span>
                    </div>
                    <div className="ad-categories-detail-meta__item">
                      <span className="ad-categories-detail-meta__label">Creada</span>
                      <span className="ad-categories-detail-meta__value">
                        {new Date(category.createdAt).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <div className="ad-categories-detail-meta__item">
                      <span className="ad-categories-detail-meta__label">Actualizada</span>
                      <span className="ad-categories-detail-meta__value">
                        {new Date(category.updatedAt).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {category.products && category.products.length > 0 && (
                <div className="ad-categories-detail-products">
                  <h4 className="ad-categories-detail-products__title">
                    Productos en esta categoría ({category.products.length})
                  </h4>
                  <div className="ad-products-table-wrapper">
                    <table className="ad-products-table">
                      <thead>
                        <tr>
                          <th>Imagen</th>
                          <th>Nombre</th>
                          <th>Precio</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.products.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <div className="ad-products-thumb">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    loading="lazy"
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
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                  </svg>
                                </span>
                              </div>
                            </td>
                            <td className="ad-products-cell-name">{product.name}</td>
                            <td>${Number(product.price).toLocaleString("es-CL")}</td>
                            <td>{product.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="ad-form__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
