import { Link, NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import UserMenu from "../UserMenu";

const links = [
  {
    to: "/admin",
    end: true,
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    to: "/admin/products",
    label: "Productos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    to: "/admin/categories",
    label: "Categorías",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    to: "/admin/orders",
    label: "Órdenes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Usuarios",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    to: "/admin/reviews",
    label: "Reseñas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    to: "/admin/favorites",
    label: "Favoritos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Configuración",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <>
      {open && <div className="ad-drawer-overlay" onClick={onClose} />}
      <aside className={`ad-sidebar${open ? " ad-sidebar--open" : ""}`}>
        <div className="ad-sidebar__logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span>Store</span>
        </div>

        <nav className="ad-sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `ad-sidebar__link${isActive ? " ad-sidebar__link--active" : ""}`
              }
              onClick={onClose}
            >
              <span className="ad-sidebar__icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ad-sidebar__user">
          <UserMenu direction="up" trigger={
              <div className="ad-user__info">
              <div className="ad-user__avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="ad-user__avatar-img" />
                ) : (
                  ((user?.firstName?.[0] || user?.email?.[0]) || "A").toUpperCase()
                )}
              </div>
              <div className="ad-user__details">
                <span className="ad-user__name">{(user?.firstName || user?.lastName) ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Admin"}</span>
                <span className="ad-user__email">{user?.email || ""}</span>
              </div>
              <span className="ad-user__badge">ADMIN</span>
            </div>
          }>
            {({ close }) => (
              <>
                <Link
                  to="/"
                  className="user-menu__item"
                  onClick={() => { close(); onClose?.(); }}
                  role="menuitem"
                >
                  🏠 Ver tienda
                </Link>
                <Link
                  to="/profile"
                  className="user-menu__item"
                  onClick={() => { close(); onClose?.(); }}
                  role="menuitem"
                >
                  👤 Mi perfil
                </Link>
                <button
                  className="user-menu__item user-menu__item--danger"
                  onClick={() => { close(); onClose?.(); logout(); }}
                  role="menuitem"
                >
                  🚪 Cerrar sesión
                </button>
              </>
            )}
          </UserMenu>
        </div>

        <div className="ad-sidebar__divider" />

        <button
          className="ad-sidebar__theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          {isDark ? "☀️ Tema claro" : "🌙 Tema oscuro"}
        </button>
      </aside>
    </>
  );
}
