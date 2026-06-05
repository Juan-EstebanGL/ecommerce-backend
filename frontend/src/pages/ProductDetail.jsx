import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/products";
import Loader from "../components/Loader";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await getProductById(id);
        setProduct(response.data);
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Error al cargar el producto";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="app-container">
        <h1>Detalle del producto</h1>
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-container">
        <h1>Detalle del producto</h1>
        <p className="form-error">{error}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="app-container">
        <h1>Detalle del producto</h1>
        <p>Producto no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="app-container">
      <div className="card" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="product-media">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div style={{padding:20}}>{product.name?.slice(0,1)}</div>}
        </div>
        <div>
          <h1 style={{marginTop:0}}>{product.name}</h1>
          {product.description && <p>{product.description}</p>}
          <p className="product-price">${product.price}</p>
          <p className="product-stock">Stock: {product.stock}</p>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
