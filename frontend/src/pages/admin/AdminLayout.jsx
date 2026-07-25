import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="ad-page">
      {/* Ambient background — floating orbs of light */}
      <div className="ad-ambient" aria-hidden="true">
        <div className="ad-ambient__orb ad-ambient__orb--brand" />
        <div className="ad-ambient__orb ad-ambient__orb--accent" />
        <div className="ad-ambient__orb ad-ambient__orb--blue" />
        <div className="ad-ambient__noise" />
      </div>

      <AdminSidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <main className="ad-main">
        <button
          className="ad-mobile-toggle"
          onClick={() => setDrawerOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Outlet />
      </main>
    </div>
  );
}
