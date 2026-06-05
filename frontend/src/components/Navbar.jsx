import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
      }}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        {user ? (
          <>
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>{user.email}</span>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
