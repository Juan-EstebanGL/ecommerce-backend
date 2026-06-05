import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";
import { addToCart } from "../api/cart";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const navigate = useNavigate();

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
      <h1>Productos</h1>
      {loading && <p>Cargando productos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {cartMessage && <p style={{ color: "green" }}>{cartMessage}</p>}
      {cartError && <p style={{ color: "red" }}>{cartError}</p>}
      {!loading && !error && products.length === 0 && <p>No hay productos disponibles.</p>}
      <div style={{ display: "grid", gap: "1rem" }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
            }}
          >
            <h2>{product.name}</h2>
            <p>Precio: {product.price}</p>
            <p>Stock: {product.stock}</p>
            <button onClick={() => navigate(`/products/${product.id}`)}>
              Ver detalle
            </button>
            <button
              type="button"
              disabled={addingId === product.id}
              onClick={() => handleAddToCart(product.id)}
              style={{ marginLeft: "0.5rem" }}
            >
              {addingId === product.id ? "Agregando..." : "Agregar al carrito"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;
