import { useEffect, useState } from "react";
import { getSystemInfo } from "../../api/admin";
import { useTheme } from "../../context/ThemeContext";

function StatusDot({ ok }) {
  return (
    <span
      className={`ad-settings-status-dot${ok ? " ad-settings-status-dot--ok" : " ad-settings-status-dot--error"}`}
    />
  );
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getSystemInfo();
        if (!cancelled) setInfo(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Error al cargar configuración");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="ad-settings">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Configuración</h1>
            <p className="ad-header__subtitle">Información del sistema</p>
          </div>
        </div>
        <div className="ad-settings-loader">
          <div className="ad-settings-loader__spinner" />
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-settings">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Configuración</h1>
            <p className="ad-header__subtitle">Información del sistema</p>
          </div>
        </div>
        <div className="ad-settings-error">
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

  const env = info?.environment || "development";

  return (
    <div className="ad-settings">
      <div className="ad-settings-header">
        <div className="ad-header">
          <div>
            <h1 className="ad-header__title">Configuración</h1>
            <p className="ad-header__subtitle">Información del sistema</p>
          </div>
        </div>
      </div>

      <div className="ad-settings-grid">
        <div className="ad-settings-card" style={{ animationDelay: "0s" }}>
          <h3 className="ad-settings-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            Apariencia
          </h3>
          <div className="ad-settings-card__body">
            <div className="ad-settings-theme-row">
              <button
                className={`ad-settings-theme-btn${theme === "light" ? " ad-settings-theme-btn--active" : ""}`}
                onClick={() => setTheme("light")}
              >
                ☀️ Claro
              </button>
              <button
                className={`ad-settings-theme-btn${theme === "dark" ? " ad-settings-theme-btn--active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                🌙 Oscuro
              </button>
              <button
                className={`ad-settings-theme-btn${theme === "system" ? " ad-settings-theme-btn--active" : ""}`}
                onClick={() => setTheme("system")}
              >
                💻 Sistema
              </button>
            </div>
          </div>
        </div>

        <div className="ad-settings-card" style={{ animationDelay: "0.05s" }}>
          <h3 className="ad-settings-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Información del proyecto
          </h3>
          <div className="ad-settings-card__body">
            <div className="ad-settings-field">
              <span className="ad-settings-field__label">Proyecto</span>
              <span className="ad-settings-field__value">E-Commerce App</span>
            </div>
            <div className="ad-settings-field">
              <span className="ad-settings-field__label">Versión</span>
              <span className="ad-settings-field__value">{info?.version || "—"}</span>
            </div>
            <div className="ad-settings-field ad-settings-field--stack">
              <span className="ad-settings-field__label">Stack</span>
              <div className="ad-settings-tags">
                <span className="ad-settings-tag">React</span>
                <span className="ad-settings-tag">Express</span>
                <span className="ad-settings-tag">Prisma</span>
                <span className="ad-settings-tag">PostgreSQL</span>
                <span className="ad-settings-tag">Cloudinary</span>
                <span className="ad-settings-tag">JWT</span>
                <span className="ad-settings-tag">Docker</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-settings-card" style={{ animationDelay: "0.1s" }}>
          <h3 className="ad-settings-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Estado del sistema
          </h3>
          <div className="ad-settings-card__body">
            <div className="ad-settings-status-row">
              <StatusDot ok />
              <span>API</span>
            </div>
            <div className="ad-settings-status-row">
              <StatusDot ok />
              <span>Base de datos</span>
            </div>
            <div className="ad-settings-status-row">
              <StatusDot ok={info?.cloudinaryConfigured} />
              <span>Cloudinary</span>
            </div>
            <div className="ad-settings-status-row">
              <StatusDot ok={info?.jwtConfigured} />
              <span>JWT</span>
            </div>
          </div>
        </div>

        <div className="ad-settings-card" style={{ animationDelay: "0.15s" }}>
          <h3 className="ad-settings-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Información técnica
          </h3>
          <div className="ad-settings-card__body">
            <div className="ad-settings-field">
              <span className="ad-settings-field__label">Node.js</span>
              <span className="ad-settings-field__value">{info?.nodeVersion || "—"}</span>
            </div>
            <div className="ad-settings-field">
              <span className="ad-settings-field__label">Entorno</span>
              <span className="ad-settings-field__value ad-settings-field__value--env">{env}</span>
            </div>
            <div className="ad-settings-field">
              <span className="ad-settings-field__label">Base de datos</span>
              <span className="ad-settings-field__value">{info?.database || "—"}</span>
            </div>
            <div className="ad-settings-field">
              <span className="ad-settings-field__label">Tiempo activo</span>
              <span className="ad-settings-field__value">{info?.uptime ? formatUptime(info.uptime) : "—"}</span>
            </div>
          </div>
        </div>

        <div className="ad-settings-card" style={{ animationDelay: "0.2s" }}>
          <h3 className="ad-settings-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Estadísticas generales
          </h3>
          <div className="ad-settings-card__body">
            <div className="ad-settings-stat">
              <span className="ad-settings-stat__value">{info?.stats?.users ?? "—"}</span>
              <span className="ad-settings-stat__label">Usuarios</span>
            </div>
            <div className="ad-settings-stat">
              <span className="ad-settings-stat__value">{info?.stats?.products ?? "—"}</span>
              <span className="ad-settings-stat__label">Productos</span>
            </div>
            <div className="ad-settings-stat">
              <span className="ad-settings-stat__value">{info?.stats?.orders ?? "—"}</span>
              <span className="ad-settings-stat__label">Órdenes</span>
            </div>
            <div className="ad-settings-stat">
              <span className="ad-settings-stat__value">{info?.stats?.reviews ?? "—"}</span>
              <span className="ad-settings-stat__label">Reseñas</span>
            </div>
            <div className="ad-settings-stat">
              <span className="ad-settings-stat__value">{info?.stats?.favorites ?? "—"}</span>
              <span className="ad-settings-stat__label">Favoritos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
