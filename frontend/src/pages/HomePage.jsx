import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Button from "../components/Button";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeaturedProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await getProducts();
        const allProducts = response.data || [];
        // Take max 3 products
        setProducts(allProducts.slice(0, 3));
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error cargando productos destacados");
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedProducts();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="app-container" style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
          <h1 style={{ margin: "0 0 16px 0", fontSize: "3rem", color: "var(--brand)" }}>
            Bienvenido a E-Shop
          </h1>
          <p style={{ margin: "0 0 32px 0", fontSize: "1.25rem", color: "var(--muted)", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            Descubre miles de productos de calidad con entregas rápidas y compra 100% segura.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button onClick={() => navigate("/products")}>Ver productos</Button>
            <Button onClick={() => navigate("/products")} variant="ghost">Explorar catálogo</Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ backgroundColor: "var(--bg)", paddingTop: 60, paddingBottom: 60 }}>
        <div className="app-container">
          <h2 style={{ textAlign: "center", marginBottom: 40 }}>Por qué elegirnos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { title: "Envíos rápidos", desc: "Entrega en 2-3 días hábiles" },
              { title: "Compra segura", desc: "Pago 100% protegido" },
              { title: "Productos de calidad", desc: "Marcas verificadas y confiables" },
              { title: "Soporte 24/7", desc: "Atención al cliente siempre disponible" },
            ].map((benefit, idx) => (
              <div key={idx} className="card">
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--brand)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  marginBottom: 12,
                }}>
                  {idx === 0 && "🚚"}
                  {idx === 1 && "🔒"}
                  {idx === 2 && "⭐"}
                  {idx === 3 && "💬"}
                </div>
                <h3 style={{ margin: "0 0 8px 0" }}>{benefit.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="app-container">
          <h2 style={{ textAlign: "center", marginBottom: 40 }}>Productos destacados</h2>
          
          {loading && <Loader />}
          {error && <p className="form-error" style={{ textAlign: "center" }}>{error}</p>}

          {!loading && !error && products.length === 0 && (
            <div className="card" style={{ textAlign: "center" }}>
              <p>No hay productos disponibles en este momento.</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={null}
                    addingId={null}
                  />
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Button onClick={() => navigate("/products")}>Ver todos los productos</Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Final Section */}
      <section style={{ background: `linear-gradient(135deg, var(--brand), var(--brand-700))`, color: "#fff", paddingTop: 60, paddingBottom: 60 }}>
        <div className="app-container" style={{ textAlign: "center" }}>
          <h2 style={{ margin: "0 0 16px 0" }}>¿Listo para comenzar?</h2>
          <p style={{ margin: "0 0 24px 0", fontSize: "1.1rem", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Explora nuestro catálogo completo y encuentra exactamente lo que buscas.
          </p>
          <button 
            className="btn btn--ghost" 
            onClick={() => navigate("/products")}
            style={{ borderColor: "#fff", color: "#fff" }}
          >
            Comprar ahora
          </button>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
