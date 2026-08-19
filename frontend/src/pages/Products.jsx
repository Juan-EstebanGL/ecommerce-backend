import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import { addToCart } from "../api/cart";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { useCartContext } from "../context/CartContext";
import { showSuccess, showError, showWarning } from "../utils/alerts";

const PAGE_SIZE = 20;

function SkeletonCard() {
  return (
    <article className="pc pc--skeleton">
      <div className="pc__media">
        <div className="pc__skeleton-img" />
      </div>
      <div className="pc__body">
        <div className="pc__skeleton-line pc__skeleton-line--short" />
        <div className="pc__skeleton-line pc__skeleton-line--tiny" />
        <div className="pc__skeleton-line pc__skeleton-line--medium" />
        <div className="pc__skeleton-line pc__skeleton-line--tiny" />
      </div>
    </article>
  );
}

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);
  const gridRef = useRef(null);
  const { refreshCartCount } = useCartContext();

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showOnlyAvailable) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => String(product.categoryId) === String(selectedCategory)
      );
    }

    return filtered;
  }, [searchQuery, showOnlyAvailable, selectedCategory, products]);

  const filterKey = `${searchQuery}|${showOnlyAvailable}|${selectedCategory}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ limit: 100 }),
          getCategories().catch(() => ({ data: [] })),
        ]);
        const data = prodRes.data?.data || prodRes.data || [];
        setProducts(data);
        setCategories(catRes.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  }

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pageStart = (page - 1) * PAGE_SIZE;
  const currentPageProducts = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE);

  function handlePageChange(newPage) {
    setPage(newPage);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleAddToCart(productId, quantity = 1) {
    const product = products.find((p) => p.id === productId);
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

  return (
    <main className="pr-page">
      <div className="pr-page__ambient" />
      <div className="pr-page__ambient pr-page__ambient--accent" />

      <div className="app-container">
        <header className="pr-header">
          <span className="pr-header__chip">Catálogo</span>
          <h1 className="pr-header__title">Explora nuestros productos</h1>
          <p className="pr-header__sub">
            Tecnología, accesorios y más con envío rápido y compra segura.
          </p>
        </header>

        {error && (
          <div className="pr-error" role="alert">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            <div className="pr-search">
              <svg className="pr-search__icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="pr-search__input"
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar productos"
              />
              {searchQuery && (
                <button
                  className="pr-search__clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Limpiar búsqueda"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <div className="pr-filters">
              {categories.length > 0 && (
                <div className="pr-filters__chips" role="tablist" aria-label="Filtrar por categoría">
                  <button
                    className={`pr-chip${!selectedCategory ? " pr-chip--active" : ""}`}
                    onClick={() => handleCategoryChange("")}
                    role="tab"
                    aria-selected={!selectedCategory}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`pr-chip${String(selectedCategory) === String(cat.id) ? " pr-chip--active" : ""}`}
                      onClick={() => handleCategoryChange(cat.id)}
                      role="tab"
                      aria-selected={String(selectedCategory) === String(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="pr-filters__controls">
                <label className="pr-toggle">
                  <input
                    type="checkbox"
                    checked={showOnlyAvailable}
                    onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  />
                  <span className="pr-toggle__track" />
                  <span className="pr-toggle__label">Disponibles</span>
                </label>
                <span className="pr-count">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
                </span>
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="pr-grid" aria-busy="true" aria-label="Cargando productos">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="pr-empty">
            <div className="pr-empty__icon">
              {products.length === 0 ? (
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              )}
            </div>
            <h2 className="pr-empty__title">
              {products.length === 0
                ? "Catálogo vacío"
                : searchQuery
                ? "Sin resultados"
                : "Sin coincidencias"}
            </h2>
            <p className="pr-empty__desc">
              {products.length === 0
                ? "Vuelve más tarde para descubrir nuevas incorporaciones al catálogo."
                : searchQuery
                ? `No encontramos productos que coincidan con "${searchQuery}". Prueba con otro término.`
                : "No hay productos disponibles con los filtros seleccionados."}
            </p>
            {(searchQuery || selectedCategory || showOnlyAvailable) && (
              <button
                className="pr-empty__btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setShowOnlyAvailable(false);
                  setSearchParams({});
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <>
            <div className="pr-grid" ref={gridRef}>
              {currentPageProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  addingId={addingId}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={filteredProducts.length}
              itemsPerPage={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default Products;
