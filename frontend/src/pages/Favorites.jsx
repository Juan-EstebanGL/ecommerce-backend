import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { getFavorites } from "../api/favorites";
import { addToCart } from "../api/cart";
import { useCartContext } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import { showSuccess, showError, showWarning } from "../utils/alerts";

const PAGE_SIZE = 20;

function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { refreshCartCount } = useCartContext();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [addingId, setAddingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getFavorites({ page, limit: PAGE_SIZE });
        if (!cancelled) {
          setFavorites(res.data?.data || []);
          setTotal(res.data?.total || 0);
          setTotalPages(res.data?.totalPages || 0);
        }
      } catch {
        if (!cancelled) {
          setFavorites([]);
          setTotal(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, page]);

  const filtered = useMemo(() => {
    let result = favorites;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.product?.name?.toLowerCase().includes(q) ||
          (f.product?.description && f.product.description.toLowerCase().includes(q))
      );
    }

    if (showOnlyAvailable) {
      result = result.filter((f) => f.product?.stock > 0);
    }

    return result;
  }, [favorites, searchQuery, showOnlyAvailable]);

  const hasActiveFilters = searchQuery.trim() !== "" || showOnlyAvailable;

  function handlePageChange(newPage) {
    setPage(newPage);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleFavoriteToggle(productId, isNowFavorite) {
    if (!isNowFavorite) {
      setFavorites((prev) => {
        const next = prev.filter((f) => f.productId !== productId);
        const newTotal = total - 1;
        setTotal(newTotal);
        const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
        setTotalPages(newTotalPages);
        if (page > newTotalPages) setPage(newTotalPages);
        return next;
      });
    }
  }

  async function handleAddToCart(productId, quantity = 1) {
    const product = favorites.find((f) => f.product?.id === productId)?.product;
    if (product && quantity > product.stock) {
      showWarning("Stock insuficiente", `Solo hay ${product.stock} unidades disponibles.`);
      return;
    }

    setAddingId(productId);

    try {
      await addToCart(productId, quantity);
      refreshCartCount();
      const msg = `${quantity} ${quantity === 1 ? "producto" : "productos"} agregado${quantity !== 1 ? "s" : ""} al carrito`;
      showSuccess(msg);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "No se pudo agregar al carrito");
    } finally {
      setAddingId(null);
    }
  }

  if (!user) return null;

  const isEmpty = !loading && total === 0;
  const noResults = !loading && total > 0 && filtered.length === 0;

  return (
    <main className="fv-page">
      <div className="fv-page__glow fv-page__glow--teal" />
      <div className="fv-page__glow fv-page__glow--rose" />
      <div className="app-container">
        <nav className="breadcrumb fv-breadcrumb" aria-label="Navegación">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Inicio</a>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Favoritos</span>
        </nav>

        <header className="fv-header">
          <div className="fv-header__text">
            <h1 className="fv-header__title">Mis favoritos</h1>
            <p className="fv-header__sub">
              Guarda los productos que más te interesan para comprarlos después.
            </p>
          </div>
          {!loading && total > 0 && (
            <span className="fv-header__count">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {total} {total === 1 ? "producto guardado" : "productos guardados"}
            </span>
          )}
        </header>

        {loading && (
          <div className="fv-loading">
            <Loader />
          </div>
        )}

        {isEmpty && (
          <div className="fv-empty">
            <div className="fv-empty__icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h2 className="fv-empty__title">Aún no tienes favoritos</h2>
            <p className="fv-empty__desc">
              Explora nuestro catálogo y guarda los productos que más te gusten para encontrarlos fácilmente después.
            </p>
            <button className="fv-empty__btn" onClick={() => navigate("/products")}>
              Explorar productos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}

        {!loading && total > 0 && (
          <div className="products-toolbar">
            <div className="pr-toolbar__controls">
              <div className="pr-toolbar__search">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar productos"
                />
              </div>
              <label className="pr-filter-label">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                />
                <span>Solo disponibles</span>
              </label>
            </div>
            <span className="pr-toolbar-count">
              {hasActiveFilters
                ? `${filtered.length} ${filtered.length === 1 ? "producto encontrado" : "productos encontrados"}`
                : `${total} ${total === 1 ? "producto guardado" : "productos guardados"}`
              }
            </span>
          </div>
        )}

        {noResults && (
          <div className="pr-empty">
            <div className="pr-empty__icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h2 className="pr-empty__title">No se encontraron productos</h2>
            <p className="pr-empty__desc">
              {searchQuery
                ? `No encontramos favoritos que coincidan con "${searchQuery}".`
                : "No hay productos disponibles con el filtro seleccionado."}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <div className="product-grid fv-grid" ref={gridRef}>
              {filtered.map((fav, idx) => (
                <div key={fav.id} className="fv-grid__item" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <ProductCard
                    product={fav.product}
                    onAddToCart={handleAddToCart}
                    addingId={addingId}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </div>
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemsPerPage={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default Favorites;
