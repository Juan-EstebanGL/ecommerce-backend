import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import { addToCart } from "../api/cart";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import { useCartContext } from "../context/CartContext";
import Input from "../components/Input";
import { showSuccess, showError, showWarning } from "../utils/alerts";

const PAGE_SIZE = 20;

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts(),
          getCategories().catch(() => ({ data: [] })),
        ]);
        const data = prodRes.data?.data || prodRes.data || [];
        setProducts(data);
        setFilteredProducts(data);
        setCategories(catRes.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
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

    setFilteredProducts(filtered);
    setPage(1);
  }, [searchQuery, showOnlyAvailable, selectedCategory, products]);

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
      <div className="app-container">
        <header className="pr-header">
          <h1 className="pr-header__title">Catálogo de Productos</h1>
          <p className="pr-header__sub">
            Explora nuestro amplio catálogo de productos de alta calidad.
          </p>
        </header>

        {error && <p className="form-error pr-error">{error}</p>}

        {!loading && (
          <div className="products-toolbar">
            <div className="pr-toolbar__controls">
              <div className="pr-toolbar__search">
                <Input
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
            {categories.length > 0 && (
              <div className="pr-toolbar__categories">
                <button
                  className={`pr-category-chip${!selectedCategory ? " pr-category-chip--active" : ""}`}
                  onClick={() => handleCategoryChange("")}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`pr-category-chip${String(selectedCategory) === String(cat.id) ? " pr-category-chip--active" : ""}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            <span className="pr-toolbar-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>
        )}

        {loading && (
          <div className="pr-loading">
            <Loader />
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="pr-empty">
            <div className="pr-empty__icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h2 className="pr-empty__title">
              {products.length === 0
                ? "No hay productos disponibles"
                : searchQuery
                ? "Sin resultados"
                : "Ningún producto coincide"}
            </h2>
            <p className="pr-empty__desc">
              {products.length === 0
                ? "Vuelve más tarde para descubrir nuevas incorporaciones al catálogo."
                : searchQuery
                ? `No encontramos productos que coincidan con "${searchQuery}".`
                : "No hay productos disponibles con el filtro seleccionado."}
            </p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <>
            <div className="product-grid" ref={gridRef}>
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
