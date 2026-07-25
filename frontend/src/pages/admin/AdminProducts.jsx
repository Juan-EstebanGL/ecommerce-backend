import { useEffect, useState, useRef, useMemo } from "react";
import { getProducts, deleteProduct } from "../../api/products";
import ProductTable from "../../components/admin/ProductTable";
import ProductFormModal from "../../components/admin/ProductFormModal";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import Pagination from "../../components/Pagination";
import useDebounce from "../../hooks/useDebounce";

const PAGE_SIZE = 8;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statsData, setStatsData] = useState({ totalAvailable: 0, totalLowStock: 0, totalOutOfStock: 0 });
  const tableRef = useRef(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getProducts({ limit: 100 });
        if (!cancelled) {
          setProducts(res.data?.data || []);
          setStatsData(res.data?.stats || { totalAvailable: 0, totalLowStock: 0, totalOutOfStock: 0 });
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar productos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return products;
    const q = debouncedSearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  }, [products, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  function handlePageChange(newPage) {
    setPage(newPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function refreshProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data?.data || []);
      setStatsData(res.data?.stats || { totalAvailable: 0, totalLowStock: 0, totalOutOfStock: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
  }

  async function handleDelete(productId) {
    const result = await showConfirm(
      "¿Eliminar producto?",
      "Esta acción eliminará permanentemente el producto y su imagen de Cloudinary."
    );

    if (!result.isConfirmed) return;

    setDeletingId(productId);

    try {
      await deleteProduct(productId);
      showSuccess("Producto eliminado correctamente");
      refreshProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al eliminar producto";
      showError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const stats = [
    {
      label: "Total productos",
      value: products.length,
      color: "teal",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      label: "Disponibles",
      value: statsData.totalAvailable,
      color: "success",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Poco stock",
      value: statsData.totalLowStock,
      color: "warning",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: "Agotados",
      value: statsData.totalOutOfStock,
      color: "danger",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="ad-products">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Productos</h1>
            <p className="ad-header__subtitle">Administración de productos</p>
          </div>
        </div>
        <div className="ad-products-loader">
          <div className="ad-products-loader__spinner" />
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-products">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Productos</h1>
            <p className="ad-header__subtitle">Administración de productos</p>
          </div>
        </div>
        <div className="ad-products-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => refreshProducts()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-products">
      <div className="ad-products-header">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Productos</h1>
            <p className="ad-header__subtitle">Gestiona el inventario de tu tienda</p>
          </div>
          <div className="ad-header__right">
            <button className="btn btn--primary" onClick={openCreateModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo producto
            </button>
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
            placeholder="Buscar por nombre o categoría..."
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

      <ProductTable products={paged} onEdit={openEditModal} onDelete={handleDelete} deletingId={deletingId} />

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <ProductFormModal
        key={modalOpen ? (editingProduct?.id ?? "create") : "closed"}
        mode={editingProduct ? "edit" : "create"}
        product={editingProduct}
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={refreshProducts}
      />
    </div>
  );
}
