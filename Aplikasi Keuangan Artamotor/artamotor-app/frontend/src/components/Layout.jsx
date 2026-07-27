import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/motors', label: 'Inventaris Motor' },
  { to: '/penjualan', label: 'Penjualan' },
  { to: '/pengeluaran', label: 'Pengeluaran' },
  { to: '/laporan', label: 'Laporan' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">ArtaMotor</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <strong>{user?.nama}</strong>
            <span className="role-badge">{user?.role}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Keluar
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
