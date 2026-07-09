import { useEffect, useState } from "react";
import { getDashboard } from "../../api/admin";
import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import CountUpModule from "react-countup";
const CountUp = CountUpModule.default || CountUpModule;
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const STATUS_META = {
  pending: { label: "Pendientes", color: "#1d4ed8", bg: "#eff6ff" },
  paid: { label: "Pagadas", color: "#059669", bg: "#ecfdf5" },
  processing: { label: "Procesando", color: "#c2410c", bg: "#fff7ed" },
  shipped: { label: "Enviadas", color: "#7c3aed", bg: "#f5f3ff" },
  delivered: { label: "Entregadas", color: "#16a34a", bg: "#f0fdf4" },
  cancelled: { label: "Canceladas", color: "#dc2626", bg: "#fef2f2" },
};

function formatCurrency(value) {
  return "$" + Number(value).toLocaleString("es-CL");
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SkeletonBlock({ width, height, borderRadius }) {
  return (
    <div
      className="ad-dashboard-skeleton"
      style={{ width: width || "100%", height: height || "20px", borderRadius: borderRadius || "8px" }}
    />
  );
}

function SkeletonTableRow() {
  return (
    <div className="ad-dashboard-table-row">
      <SkeletonBlock width="40px" height="16px" />
      <SkeletonBlock width="140px" height="16px" />
      <SkeletonBlock width="60px" height="16px" />
      <SkeletonBlock width="70px" height="20px" borderRadius="12px" />
      <SkeletonBlock width="80px" height="14px" />
    </div>
  );
}

function SkeletonReviewRow() {
  return (
    <div className="ad-dashboard-review-row">
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
        <SkeletonBlock width="28px" height="28px" borderRadius="50%" />
        <SkeletonBlock width="120px" height="14px" />
      </div>
      <SkeletonBlock width="200px" height="14px" />
      <div style={{ marginTop: "8px" }}>
        <SkeletonBlock width="60px" height="14px" />
      </div>
    </div>
  );
}

function SkeletonImageRow() {
  return (
    <div className="ad-dashboard-product-row">
      <SkeletonBlock width="40px" height="40px" borderRadius="8px" />
      <SkeletonBlock width="120px" height="16px" />
      <SkeletonBlock width="50px" height="16px" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="ad-dashboard">
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">Dashboard</h1>
          <p className="ad-header__subtitle">Bienvenido de nuevo</p>
        </div>
      </div>

      {/* Skeleton Row 1 — Charts */}
      <div className="ad-dashboard-chart-row">
        <div className="ad-dashboard-section ad-dashboard-chart-section">
          <SkeletonBlock width="160px" height="20px" />
          <div style={{ marginTop: "20px" }}>
            <SkeletonBlock width="180px" height="180px" borderRadius="50%" />
          </div>
        </div>
        <div className="ad-dashboard-section ad-dashboard-chart-section">
          <SkeletonBlock width="140px" height="20px" />
          <div style={{ marginTop: "20px" }}>
            <SkeletonBlock width="120px" height="40px" borderRadius="8px" />
          </div>
          <div style={{ marginTop: "16px" }}>
            <SkeletonBlock width="100%" height="170px" borderRadius="8px" />
          </div>
        </div>
        <div className="ad-dashboard-section ad-dashboard-chart-section">
          <SkeletonBlock width="140px" height="20px" />
          <div style={{ marginTop: "16px" }}>
            <SkeletonBlock width="100%" height="220px" borderRadius="8px" />
          </div>
        </div>
      </div>

      {/* Skeleton Row 2 — Low Stock / Combined Favorited + Top Rated */}
      <div className="ad-dashboard-row">
        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section">
            <SkeletonBlock width="190px" height="20px" />
            <div className="ad-dashboard-list" style={{ marginTop: "16px" }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonImageRow key={i} />)}
            </div>
          </div>
        </div>
        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section" style={{ padding: 0 }}>
            <div style={{ padding: "20px 20px 16px" }}>
              <SkeletonBlock width="190px" height="20px" />
              <div className="ad-dashboard-list" style={{ marginTop: "16px" }}>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonImageRow key={i} />)}
              </div>
            </div>
            <div style={{ height: "1px", background: "#e8eaee", margin: "0 20px" }} />
            <div style={{ padding: "16px 20px 20px" }}>
              <SkeletonBlock width="190px" height="20px" />
              <div className="ad-dashboard-list" style={{ marginTop: "16px" }}>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonImageRow key={i} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Row 3 — Latest Orders / Recent Reviews */}
      <div className="ad-dashboard-row">
        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section">
            <SkeletonBlock width="140px" height="20px" />
            <div className="ad-dashboard-table" style={{ marginTop: "16px" }}>
              <div className="ad-dashboard-table__header">
                <span>ID</span>
                <span>Cliente</span>
                <span>Total</span>
                <span>Estado</span>
                <span>Fecha</span>
              </div>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} />)}
            </div>
          </div>
        </div>
        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section">
            <SkeletonBlock width="140px" height="20px" />
            <div className="ad-dashboard-list" style={{ marginTop: "16px" }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonReviewRow key={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getDashboard();
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div>
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Dashboard</h1>
            <p className="ad-header__subtitle">Panel de administración</p>
          </div>
        </div>
        <div className="ad-dashboard-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { stats, orders, lowStockProducts, latestOrders, mostFavoritedProducts, topRatedProducts, recentReviews, monthlyRevenue } = data;

  const statusEntries = [
    { key: "pending", value: orders.pending },
    { key: "paid", value: orders.paid },
    { key: "processing", value: orders.processing },
    { key: "shipped", value: orders.shipped },
    { key: "delivered", value: orders.delivered },
    { key: "cancelled", value: orders.cancelled },
  ];

  const revenueBarData = [{ name: "Ingresos", value: stats.revenue }];

  return (
    <div className="ad-dashboard">
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">Dashboard</h1>
          <p className="ad-header__subtitle">
            Resumen general del panel de administración
          </p>
        </div>
        <div className="ad-header__right">
          <span className="ad-header__badge">ADMIN</span>
        </div>
      </div>



      {/* Row 1 — PieChart Orders + Revenue Chart */}
      <div className="ad-dashboard-chart-row">
        <div className="ad-dashboard-section ad-dashboard-chart-section">
          <h2 className="ad-dashboard-section__title">Estado de órdenes</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusEntries.map((e) => ({
                  name: STATUS_META[e.key].label,
                  value: e.value,
                  color: STATUS_META[e.key].color,
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {statusEntries.map((e) => (
                  <Cell key={e.key} fill={STATUS_META[e.key].color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                formatter={(value) => [value, "Órdenes"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="ad-dashboard-chart-legend">
            {statusEntries.map((e) => {
              const meta = STATUS_META[e.key];
              return (
                <div key={e.key} className="ad-dashboard-chart-legend__item">
                  <span className="ad-dashboard-chart-legend__dot" style={{ background: meta.color }} />
                  <span className="ad-dashboard-chart-legend__label">{meta.label}</span>
                  <span className="ad-dashboard-chart-legend__value">{e.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ad-dashboard-section ad-dashboard-chart-section">
          <h2 className="ad-dashboard-section__title">Ingresos Totales</h2>
          <div className="ad-dashboard-revenue">
            <div className="ad-dashboard-revenue__amount">
              <span className="ad-dashboard-revenue__currency">$</span>
              <CountUp end={stats.revenue} duration={1.6} separator="." decimals={0} />
            </div>
            <div className="ad-dashboard-revenue__label">Ingresos por órdenes entregadas</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7185" }} tickLine={false} axisLine={{ stroke: "#f0f2f5" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7185" }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} tickLine={false} axisLine={false} width={50} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                formatter={(value) => [formatCurrency(value), "Ingresos"]}
              />
              <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ad-dashboard-section ad-dashboard-chart-section">
          <h2 className="ad-dashboard-section__title">Evolución de ventas</h2>
          <div className="ad-dashboard-chart-subtitle">Ingresos de los últimos 12 meses</div>
          {monthlyRevenue && monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7185" }} tickLine={false} axisLine={{ stroke: "#f0f2f5" }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7185" }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                  formatter={(value) => [formatCurrency(value), "Ingresos"]}
                  labelStyle={{ fontWeight: 600, color: "#1a1d29" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="ad-dashboard-empty">Sin datos de ventas mensuales</div>
          )}
        </div>
      </div>

      {/* Row 2 — Low Stock / Combined Most Favorited + Top Rated */}
      <div className="ad-dashboard-row">
        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section">
            <h2 className="ad-dashboard-section__title">Productos con poco stock</h2>
            {lowStockProducts.length === 0 ? (
              <div className="ad-dashboard-empty">Sin productos con bajo stock</div>
            ) : (
              <div className="ad-dashboard-list">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="ad-dashboard-product-row">
                    <div className="ad-dashboard-product-row__thumb">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <span className="ad-dashboard-product-row__name">{p.name}</span>
                    <span className={`ad-dashboard-badge ad-dashboard-badge--${p.stock <= 5 ? "danger" : p.stock <= 10 ? "warning" : "success"}`}>
                      {p.stock} uds.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section ad-dashboard-combined-section">
            <div className="ad-dashboard-combined-section__half">
              <h2 className="ad-dashboard-section__title">Productos más guardados</h2>
              {mostFavoritedProducts.length === 0 ? (
                <div className="ad-dashboard-empty">Sin productos favoritos</div>
              ) : (
                <div className="ad-dashboard-list">
                  {mostFavoritedProducts.map((p) => (
                    <div key={p.id} className="ad-dashboard-product-row">
                      <div className="ad-dashboard-product-row__thumb">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </div>
                      <span className="ad-dashboard-product-row__name">{p.name}</span>
                      <span className="ad-dashboard-product-row__count" title="Favoritos">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        {p.favorites}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="ad-dashboard-combined-section__divider" />
            <div className="ad-dashboard-combined-section__half">
              <h2 className="ad-dashboard-section__title">Productos mejor calificados</h2>
              {topRatedProducts.length === 0 ? (
                <div className="ad-dashboard-empty">Sin productos calificados</div>
              ) : (
                <div className="ad-dashboard-list">
                  {topRatedProducts.map((p) => (
                    <div key={p.id} className="ad-dashboard-product-row">
                      <div className="ad-dashboard-product-row__thumb">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </div>
                      <span className="ad-dashboard-product-row__name">{p.name}</span>
                      <div className="ad-dashboard-product-row__rating">
                        <div className="ad-dashboard-product-row__stars">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <svg
                              key={s}
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill={s < Math.round(p.averageRating) ? "#f59e0b" : "#e0e2e8"}
                              stroke={s < Math.round(p.averageRating) ? "#f59e0b" : "#e0e2e8"}
                              strokeWidth="1"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span className="ad-dashboard-product-row__avg">{p.averageRating}</span>
                        <span className="ad-dashboard-product-row__reviews">({p.reviews} reseñas)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — Latest Orders / Recent Reviews */}
      <div className="ad-dashboard-row">
        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section">
            <h2 className="ad-dashboard-section__title">Últimas órdenes</h2>
            {latestOrders.length === 0 ? (
              <div className="ad-dashboard-empty">Sin órdenes recientes</div>
            ) : (
              <div className="ad-dashboard-table">
                <div className="ad-dashboard-table__header">
                  <span>ID</span>
                  <span>Cliente</span>
                  <span>Total</span>
                  <span>Estado</span>
                  <span>Fecha</span>
                </div>
                {latestOrders.map((o) => (
                  <div key={o.id} className="ad-dashboard-table__row">
                    <span className="ad-orders-cell-id">#{o.id}</span>
                    <span className="ad-orders-cell-client__email">{o.usuario.email}</span>
                    <span className="ad-orders-cell-total">{formatCurrency(o.total)}</span>
                    <OrderStatusBadge status={o.status} />
                    <span className="ad-orders-cell-date">{formatDate(o.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ad-dashboard-col">
          <div className="ad-dashboard-section">
            <h2 className="ad-dashboard-section__title">Últimas reseñas</h2>
            {recentReviews.length === 0 ? (
              <div className="ad-dashboard-empty">Sin reseñas recientes</div>
            ) : (
              <div className="ad-dashboard-list">
                {recentReviews.map((r, i) => (
                  <div key={i} className="ad-dashboard-review-row">
                    <div className="ad-dashboard-review-row__header">
                      <div className="ad-dashboard-review-row__avatar">
                        {r.usuario.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ad-dashboard-review-row__user">
                        <span className="ad-dashboard-review-row__email">{r.usuario.email}</span>
                        <span className="ad-dashboard-review-row__date">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ad-dashboard-review-row__product">{r.producto.name}</div>
                    <div className="ad-dashboard-review-row__rating">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg
                          key={s}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={s < r.rating ? "#f59e0b" : "#e0e2e8"}
                          stroke={s < r.rating ? "#f59e0b" : "#e0e2e8"}
                          strokeWidth="1"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <p className="ad-dashboard-review-row__comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}