import { useEffect, useState, useRef, useMemo } from "react";
import { getCategories, deleteCategory } from "../../api/categories";
import CategoryTable from "../../components/admin/CategoryTable";
import CategoryFormModal from "../../components/admin/CategoryFormModal";
import CategoryDetailModal from "../../components/admin/CategoryDetailModal";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import Pagination from "../../components/Pagination";
import useDebounce from "../../hooks/useDebounce";

const PAGE_SIZE = 8;

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [detailCategory, setDetailCategory] = useState(null);
  const tableRef = useRef(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCategories();
        if (!cancelled) setCategories(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar categorías");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return categories;
    const q = debouncedSearch.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  async function refreshCategories() {
    setLoading(true);
    setError("");
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openCreateModal() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCategory(null);
  }

  async function handleDelete(categoryId) {
    const result = await showConfirm(
      "¿Eliminar categoría?",
      "Esta acción eliminará la categoría y su imagen de Cloudinary permanentemente."
    );

    if (!result.isConfirmed) return;

    setDeletingId(categoryId);

    try {
      await deleteCategory(categoryId);
      showSuccess("Categoría eliminada correctamente");
      refreshCategories();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al eliminar categoría";
      showError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const totalWithImage = categories.filter((c) => c.imageUrl).length;
  const totalWithout = categories.length - totalWithImage;

  const stats = [
    {
      label: "Total categorías",
      value: categories.length,
      color: "teal",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      label: "Con imagen",
      value: totalWithImage,
      color: "success",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      label: "Sin imagen",
      value: totalWithout,
      color: "warning",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: "Sin productos",
      value: categories.filter((c) => c.productCount === 0).length,
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
            <h1 className="ad-header__title">Categorías</h1>
            <p className="ad-header__subtitle">Administración de categorías</p>
          </div>
        </div>
        <div className="ad-products-loader">
          <div className="ad-products-loader__spinner" />
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Categorías</h1>
            <p className="ad-header__subtitle">Administración de categorías</p>
          </div>
        </div>
        <div className="ad-products-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => refreshCategories()}>
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
          <h1 className="ad-header__title">Categorías</h1>
          <p className="ad-header__subtitle">Administración de categorías</p>
        </div>
        <div className="ad-header__right">
          <button className="btn btn--primary" onClick={openCreateModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva categoría
          </button>
        </div>
      </div>

      <div className="ad-stats ad-products-stats" ref={tableRef}>
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
            placeholder="Buscar categorías..."
            className="ad-products-search__input"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <CategoryTable
        categories={paged}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onView={setDetailCategory}
        deletingId={deletingId}
      />

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <CategoryFormModal
        key={modalOpen ? (editingCategory?.id ?? "create") : "closed"}
        mode={editingCategory ? "edit" : "create"}
        category={editingCategory}
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={refreshCategories}
      />

      {detailCategory && (
        <CategoryDetailModal
          category={detailCategory}
          onClose={() => setDetailCategory(null)}
        />
      )}
    </div>
  );
}
