import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../api/products";
import ProductTable from "../../components/admin/ProductTable";
import ProductFormModal from "../../components/admin/ProductFormModal";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getProducts();
        if (!cancelled) setProducts(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar productos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function refreshProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts();
      setProducts(res.data || []);
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
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showSuccess("Producto eliminado correctamente");
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      label: "Disponibles",
      value: products.filter((p) => p.stock > 5).length,
      color: "success",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Poco stock",
      value: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      color: "warning",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: "Agotados",
      value: products.filter((p) => p.stock === 0).length,
      color: "danger",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div>
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
      <div>
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
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-products">
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">Productos</h1>
          <p className="ad-header__subtitle">Administración de productos</p>
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

      <div className="ad-stats ad-products-stats">
        {stats.map((s) => (
          <div key={s.label} className={`ad-card ad-card--${s.color}`}>
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
            placeholder="Buscar productos..."
            className="ad-products-search__input"
            disabled
          />
        </div>
      </div>

      <ProductTable products={products} onEdit={openEditModal} onDelete={handleDelete} deletingId={deletingId} />

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
