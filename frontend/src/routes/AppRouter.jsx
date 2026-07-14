import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import CheckEmailPage from "../pages/CheckEmailPage";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail";
import Profile from "../pages/Profile";
import Favorites from "../pages/Favorites";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminReviews from "../pages/admin/AdminReviews";
import AdminFavorites from "../pages/admin/AdminFavorites";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminCategories from "../pages/admin/AdminCategories";

function AdminGuard({ children }) {
  const { user } = useAuthContext();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") {
    return (
      <div className="ad-403">
        <div className="ad-403__code">403</div>
        <h2 className="ad-403__title">Acceso denegado</h2>
        <p className="ad-403__text">No tienes permisos para acceder a esta sección.</p>
        <a href="/" className="btn btn--primary">Volver al inicio</a>
      </div>
    );
  }
  return children;
}

function AdminPlaceholder({ title }) {
  return (
    <div>
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">{title}</h1>
          <p className="ad-header__subtitle">Gestión de {title.toLowerCase()}</p>
        </div>
      </div>
      <div className="ad-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <p>Módulo en desarrollo</p>
      </div>
    </div>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/check-email" element={<CheckEmailPage />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="favorites" element={<AdminFavorites />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
