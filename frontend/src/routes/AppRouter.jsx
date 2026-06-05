import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
    </Routes>
  );
}

export default AppRouter;
