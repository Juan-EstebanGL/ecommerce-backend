import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <main>
      <h1>Productos</h1>
      {loading && <p>Cargando productos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
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
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;
