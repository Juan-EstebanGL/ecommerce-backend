import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useFavoriteContext } from "../context/FavoriteContext";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { favorites, loading } = useFavoriteContext();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const isEmpty = !loading && favorites.length === 0;

  return (
    <main className="fv-page">
      <div className="app-container">
        <header className="fv-header">
          <div>
            <h1 className="fv-header__title">Mis favoritos</h1>
            <p className="fv-header__sub">
              Guarda los productos que más te interesan para comprarlos después.
            </p>
          </div>
          {!loading && favorites.length > 0 && (
            <span className="fv-header__count">
              {favorites.length} {favorites.length === 1 ? "producto guardado" : "productos guardados"}
            </span>
          )}
        </header>

        {loading && (
          <div className="fv-loading">
            <Loader />
          </div>
        )}

        {isEmpty && (
          <div className="fv-empty">
            <div className="fv-empty__icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h2 className="fv-empty__title">Aún no tienes favoritos</h2>
            <p className="fv-empty__desc">
              Explora nuestro catálogo y guarda los productos que más te gusten para encontrarlos fácilmente después.
            </p>
            <button className="fv-empty__btn" onClick={() => navigate("/products")}>
              Explorar productos
            </button>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="product-grid">
            {favorites.map((fav) => (
              <ProductCard
                key={fav.id}
                product={fav.product}
                onAddToCart={null}
                addingId={null}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Favorites;
