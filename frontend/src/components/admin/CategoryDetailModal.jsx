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
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__header">
          <div className="ad-modal__header-icon">📁</div>
          <div className="ad-modal__header-text">
            <h2 className="ad-modal__title">Detalles de categoría</h2>
            <p className="ad-modal__subtitle">Información y productos</p>
          </div>
          <button className="ad-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ad-modal__body">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <div className="ad-products-loader__spinner" />
            </div>
          ) : (
            <>
              {category.imageUrl && (
                <div className="ad-modal__media-row">
                  <div className="ad-modal__media-thumb" style={{ width: 56, height: 56 }}>
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="ad-modal__media-info">
                    <span className="ad-modal__media-label">Categoría</span>
                    <span className="ad-modal__media-name">{category.name}</span>
                  </div>
                </div>
              )}

              {!category.imageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "var(--text)" }}>
                    {category.name}
                  </h3>
                </div>
              )}

              <div className="ad-modal__grid">
                <div className="ad-modal__field">
                  <span className="ad-modal__label">Productos</span>
                  <span className="ad-modal__value ad-modal__value--price">{category.productCount ?? 0}</span>
                </div>
                <div className="ad-modal__field">
                  <span className="ad-modal__label">Creada</span>
                  <span className="ad-modal__value ad-modal__value--muted">
                    {new Date(category.createdAt).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="ad-modal__field ad-modal__field--full">
                  <span className="ad-modal__label">Última actualización</span>
                  <span className="ad-modal__value ad-modal__value--muted">
                    {new Date(category.updatedAt).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              </div>

              {category.description && (
                <>
                  <div className="ad-modal__separator" />
                  <h4 className="ad-modal__section-title">Descripción</h4>
                  <p className="ad-modal__comment">{category.description}</p>
                </>
              )}

              {category.products && category.products.length > 0 && (
                <>
                  <div className="ad-modal__separator" />
                  <h4 className="ad-modal__section-title">Productos en esta categoría ({category.products.length})</h4>
                  <div className="ad-modal__items">
                    {category.products.map((product) => (
                      <div key={product.id} className="ad-modal__item">
                        <div className="ad-modal__item-thumb">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          )}
                        </div>
                        <div className="ad-modal__item-info">
                          <span className="ad-modal__item-name">{product.name}</span>
                          <span className="ad-modal__item-meta">Stock: {product.stock}</span>
                        </div>
                        <span className="ad-modal__item-price">
                          ${Number(product.price).toLocaleString("es-CL")}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
