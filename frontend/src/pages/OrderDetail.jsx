import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "../api/orders";
import Badge from "../components/Badge";

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
      <main className="app-container">
        <h1>Detalle de orden</h1>
        <p>Cargando orden...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-container">
        <h1>Detalle de orden</h1>
        <p className="form-error">{error}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="app-container">
        <h1>Detalle de orden</h1>
        <p>Orden no encontrada.</p>
      </main>
    );
  }

  return (
    <main className="app-container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <h1 style={{margin:0}}>Orden #{order.id}</h1>
        <Badge status={order.status}>{order.status}</Badge>
      </div>
      <p>Total: {order.total}</p>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {order.items?.map((item) => (
          <div key={item.id} className="card">
            <h2 style={{margin:0}}>{item.productName}</h2>
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
