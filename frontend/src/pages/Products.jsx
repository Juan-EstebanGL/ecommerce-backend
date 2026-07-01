import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import { addToCart } from "../api/cart";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { useCartContext } from "../context/CartContext";
import Input from "../components/Input";
import { showSuccess, showError, showWarning } from "../utils/alerts";

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const { refreshCartCount } = useCartContext();

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

  async function handleAddToCart(productId, quantity = 1) {
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      showWarning("Stock insuficiente", `Solo hay ${product.stock} unidades disponibles.`);
      return;
    }

    setAddingId(productId);

    try {
      await addToCart(productId, quantity);
      refreshCartCount();
      const msg = `${quantity} ${quantity === 1 ? "producto" : "productos"} agregado${quantity !== 1 ? "s" : ""} al carrito`;
      showSuccess(msg);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "No se pudo agregar al carrito");
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
