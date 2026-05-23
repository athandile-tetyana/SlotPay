import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => { api.get('/auth/me').then(setUser); api.get('/bookings').then(d => Array.isArray(d) && setBookings(d)); }, []);
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'pending_payment').length;
  const noShows = bookings.filter(b => b.status === 'no_show').length;
  const deposits = bookings.filter(b => b.deposit_paid).reduce((s, b) => s + Number(b.deposit_amount), 0);
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28 }}>Dashboard</h1>
          {user && <p style={{ color: 'var(--muted)', marginTop: 4 }}>Welcome back, {user.name} · {user.business_name}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
          {[['Total', bookings.length, 'var(--ink)'], ['Confirmed', confirmed, 'var(--green)'], ['Pending', pending, 'var(--amber)'], ['No-shows', noShows, 'var(--red)']].map(([label, value, color]) => (
            <div key={label} className="card" style={{ borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, background: 'var(--ink)', color: 'white' }}>
          <div style={{ fontSize: 40 }}>💰</div>
          <div>
            <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)' }}>R{deposits.toFixed(2)}</div>
            <div style={{ fontSize: 14, color: '#aaa' }}>Total deposits collected</div>
          </div>
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Recent Bookings</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--paper)', borderBottom: '1.5px solid var(--border)' }}>
              {['Ref','Client','Service','Date','Status','Deposit'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {bookings.slice(0,8).map((b,i) => (
                <tr key={b.id} style={{ borderBottom: i < bookings.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)' }}>{b.booking_ref}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{b.client_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>{b.services?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{b.appointment_date}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${b.status==='confirmed'?'green':b.status==='pending_payment'?'amber':'red'}`}>{b.status.replace('_',' ')}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{b.deposit_paid ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>R{b.deposit_amount} ✓</span> : <span style={{ color: 'var(--amber)' }}>Pending</span>}</td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
