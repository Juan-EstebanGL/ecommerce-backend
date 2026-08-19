import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { showWarning } from "../utils/alerts";

const categoryStyles = [
  { gradient: "linear-gradient(135deg, #0ea5a4, #3b82f6)", icon: (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )},
  { gradient: "linear-gradient(135deg, #7c3aed, #a855f7)", icon: (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="11" x2="10" y2="11" />
      <line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" />
      <line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z" />
    </svg>
  )},
  { gradient: "linear-gradient(135deg, #f59e0b, #f97316)", icon: (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { gradient: "linear-gradient(135deg, #ef4444, #ec4899)", icon: (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )},
  { gradient: "linear-gradient(135deg, #10b981, #06b6d4)", icon: (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )},
];

function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("hm-revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function RevealSection({ children, className = "", ...props }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`hm-reveal ${className}`} {...props}>
      {children}
    </div>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeaturedProducts() {
      setLoading(true);
      setError("");

      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts(),
          getCategories().catch(() => ({ data: [] })),
        ]);
        const allProducts = prodRes.data?.data || prodRes.data || [];
        setProducts(allProducts.slice(0, 4));
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error cargando productos destacados");
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedProducts();
  }, []);

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    showWarning(
      "Newsletter",
      "¡Gracias por tu interés! La funcionalidad estará disponible próximamente."
    );
    setEmail("");
  }

  return (
    <main>
      {/* ── Hero ── */}
      <section className="hm-hero">
        <div className="hm-hero__bg" />
        <div className="hm-hero__glow hm-hero__glow--1" />
        <div className="hm-hero__glow hm-hero__glow--2" />
        <div className="hm-hero__glow hm-hero__glow--3" />
        <div className="app-container hm-hero__inner">
          <div className="hm-hero__content">
            <span className="hm-hero__chip">Nueva colección 2026</span>
            <h1 className="hm-hero__title">
              Descubre productos que{" "}
              <span className="hm-hero__title-accent">transforman</span>{" "}
              tu experiencia
            </h1>
            <p className="hm-hero__desc">
              Explora nuestra colección de tecnología, gaming y accesorios con
              envío rápido y compra 100% segura.
            </p>
            <div className="hm-hero__actions">
              <button
                className="hm-hero__btn hm-hero__btn--primary"
                onClick={() => navigate("/products")}
              >
                Explorar productos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button
                className="hm-hero__btn hm-hero__btn--ghost"
                onClick={() => navigate("/products")}
              >
                Ver ofertas
              </button>
            </div>
          </div>
          <div className="hm-hero__visual">
            <div className="hm-hero__shape hm-hero__shape--1" />
            <div className="hm-hero__shape hm-hero__shape--2" />
            <div className="hm-hero__shape hm-hero__shape--3" />
            <div className="hm-hero__shape hm-hero__shape--4" />
            <div className="hm-hero__shape hm-hero__shape--5" />
            <svg className="hm-hero__float-icon hm-hero__float-icon--cart" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            <svg className="hm-hero__float-icon hm-hero__float-icon--box" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <svg className="hm-hero__float-icon hm-hero__float-icon--shield" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <RevealSection>
        <section className="hm-section">
          <div className="app-container">
            <div className="hm-section__header">
              <h2 className="hm-section__title">Explora categorías</h2>
              <p className="hm-section__sub">Encuentra lo que buscas en nuestras categorías principales.</p>
            </div>
          <div className="hm-cats">
            {categories.length > 0
              ? categories.slice(0, 5).map((cat, idx) => {
                  const style = categoryStyles[idx % categoryStyles.length];
                  return (
                    <div
                      key={cat.id}
                      className="hm-cat"
                      style={{ "--cat-gradient": style.gradient }}
                      onClick={() => navigate(`/products?category=${cat.id}`)}
                      role="link"
                      tabIndex={0}
                    >
                      <div className="hm-cat__icon">{style.icon}</div>
                      <h3 className="hm-cat__name">{cat.name}</h3>
                      <p className="hm-cat__desc">{cat.productCount} {cat.productCount === 1 ? "producto" : "productos"}</p>
                    </div>
                  );
                })
              : [
                  { name: "Tecnología", desc: "Laptops, tablets y más" },
                  { name: "Gaming", desc: "Consolas y periféricos" },
                  { name: "Hogar", desc: "Electrodomésticos inteligentes" },
                  { name: "Accesorios", desc: "Audífonos, relojes y más" },
                ].map((cat, idx) => {
                  const style = categoryStyles[idx % categoryStyles.length];
                  return (
                    <div key={idx} className="hm-cat" style={{ "--cat-gradient": style.gradient }} onClick={() => navigate("/products")}>
                      <div className="hm-cat__icon">{style.icon}</div>
                      <h3 className="hm-cat__name">{cat.name}</h3>
                      <p className="hm-cat__desc">{cat.desc}</p>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ── Featured Products ── */}
      <RevealSection>
      <section className="hm-section hm-section--alt">
        <div className="app-container">
          <div className="hm-section__header">
            <h2 className="hm-section__title">Productos destacados</h2>
            <p className="hm-section__sub">Los favoritos de nuestra comunidad.</p>
          </div>

          {loading && <Loader />}
          {error && <p className="form-error" style={{ textAlign: "center" }}>{error}</p>}

          {!loading && !error && products.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--muted)", margin: 0 }}>
                No hay productos disponibles en este momento.
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <>
              <div className="hm-featured">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={null}
                    addingId={null}
                  />
                ))}
              </div>
              <div className="hm-section__action">
                <button
                  className="hm-outline-btn"
                  onClick={() => navigate("/products")}
                >
                  Ver todos los productos
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      </RevealSection>

      {/* ── Benefits ── */}
      <RevealSection>
      <section className="hm-section">
        <div className="app-container">
          <div className="hm-section__header">
            <h2 className="hm-section__title">¿Por qué elegirnos?</h2>
            <p className="hm-section__sub">Todo lo que necesitas, con la confianza que mereces.</p>
          </div>
          <div className="hm-benefits">
            <div className="hm-benefit">
              <div className="hm-benefit__icon hm-benefit__icon--1">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="hm-benefit__title">Envío rápido</h3>
              <p className="hm-benefit__desc">Recibe tus productos en la puerta de tu casa en tiempo récord.</p>
            </div>
            <div className="hm-benefit">
              <div className="hm-benefit__icon hm-benefit__icon--2">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h3 className="hm-benefit__title">Pago seguro</h3>
              <p className="hm-benefit__desc">Tus transacciones están protegidas con los más altos estándares.</p>
            </div>
            <div className="hm-benefit">
              <div className="hm-benefit__icon hm-benefit__icon--3">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="hm-benefit__title">Garantía incluida</h3>
              <p className="hm-benefit__desc">Todos nuestros productos cuentan con garantía de satisfacción.</p>
            </div>
            <div className="hm-benefit">
              <div className="hm-benefit__icon hm-benefit__icon--4">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <h3 className="hm-benefit__title">Soporte 24/7</h3>
              <p className="hm-benefit__desc">Nuestro equipo está disponible para ayudarte en todo momento.</p>
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ── Banner ── */}
      <RevealSection>
      <section className="hm-banner">
        <div className="hm-banner__bg" />
        <div className="app-container hm-banner__inner">
          <div className="hm-banner__content">
            <span className="hm-banner__tag">Colección 2026</span>
            <h2 className="hm-banner__title">Descubre nuestros productos más populares</h2>
            <p className="hm-banner__desc">
              Calidad, innovación y diseño se unen en cada uno de nuestros artículos.
            </p>
            <button
              className="hm-banner__btn"
              onClick={() => navigate("/products")}
            >
              Explorar colección
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <div className="hm-banner__stats">
            <div className="hm-banner__stat">
              <span className="hm-banner__stat-value">10K+</span>
              <span className="hm-banner__stat-label">Clientes satisfechos</span>
            </div>
            <div className="hm-banner__stat">
              <span className="hm-banner__stat-value">500+</span>
              <span className="hm-banner__stat-label">Productos disponibles</span>
            </div>
            <div className="hm-banner__stat">
              <span className="hm-banner__stat-value">24h</span>
              <span className="hm-banner__stat-label">Envío express</span>
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ── Newsletter ── */}
      <RevealSection>
      <section className="hm-section hm-section--alt">
        <div className="app-container">
          <div className="hm-newsletter">
            <h2 className="hm-newsletter__title">Mantente al día</h2>
            <p className="hm-newsletter__desc">
              Suscríbete para recibir novedades, ofertas exclusivas y lanzamientos directamente en tu correo.
            </p>
            <form className="hm-newsletter__form" onSubmit={handleNewsletterSubmit}>
              <div className="hm-newsletter__input-wrap">
                <svg className="hm-newsletter__input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  className="hm-newsletter__input"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="hm-newsletter__btn">
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ── Final CTA ── */}
      <RevealSection>
      <section className="hm-cta">
        <div className="hm-cta__bg" />
        <div className="app-container hm-cta__inner">
          <h2 className="hm-cta__title">¿Listo para empezar?</h2>
          <p className="hm-cta__desc">
            Explora nuestro catálogo completo y encuentra exactamente lo que buscas.
          </p>
          <button
            className="hm-cta__btn"
            onClick={() => navigate("/products")}
          >
            Explorar productos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>
      </RevealSection>
    </main>
  );
}

export default HomePage;
