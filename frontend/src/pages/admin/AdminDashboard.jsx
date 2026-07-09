import useAuth from "../../hooks/useAuth";

const stats = [
  {
    label: "Productos",
    value: "128",
    trend: "+12%",
    up: true,
    color: "teal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: "Usuarios",
    value: "1,432",
    trend: "+8%",
    up: true,
    color: "purple",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Órdenes",
    value: "342",
    trend: "+23%",
    up: true,
    color: "blue",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Reseñas",
    value: "87",
    trend: "-2%",
    up: false,
    color: "amber",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: "Favoritos",
    value: "521",
    trend: "+5%",
    up: true,
    color: "pink",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="ad-dashboard">
      <div className="ad-header">
        <div>
          <h1 className="ad-header__title">Dashboard</h1>
          <p className="ad-header__subtitle">
            Bienvenido de nuevo, {user?.name || "Admin"}
          </p>
        </div>
        <div className="ad-header__right">
          <span className="ad-header__badge">ADMIN</span>
        </div>
      </div>

      <div className="ad-stats">
        {stats.map((s) => (
          <div key={s.label} className={`ad-card ad-card--${s.color}`}>
            <div className="ad-card__top">
              <div className="ad-card__icon">
                {s.icon}
              </div>
              <span className={`ad-card__trend${s.up ? "" : " ad-card__trend--down"}`}>
                {s.trend}
              </span>
            </div>
            <div className="ad-card__value">{s.value}</div>
            <div className="ad-card__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
