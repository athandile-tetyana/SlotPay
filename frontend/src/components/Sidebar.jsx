import { Link, useLocation, useNavigate } from 'react-router-dom';
const navItems = [{ path: '/', label: 'Dashboard', icon: '◈' }, { path: '/bookings', label: 'Bookings', icon: '📅' }, { path: '/services', label: 'Services', icon: '✂️' }];
export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('slotpay_token'); navigate('/login'); };
  return (
    <aside style={{ width: 220, minHeight: '100vh', background: 'var(--ink)', color: 'white', display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'fixed' }}>
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>SlotPay</div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>No-show prevention</div>
      </div>
      <nav style={{ flex: 1 }}>
        {navItems.map(({ path, label, icon }) => (
          <Link key={path} to={path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 24px', textDecoration: 'none', color: pathname === path ? 'var(--green)' : '#aaa', background: pathname === path ? 'rgba(0,200,150,0.08)' : 'transparent', borderLeft: pathname === path ? '3px solid var(--green)' : '3px solid transparent', fontSize: 14, fontWeight: pathname === path ? 600 : 400, transition: 'all 0.15s' }}>
            <span>{icon}</span> {label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} style={{ margin: '0 16px', background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13, cursor: 'pointer' }}>Sign out</button>
    </aside>
  );
}
