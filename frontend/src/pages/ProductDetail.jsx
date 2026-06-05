import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/products";

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
      <main>
        <h1>Detalle del producto</h1>
        <p>Cargando producto...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Detalle del producto</h1>
        <p style={{ color: "red" }}>{error}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <h1>Detalle del producto</h1>
        <p>Producto no encontrado.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{product.name}</h1>
      {product.description && <p>{product.description}</p>}
      <p>Precio: {product.price}</p>
      <p>Stock: {product.stock}</p>
    </main>
  );
}

export default ProductDetail;
