import { useEffect, useState, useRef, useMemo } from "react";
import { getAdminFavorites } from "../../api/favorites";
import FavoriteTable from "../../components/admin/FavoriteTable";
import Pagination from "../../components/Pagination";
import useDebounce from "../../hooks/useDebounce";

const PAGE_SIZE = 8;

export default function AdminFavorites() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingProduct, setViewingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const tableRef = useRef(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAdminFavorites({ limit: 100 });
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar favoritos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const allProducts = data?.products || [];

    if (!debouncedSearch.trim()) return allProducts;
    const q = debouncedSearch.toLowerCase().trim();
    return allProducts.filter(
      (p) => p.name.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handlePageChange(newPage) {
    setPage(newPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const stats = data
    ? [
        {
          label: "Total favoritos",
          value: data.totalFavorites,
          color: "danger",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          ),
        },
        {
          label: "Usuarios con favoritos",
          value: data.totalUsersWithFavorites,
          color: "purple",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          ),
        },
        {
          label: "Más guardado",
          value: data.mostFavoritedProduct
            ? `${data.mostFavoritedProduct.totalFavorites} favs`
            : "—",
          color: "amber",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          ),
        },
        {
          label: "Promedio favs / producto",
          value: data.averageFavoritesPerProduct,
          color: "teal",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          ),
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="ad-favorites">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Favoritos</h1>
            <p className="ad-header__subtitle">Análisis de productos favoritos</p>
          </div>
        </div>
        <div className="ad-favorites-loader">
          <div className="ad-favorites-loader__spinner" />
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-favorites">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Favoritos</h1>
            <p className="ad-header__subtitle">Análisis de productos favoritos</p>
          </div>
        </div>
        <div className="ad-favorites-error">
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
    <div className="ad-favorites">
      <div className="ad-favorites-header">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Favoritos</h1>
            <p className="ad-header__subtitle">Análisis de productos favoritos</p>
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
            placeholder="Buscar productos favoritos..."
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
          <span className="ad-products-count__label">{filtered.length === 1 ? "producto" : "productos"}</span>
        </div>
      </div>

      <FavoriteTable products={paged} onView={setViewingProduct} />

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <FavoriteViewModal
        product={viewingProduct}
        totalFavorites={data?.totalFavorites || 0}
        onClose={() => setViewingProduct(null)}
      />
    </div>
  );
}

function FavoriteViewModal({ product, totalFavorites, onClose }) {
  if (!product) return null;

  const percentage = totalFavorites > 0
    ? ((product.totalFavorites / totalFavorites) * 100).toFixed(1)
    : 0;

  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__header">
          <div className="ad-modal__header-icon">❤️</div>
          <div className="ad-modal__header-text">
            <h2 className="ad-modal__title">Detalle de favorito</h2>
            <p className="ad-modal__subtitle">Producto más popular</p>
          </div>
          <button className="ad-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ad-modal__body">
          <div className="ad-modal__media-row">
            <div className="ad-modal__media-thumb">
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
                className="ad-modal__media-thumb"
                style={{ display: product.imageUrl ? "none" : "flex", position: "absolute" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
            </div>
            <div className="ad-modal__media-info">
              <span className="ad-modal__media-label">Producto</span>
              <span className="ad-modal__media-name">{product.name}</span>
            </div>
          </div>

          <div className="ad-modal__grid">
            <div className="ad-modal__field">
              <span className="ad-modal__label">Favoritos</span>
              <span className="ad-modal__value ad-modal__value--price">{product.totalFavorites}</span>
            </div>
            <div className="ad-modal__field">
              <span className="ad-modal__label">Porcentaje del total</span>
              <span className="ad-modal__value">
                <span className="ad-modal__badge ad-modal__badge--info">
                  {percentage}%
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="ad-modal__footer">
          <button className="ad-modal__btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
