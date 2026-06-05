import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import { addToCart } from "../api/cart";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Input from "../components/Input";

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await getProducts();
        const data = response.data || [];
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Filter products based on search query and availability
  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by availability
    if (showOnlyAvailable) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, showOnlyAvailable, products]);

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
        {/* Header Section */}
        <section style={{ marginBottom: 40 }}>
          <h1 style={{ marginBottom: 8 }}>Catálogo de Productos</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Explora nuestro amplio catálogo de productos de alta calidad.
          </p>
        </section>

        {/* Messages */}
        {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}
        {cartMessage && <p style={{ color: "#16a34a", marginBottom: 16 }}>✓ {cartMessage}</p>}
        {cartError && <p className="form-error" style={{ marginBottom: 16 }}>{cartError}</p>}

        {/* Toolbar */}
        {!loading && (
          <div className="products-toolbar">
            <div style={{ display: "flex", gap: 12, flex: 1, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <label style={{ display: "flex", gap: 6, alignItems: "center", whiteSpace: "nowrap", color: "var(--muted)" }}>
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.95rem" }}>Solo disponibles</span>
              </label>
            </div>
            <div style={{ color: "var(--muted)", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <Loader />}

        {/* Products Grid or Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              {products.length === 0
                ? "No hay productos disponibles en este momento."
                : searchQuery
                ? `No hay productos que coincidan con "${searchQuery}".`
                : "No hay productos disponibles con esa disponibilidad."}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                addingId={addingId}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Products;
