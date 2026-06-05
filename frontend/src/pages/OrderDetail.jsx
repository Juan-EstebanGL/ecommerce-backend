import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "../api/orders";

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await getOrderById(id);
        setOrder(response.data?.order || null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <main>
        <h1>Detalle de orden</h1>
        <p>Cargando orden...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Detalle de orden</h1>
        <p style={{ color: "red" }}>{error}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main>
        <h1>Detalle de orden</h1>
        <p>Orden no encontrada.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Orden #{order.id}</h1>
      <p>Estado: {order.status}</p>
      <p>Total: {order.total}</p>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {order.items?.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
            }}
          >
            <h2>{item.productName}</h2>
            <p>Precio: {item.productPrice}</p>
            <p>Cantidad: {item.quantity}</p>
            <p>Subtotal: {item.productPrice * item.quantity}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default OrderDetail;
