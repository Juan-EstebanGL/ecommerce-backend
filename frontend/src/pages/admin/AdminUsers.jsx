import { useEffect, useState, useRef } from "react";
import { getUsers, updateUserRole, deleteUser } from "../../api/users";
import { showConfirm, showError, showSuccess } from "../../utils/alerts";
import UserTable from "../../components/admin/UserTable";
import UserViewModal from "../../components/admin/UserViewModal";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 8;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [roleLoadingId, setRoleLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const tableRef = useRef(null);

  async function loadUsers(currentPage) {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers({ page: currentPage, limit: PAGE_SIZE });
      setUsers(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUsers({ page, limit: PAGE_SIZE });
        if (!cancelled) {
          setUsers(res.data?.data || []);
          setTotal(res.data?.total || 0);
          setTotalPages(res.data?.totalPages || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar usuarios");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

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
        loadUsers(page);
      }, 350);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al eliminar usuario";
      showError(msg);
      setDeletingId(null);
    }
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = [
    {
      label: "Total usuarios",
      value: total,
      color: "teal",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: "Administradores",
      value: users.filter((u) => u.role === "ADMIN").length,
      color: "purple",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: "Clientes",
      value: users.filter((u) => u.role === "USER").length,
      color: "blue",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Nuevos este mes",
      value: users.filter((u) => new Date(u.createdAt) >= startOfMonth).length,
      color: "success",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Usuarios</h1>
            <p className="ad-header__subtitle">Administración de usuarios</p>
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
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Usuarios</h1>
            <p className="ad-header__subtitle">Administración de usuarios</p>
          </div>
        </div>
        <div className="ad-users-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => loadUsers(page)}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-users">
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">Usuarios</h1>
          <p className="ad-header__subtitle">Administración de usuarios</p>
        </div>
      </div>

      <div className="ad-stats ad-users-stats" ref={tableRef}>
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

      <UserTable
        users={users}
        onView={handleView}
        onRoleToggle={handleRoleToggle}
        onDelete={handleDelete}
        deletingId={deletingId}
        roleLoadingId={roleLoadingId}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        itemsPerPage={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <UserViewModal user={viewingUser} onClose={() => setViewingUser(null)} />
    </div>
  );
}
