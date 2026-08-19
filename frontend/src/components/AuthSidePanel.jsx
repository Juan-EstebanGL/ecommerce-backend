function AuthSidePanel() {
  return (
    <div className="auth-left">
      <div className="auth-left__bg">
        <div className="auth-circle auth-circle--1" />
        <div className="auth-circle auth-circle--2" />
        <div className="auth-circle auth-circle--3" />
        <div className="auth-circle auth-circle--4" />
      </div>
      <div className="auth-left__inner">
        <h1 className="auth-left__title">Bienvenido a E-Shop</h1>
        <p className="auth-left__desc">
          Compra productos de calidad, administra tus pedidos y disfruta una experiencia moderna.
        </p>
        <ul className="auth-benefits">
          <li className="auth-benefits__item">
            <span className="auth-benefits__icon">✓</span>
            <span>Compra segura</span>
          </li>
          <li className="auth-benefits__item">
            <span className="auth-benefits__icon">✓</span>
            <span>Envíos rápidos</span>
          </li>
          <li className="auth-benefits__item">
            <span className="auth-benefits__icon">✓</span>
            <span>Soporte 24/7</span>
          </li>
        </ul>
        <p className="auth-left__footnote">Más de 1000 clientes satisfechos.</p>
      </div>
    </div>
  );
}

export default AuthSidePanel;