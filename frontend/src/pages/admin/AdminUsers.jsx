import { useEffect, useState, useRef, useMemo } from "react";
import { getUsers, updateUserRole, deleteUser } from "../../api/users";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import UserTable from "../../components/admin/UserTable";
import UserViewModal from "../../components/admin/UserViewModal";
import Pagination from "../../components/Pagination";
import useDebounce from "../../hooks/useDebounce";

const PAGE_SIZE = 8;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [roleLoadingId, setRoleLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statsData, setStatsData] = useState({ totalAdmins: 0, totalClients: 0, totalNewThisMonth: 0 });
  const tableRef = useRef(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getUsers({ limit: 100 });
        if (!cancelled) {
          setUsers(res.data?.data || []);
          setStatsData(res.data?.stats || { totalAdmins: 0, totalClients: 0, totalNewThisMonth: 0 });
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar usuarios");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return users;
    const q = debouncedSearch.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  async function refreshUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers({ limit: 100 });
      setUsers(res.data?.data || []);
      setStatsData(res.data?.stats || { totalAdmins: 0, totalClients: 0, totalNewThisMonth: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar usuarios");
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

  function handleView(user) {
    setViewingUser(user);
  }

  async function handleRoleToggle(user) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const actionLabel = newRole === "ADMIN" ? "Promocionar" : "Degradar";
    const message =
      newRole === "ADMIN"
        ? `¿Estás seguro de promocionar a ${user.email} como administrador?`
        : `¿Estás seguro de degradar a ${user.email} a usuario normal?`;

    const result = await showConfirm(
      `${actionLabel} usuario`,
      message,
      actionLabel,
      "Cancelar"
    );
    if (!result.isConfirmed) return;

    setRoleLoadingId(user.id);

    try {
      const res = await updateUserRole(user.id, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
      showSuccess(`Usuario ${newRole === "ADMIN" ? "promocionado" : "degradado"} correctamente`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al actualizar rol";
      showError(msg);
    } finally {
      setRoleLoadingId(null);
    }
  }

  async function handleDelete(userId) {
    const result = await showConfirm(
      "¿Eliminar usuario?",
      "Esta acción eliminará permanentemente el usuario y todos sus datos asociados."
    );
    if (!result.isConfirmed) return;

    setDeletingId(userId);

    try {
      await deleteUser(userId);
      setTimeout(() => {
        setDeletingId(null);
        showSuccess("Usuario eliminado correctamente");
        refreshUsers();
      }, 350);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al eliminar usuario";
      showError(msg);
      setDeletingId(null);
    }
  }

  const stats = [
    {
      label: "Total usuarios",
      value: users.length,
      color: "teal",
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
      label: "Administradores",
      value: statsData.totalAdmins,
      color: "purple",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: "Clientes",
      value: statsData.totalClients,
      color: "blue",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Nuevos este mes",
      value: statsData.totalNewThisMonth,
      color: "success",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="ad-users">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Usuarios</h1>
            <p className="ad-header__subtitle">Gestiona los usuarios del sistema</p>
          </div>
        </div>
        <div className="ad-users-loader">
          <div className="ad-users-loader__spinner" />
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-users">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Usuarios</h1>
            <p className="ad-header__subtitle">Gestiona los usuarios del sistema</p>
          </div>
        </div>
        <div className="ad-users-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => refreshUsers()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-users">
      <div className="ad-users-header">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Usuarios</h1>
            <p className="ad-header__subtitle">Gestiona los usuarios del sistema</p>
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
            placeholder="Buscar por nombre o email..."
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
          <span className="ad-products-count__label">{filtered.length === 1 ? "usuario" : "usuarios"}</span>
        </div>
      </div>

      <UserTable
        users={paged}
        onView={handleView}
        onRoleToggle={handleRoleToggle}
        onDelete={handleDelete}
        deletingId={deletingId}
        roleLoadingId={roleLoadingId}
      />

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <UserViewModal user={viewingUser} onClose={() => setViewingUser(null)} />
    </div>
  );
}
