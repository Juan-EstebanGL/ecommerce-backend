import AppRouter from "./routes/AppRouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoriteProvider } from "./context/FavoriteContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoriteProvider>
          <Navbar />
          <AppRouter />
          <Footer />
        </FavoriteProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
