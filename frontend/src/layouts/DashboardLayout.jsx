import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, tabs, activeTab, onTabChange, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';
  const hasMobileMenu = isAdmin || isDriver;
  const tabsId = isAdmin ? 'admin-dashboard-tabs' : 'driver-dashboard-tabs';
  return (
    <div className="dash-shell">
      <aside className={`dash-sidebar${isAdmin ? ' dash-sidebar-admin' : ''}${isDriver ? ' dash-sidebar-driver' : ''}${mobileMenuOpen ? ' mobile-menu-open' : ''}`}>
        {isDriver ? <span className="logo" style={{ marginBottom: 30 }}><span className="logo-mark" />MoveEase</span> : <Link to={isAdmin ? '/admin' : '/'} className="logo" style={{ marginBottom: 30 }}><span className="logo-mark" />MoveEase</Link>}
        {hasMobileMenu && <button className="dash-mobile-menu" aria-expanded={mobileMenuOpen} aria-controls={tabsId} onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? '× Close' : '☰ Menu'}</button>}
        <div className="dash-role">{user?.role?.toUpperCase()}</div>
        <nav id={hasMobileMenu ? tabsId : undefined} className="dash-tabs">
          {tabs.map((t) => (
            <button key={t.key} className={`dash-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => { onTabChange(t.key); setMobileMenuOpen(false); }}>
              {t.label}
            </button>
          ))}
        </nav>
        {user?.role !== 'customer' && <button className="btn btn-logout btn-sm dash-logout" style={{ marginTop: 'auto' }} onClick={() => { logout(); navigate(isAdmin ? '/login' : '/'); }}>Logout</button>}
      </aside>
      <section className="dash-content">
        <div className="dash-heading">
          <h2>{title}</h2>
          {user?.role === 'customer' && <Link to="/" className="btn btn-ghost-dark btn-sm">← Back to Home</Link>}
        </div>
        {children}
      </section>
    </div>
  );
}
