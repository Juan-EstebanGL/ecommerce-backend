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
  pending:    { label: "Pendientes",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  paid:       { label: "Pagadas",    color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  processing: { label: "Procesando", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  shipped:    { label: "Enviadas",   color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  delivered:  { label: "Entregadas", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  cancelled:  { label: "Canceladas", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

function formatCurrency(value) {
  return "$" + Number(value).toLocaleString("es-CL");
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Skel({ w, h, r, style }) {
  return (
    <div
      className="ad-dashboard-skeleton"
      style={{ width: w || "100%", height: h || "20px", borderRadius: r || "8px", ...style }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="ad-dash">
      <div className="ad-dash-hero">
        <div className="ad-dash-hero__content">
          <Skel w="200px" h="32px" r="10px" />
          <Skel w="280px" h="16px" r="8px" style={{ marginTop: 12 }} />
        </div>
        <div className="ad-dash-hero__metrics">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ad-dash-metric">
              <Skel w="36px" h="36px" r="10px" />
              <div>
                <Skel w="60px" h="24px" r="6px" />
                <Skel w="80px" h="12px" r="4px" style={{ marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ad-dash-charts">
        <div className="ad-glass ad-dash-charts__main">
          <Skel w="140px" h="20px" />
          <Skel r="50%" w="220px" h="220px" style={{ margin: "24px auto 0" }} />
        </div>
        <div className="ad-dash-charts__side">
          <div className="ad-glass" style={{ padding: 20 }}>
            <Skel w="120px" h="18px" />
            <Skel w="100%" h="160px" r="10px" style={{ marginTop: 16 }} />
          </div>
          <div className="ad-glass" style={{ padding: 20 }}>
            <Skel w="140px" h="18px" />
            <Skel w="100%" h="120px" r="10px" style={{ marginTop: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(15, 23, 42, 0.92)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  fontSize: "0.82rem",
  color: "#f1f5f9",
  padding: "10px 14px",
};

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
      <div className="ad-dash">
        <div className="ad-dash-hero">
          <div className="ad-dash-hero__content">
            <h1 className="ad-dash-hero__title">Dashboard</h1>
            <p className="ad-dash-hero__subtitle">Panel de administración</p>
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

  const totalOrders = Object.values(orders).reduce((a, b) => a + b, 0);

  const statusEntries = [
    { key: "pending", value: orders.pending },
    { key: "paid", value: orders.paid },
    { key: "processing", value: orders.processing },
    { key: "shipped", value: orders.shipped },
    { key: "delivered", value: orders.delivered },
    { key: "cancelled", value: orders.cancelled },
  ];

  return (
    <div className="ad-dash">
      {/* ── HERO — Full-width command center ── */}
      <div className="ad-dash-hero">
        <div className="ad-dash-hero__bg" aria-hidden="true">
          <div className="ad-dash-hero__orb ad-dash-hero__orb--1" />
          <div className="ad-dash-hero__orb ad-dash-hero__orb--2" />
          <div className="ad-dash-hero__orb ad-dash-hero__orb--3" />
        </div>
        <div className="ad-dash-hero__content">
          <span className="ad-dash-hero__eyebrow">Panel de control</span>
          <h1 className="ad-dash-hero__title">Dashboard</h1>
          <p className="ad-dash-hero__subtitle">Resumen general del panel de administración</p>
        </div>
        <div className="ad-dash-hero__metrics">
          <div className="ad-dash-metric">
            <div className="ad-dash-metric__icon ad-dash-metric__icon--brand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <div className="ad-dash-metric__data">
              <span className="ad-dash-metric__value"><CountUp end={stats.totalProducts} duration={1.2} /></span>
              <span className="ad-dash-metric__label">Productos</span>
            </div>
          </div>
          <div className="ad-dash-metric">
            <div className="ad-dash-metric__icon ad-dash-metric__icon--accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div className="ad-dash-metric__data">
              <span className="ad-dash-metric__value"><CountUp end={stats.totalUsers} duration={1.2} /></span>
              <span className="ad-dash-metric__label">Usuarios</span>
            </div>
          </div>
          <div className="ad-dash-metric">
            <div className="ad-dash-metric__icon ad-dash-metric__icon--success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="ad-dash-metric__data">
              <span className="ad-dash-metric__value"><CountUp end={totalOrders} duration={1.2} /></span>
              <span className="ad-dash-metric__label">Órdenes</span>
            </div>
          </div>
          <div className="ad-dash-metric">
            <div className="ad-dash-metric__icon ad-dash-metric__icon--warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <div className="ad-dash-metric__data">
              <span className="ad-dash-metric__value">$<CountUp end={stats.revenue} duration={1.4} separator="." decimals={0} /></span>
              <span className="ad-dash-metric__label">Ingresos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHARTS — Asymmetric composition ── */}
      <div className="ad-dash-charts">
        <div className="ad-glass ad-dash-charts__main">
          <div className="ad-dash-section__header">
            <h2 className="ad-dash-section__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/></svg>
              Órdenes por estado
            </h2>
            <span className="ad-dash-section__count">{totalOrders} total</span>
          </div>
          <div className="ad-dash-pie-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusEntries.map((e) => ({
                    name: STATUS_META[e.key].label,
                    value: e.value,
                    color: STATUS_META[e.key].color,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusEntries.map((e) => (
                    <Cell key={e.key} fill={STATUS_META[e.key].color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Órdenes"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ad-dash-chart-legend">
            {statusEntries.map((e) => {
              const meta = STATUS_META[e.key];
              return (
                <div key={e.key} className="ad-dash-legend__item">
                  <span className="ad-dash-legend__dot" style={{ background: meta.color }} />
                  <span className="ad-dash-legend__label">{meta.label}</span>
                  <span className="ad-dash-legend__value">{e.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ad-dash-charts__side">
          <div className="ad-glass ad-dash-revenue-panel">
            <div className="ad-dash-section__header">
              <h2 className="ad-dash-section__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                Ingresos
              </h2>
            </div>
            <div className="ad-dash-revenue">
              <div className="ad-dash-revenue__amount">
                <span className="ad-dash-revenue__currency">$</span>
                <CountUp end={stats.revenue} duration={1.6} separator="." decimals={0} />
              </div>
              <div className="ad-dash-revenue__label">Órdenes entregadas</div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={[{ name: "Ingresos", value: stats.revenue }]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(v), "Ingresos"]} />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={44} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="ad-glass ad-dash-line-panel">
            <div className="ad-dash-section__header">
              <h2 className="ad-dash-section__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Evolución de ventas
              </h2>
              <span className="ad-dash-section__count">12 meses</span>
            </div>
            {monthlyRevenue && monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} tickLine={false} axisLine={false} width={45} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(v), "Ingresos"]} labelStyle={{ fontWeight: 600, color: "#f1f5f9" }} />
                  <Line type="monotone" dataKey="revenue" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ r: 3, fill: "#4ade80", stroke: "rgba(15,23,42,0.8)", strokeWidth: 2 }} activeDot={{ r: 5, fill: "#4ade80", stroke: "#fff", strokeWidth: 2 }} />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="ad-dash-empty">Sin datos de ventas mensuales</div>
            )}
          </div>
        </div>
      </div>

      {/* ── PRODUCT INSIGHTS — Three columns ── */}
      <div className="ad-dash-insights">
        <div className="ad-glass ad-dash-insights__stock">
          <div className="ad-dash-section__header">
            <h2 className="ad-dash-section__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Poco stock
            </h2>
            <span className="ad-dash-section__count">{lowStockProducts.length}</span>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="ad-dash-empty">Sin productos con bajo stock</div>
          ) : (
            <div className="ad-dash-stock-list">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="ad-dash-stock-row">
                  <div className="ad-dash-stock-row__thumb">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <span className="ad-dash-stock-row__placeholder" style={{ display: p.imageUrl ? "none" : "flex" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </span>
                  </div>
                  <span className="ad-dash-stock-row__name">{p.name}</span>
                  <span className={`ad-dash-stock-row__badge ad-dash-stock-row__badge--${p.stock <= 5 ? "danger" : "warning"}`}>
                    {p.stock} uds
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ad-glass ad-dash-insights__fav">
          <div className="ad-dash-section__header">
            <h2 className="ad-dash-section__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              Más guardados
            </h2>
            <span className="ad-dash-section__count">{mostFavoritedProducts.length}</span>
          </div>
          {mostFavoritedProducts.length === 0 ? (
            <div className="ad-dash-empty">Sin productos favoritos</div>
          ) : (
            <div className="ad-dash-stock-list">
              {mostFavoritedProducts.map((p) => (
                <div key={p.id} className="ad-dash-stock-row">
                  <div className="ad-dash-stock-row__thumb">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <span className="ad-dash-stock-row__placeholder" style={{ display: p.imageUrl ? "none" : "flex" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </span>
                  </div>
                  <span className="ad-dash-stock-row__name">{p.name}</span>
                  <span className="ad-dash-stock-row__fav">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f472b6" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    {p.favorites}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ad-glass ad-dash-insights__rated">
          <div className="ad-dash-section__header">
            <h2 className="ad-dash-section__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Mejor calificados
            </h2>
            <span className="ad-dash-section__count">{topRatedProducts.length}</span>
          </div>
          {topRatedProducts.length === 0 ? (
            <div className="ad-dash-empty">Sin productos calificados</div>
          ) : (
            <div className="ad-dash-stock-list">
              {topRatedProducts.map((p) => (
                <div key={p.id} className="ad-dash-stock-row">
                  <div className="ad-dash-stock-row__thumb">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <span className="ad-dash-stock-row__placeholder" style={{ display: p.imageUrl ? "none" : "flex" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </span>
                  </div>
                  <span className="ad-dash-stock-row__name">{p.name}</span>
                  <div className="ad-dash-stock-row__rating">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s < Math.round(p.averageRating) ? "#fbbf24" : "rgba(255,255,255,0.1)"} stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                    <span className="ad-dash-stock-row__avg">{p.averageRating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ACTIVITY — Orders + Reviews ── */}
      <div className="ad-dash-activity">
        <div className="ad-glass ad-dash-activity__orders">
          <div className="ad-dash-section__header">
            <h2 className="ad-dash-section__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Últimas órdenes
            </h2>
            <span className="ad-dash-section__count">{latestOrders.length}</span>
          </div>
          {latestOrders.length === 0 ? (
            <div className="ad-dash-empty">Sin órdenes recientes</div>
          ) : (
            <div className="ad-dash-orders-table">
              <div className="ad-dash-orders-table__header">
                <span>ID</span>
                <span>Cliente</span>
                <span>Total</span>
                <span>Estado</span>
                <span>Fecha</span>
              </div>
              {latestOrders.map((o) => (
                <div key={o.id} className="ad-dash-orders-table__row">
                  <span className="ad-orders-cell-id">#{o.id}</span>
                  <span className="ad-orders-cell-client__email">{(o.usuario.firstName || o.usuario.lastName) ? `${o.usuario.firstName || ""} ${o.usuario.lastName || ""}`.trim() : o.usuario.email}</span>
                  <span className="ad-orders-cell-total">{formatCurrency(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                  <span className="ad-orders-cell-date">{formatDate(o.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ad-glass ad-dash-activity__reviews">
          <div className="ad-dash-section__header">
            <h2 className="ad-dash-section__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Últimas reseñas
            </h2>
            <span className="ad-dash-section__count">{recentReviews.length}</span>
          </div>
          {recentReviews.length === 0 ? (
            <div className="ad-dash-empty">Sin reseñas recientes</div>
          ) : (
            <div className="ad-dash-reviews-list">
              {recentReviews.map((r, i) => (
                <div key={i} className="ad-dash-review">
                  <div className="ad-dash-review__header">
                    <div className="ad-dash-review__avatar">
                      {r.usuario.avatarUrl ? (
                        <>
                          <img
                            src={r.usuario.avatarUrl}
                            alt=""
                            loading="lazy"
                            className="ad-dash-review__avatar-img"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextSibling.style.display = "flex";
                            }}
                          />
                          <span className="ad-dash-review__avatar-initial" style={{ display: "none" }}>
                            {((r.usuario.firstName?.charAt(0) || r.usuario.email?.charAt(0)) || "?").toUpperCase()}
                          </span>
                        </>
                      ) : (
                        <span className="ad-dash-review__avatar-initial">
                          {((r.usuario.firstName?.charAt(0) || r.usuario.email?.charAt(0)) || "?").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ad-dash-review__meta">
                      <span className="ad-dash-review__email">{(r.usuario.firstName || r.usuario.lastName) ? `${r.usuario.firstName || ""} ${r.usuario.lastName || ""}`.trim() : r.usuario.email}</span>
                      <span className="ad-dash-review__date">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <div className="ad-dash-review__product">{r.producto.name}</div>
                  <div className="ad-dash-review__stars">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s < r.rating ? "#fbbf24" : "rgba(255,255,255,0.1)"} stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="ad-dash-review__comment">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
