import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useCartContext } from "../context/CartContext";
import UserMenu from "./UserMenu";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cartCount, refreshCartCount } = useCartContext();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      refreshCartCount();
    }
  }, [user]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const isActive = (path) => location.pathname === path;

  const closeDrawer = () => setDrawerOpen(false);

  const avatarLetter = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <header className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          <div className="navbar__left">
            <Link to="/" className="navbar__logo" aria-label="Ir al inicio">
              <span className="navbar__logo-icon">◆</span>
              <span className="navbar__logo-text">E-Shop</span>
            </Link>
            <nav className="navbar__desktop-nav" aria-label="Navegación principal">
              <Link
                to="/"
                className={`navbar__link${isActive("/") ? " navbar__link--active" : ""}`}
              >
                Inicio
                {isActive("/") && <span className="navbar__link-indicator" />}
              </Link>
              <Link
                to="/products"
                className={`navbar__link${isActive("/products") ? " navbar__link--active" : ""}`}
              >
                Productos
                {isActive("/products") && <span className="navbar__link-indicator" />}
              </Link>
              <Link
                to="/cart"
                className={`navbar__link${isActive("/cart") ? " navbar__link--active" : ""}`}
              >
                Carrito
                {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
                {isActive("/cart") && <span className="navbar__link-indicator" />}
              </Link>
              {user && (
                <Link
                  to="/orders"
                  className={`navbar__link${isActive("/orders") ? " navbar__link--active" : ""}`}
                >
                  Órdenes
                  {isActive("/orders") && <span className="navbar__link-indicator" />}
                </Link>
              )}
              {user && (
                <Link
                  to="/favorites"
                  className={`navbar__link${isActive("/favorites") ? " navbar__link--active" : ""}`}
                >
                  Favoritos
                  {isActive("/favorites") && <span className="navbar__link-indicator" />}
                </Link>
              )}
            </nav>
          </div>
          <div className="navbar__right">
            {user ? (
              <UserMenu
                trigger={
                  <button className="navbar__avatar" aria-label="Menú de usuario">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="navbar__avatar-img" />
                    ) : (
                      avatarLetter
                    )}
                  </button>
                }
              >
                {({ close }) => (
                  <>
                    <div className="navbar__dropdown-header">
                      <span className="navbar__dropdown-name">{user.email}</span>
                      <span className="navbar__dropdown-role">
                        {user.role || "Usuario"}
                      </span>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link
                      to="/profile"
                      className="navbar__dropdown-item"
                      onClick={close}
                      role="menuitem"
                    >
                      👤 Mi perfil
                    </Link>
                    <Link
                      to="/favorites"
                      className="navbar__dropdown-item"
                      onClick={close}
                      role="menuitem"
                    >
                      ❤️ Mis favoritos
                    </Link>
                    <Link
                      to="/orders"
                      className="navbar__dropdown-item"
                      onClick={close}
                      role="menuitem"
                    >
                      📦 Mis pedidos
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        className="navbar__dropdown-item"
                        onClick={close}
                        role="menuitem"
                      >
                        👑 Panel de administración
                      </Link>
                    )}
                    <button
                      className="navbar__dropdown-item navbar__dropdown-item--danger"
                      onClick={() => { close(); logout(); }}
                      role="menuitem"
                    >
                      🚪 Cerrar sesión
                    </button>
                  </>
                )}
              </UserMenu>
            ) : (
              <div className="navbar__auth">
                <Link to="/login" className="navbar__auth-link">Iniciar sesión</Link>
                <Link to="/register" className="navbar__auth-btn">Crear cuenta</Link>
              </div>
            )}
            <button
              className="navbar__hamburger"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={drawerOpen}
            >
              <span className={`navbar__hamburger-line${drawerOpen ? " open" : ""}`} />
              <span className={`navbar__hamburger-line${drawerOpen ? " open" : ""}`} />
              <span className={`navbar__hamburger-line${drawerOpen ? " open" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="navbar__overlay" onClick={closeDrawer} aria-hidden="true" />
      )}

      <div
        className={`navbar__drawer${drawerOpen ? " navbar__drawer--open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className="navbar__drawer-header">
          <span className="navbar__logo-icon">◆</span>
          <span className="navbar__logo-text">E-Shop</span>
        </div>
        <nav className="navbar__drawer-links" aria-label="Navegación móvil">
          <Link
            to="/"
            className={`navbar__drawer-link${isActive("/") ? " navbar__drawer-link--active" : ""}`}
            onClick={closeDrawer}
          >
            Inicio
          </Link>
          <Link
            to="/products"
            className={`navbar__drawer-link${isActive("/products") ? " navbar__drawer-link--active" : ""}`}
            onClick={closeDrawer}
          >
            Productos
          </Link>
          <Link
            to="/cart"
            className={`navbar__drawer-link${isActive("/cart") ? " navbar__drawer-link--active" : ""}`}
            onClick={closeDrawer}
          >
            Carrito{cartCount > 0 && ` (${cartCount})`}
          </Link>
          {user && (
            <>
              <Link
                to="/profile"
                className={`navbar__drawer-link${isActive("/profile") ? " navbar__drawer-link--active" : ""}`}
                onClick={closeDrawer}
              >
                👤 Mi perfil
              </Link>
              <Link
                to="/favorites"
                className={`navbar__drawer-link${isActive("/favorites") ? " navbar__drawer-link--active" : ""}`}
                onClick={closeDrawer}
              >
                ❤️ Mis favoritos
              </Link>
              <Link
                to="/orders"
                className={`navbar__drawer-link${isActive("/orders") ? " navbar__drawer-link--active" : ""}`}
                onClick={closeDrawer}
              >
                📦 Mis pedidos
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className={`navbar__drawer-link${isActive("/admin") ? " navbar__drawer-link--active" : ""}`}
                  onClick={closeDrawer}
                >
                  👑 Panel de administración
                </Link>
              )}
            </>
          )}
        </nav>
        <div className="navbar__drawer-divider" />
        {user ? (
          <div className="navbar__drawer-user">
            <span className="navbar__drawer-email">{user.email}</span>
            <button
              className="navbar__drawer-logout"
              onClick={() => { closeDrawer(); logout(); }}
            >
              🚪 Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="navbar__drawer-auth">
            <Link to="/login" className="navbar__drawer-auth-link" onClick={closeDrawer}>
              Iniciar sesión
            </Link>
            <Link to="/register" className="navbar__drawer-auth-btn" onClick={closeDrawer}>
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;
