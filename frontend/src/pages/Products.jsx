import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import { addToCart } from "../api/cart";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await getProducts();
        setProducts(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  async function handleAddToCart(productId) {
    setCartMessage("");
    setCartError("");
    setAddingId(productId);

    try {
      await addToCart(productId, 1);
      setCartMessage("Producto agregado al carrito");
    } catch (err) {
      setCartError(err?.response?.data?.message || err?.message || "No se pudo agregar al carrito");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <main>
      <div className="app-container">
      <h1>Productos</h1>
      {loading && <Loader />}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {cartMessage && <p style={{ color: "green" }}>{cartMessage}</p>}
      {cartError && <p style={{ color: "red" }}>{cartError}</p>}
      {!loading && !error && products.length === 0 && <p>No hay productos disponibles.</p>}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} addingId={addingId} />
        ))}
      </div>
      </div>
    </main>
  );
}

export default Products;
