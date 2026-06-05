import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar app-container">
      <div className="nav-left">
        <Link to="/" className="brand">E-Shop</Link>
        <nav className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/products">Productos</Link>
          <Link to="/cart">Carrito</Link>
          {user && <Link to="/orders">Órdenes</Link>}
        </nav>
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <div className="user-bubble">{user.email}</div>
            <button className="btn btn--ghost" type="button" onClick={logout}>Logout</button>
          </>
        ) : (
          <div className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
