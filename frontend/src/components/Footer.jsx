import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__section footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-icon">◆</span>
            <span className="footer__logo-text">E-Shop</span>
          </div>
          <p className="footer__desc">
            Compra productos de calidad, administra tus pedidos y disfruta una experiencia moderna.
          </p>
        </div>
        <div className="footer__section">
          <h4 className="footer__heading">Enlaces rápidos</h4>
          <nav className="footer__nav" aria-label="Enlaces del footer">
            <Link to="/">Inicio</Link>
            <Link to="/products">Productos</Link>
            <Link to="/cart">Carrito</Link>
            <Link to="/orders">Órdenes</Link>
          </nav>
        </div>
        <div className="footer__section">
          <h4 className="footer__heading">Tecnologías</h4>
          <ul className="footer__list">
            <li>React</li>
            <li>Vite</li>
            <li>Axios</li>
            <li>Express</li>
            <li>Prisma</li>
            <li>PostgreSQL</li>
            <li>JWT</li>
          </ul>
        </div>
        <div className="footer__section">
          <h4 className="footer__heading">Contacto</h4>
          <ul className="footer__list">
            <li>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4l-10 8L2 4" />
              </svg>
              contacto@eshop.com
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              github.com/juan-eshop
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              linkedin.com/in/juan-eshop
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2026 E-Shop. Desarrollado por Juan Esteban Gómez.</p>
      </div>
    </footer>
  );
}

export default Footer;
