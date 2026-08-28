import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import HomePage from "../pages/HomePage";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));
const CheckEmailPage = lazy(() => import("../pages/CheckEmailPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Orders = lazy(() => import("../pages/Orders"));
const OrderDetail = lazy(() => import("../pages/OrderDetail"));
const Profile = lazy(() => import("../pages/Profile"));
const Favorites = lazy(() => import("../pages/Favorites"));
const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminReviews = lazy(() => import("../pages/admin/AdminReviews"));
const AdminFavorites = lazy(() => import("../pages/admin/AdminFavorites"));
const AdminSettings = lazy(() => import("../pages/admin/AdminSettings"));
const AdminCategories = lazy(() => import("../pages/admin/AdminCategories"));

function RouteFallback() {
  return (
    <div className="loader loader--page">
      <div className="spinner" />
    </div>
  );
}

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

function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
    </Suspense>
  );
}

export default AppRouter;
