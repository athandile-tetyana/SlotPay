import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
const SC = { confirmed: 'green', pending_payment: 'amber', cancelled: 'red', no_show: 'red', completed: 'muted' };
export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const load = () => api.get('/bookings').then(d => Array.isArray(d) && setBookings(d));
  useEffect(() => { load(); }, []);
  const update = async (id, status) => { await api.patch(`/bookings/${id}/status`, { status }); load(); };
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28 }}>Bookings</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all','pending_payment','confirmed','no_show'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={filter===s?'btn-primary':'btn-ghost'} style={{ fontSize: 12, padding: '7px 14px' }}>{s.replace('_',' ')}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(b => (
            <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{b.client_name}</span>
                  <span className={`badge badge-${SC[b.status]||'muted'}`}>{b.status.replace('_',' ')}</span>
                  {b.deposit_paid && <span className="badge badge-green">💰 Paid</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{b.services?.name} · {b.appointment_date} at {b.appointment_time?.slice(0,5)} · {b.client_phone}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontFamily: 'monospace' }}>{b.booking_ref}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {b.status==='pending_payment' && <button className="btn-green" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => update(b.id,'confirmed')}>Confirm</button>}
                {b.status==='confirmed' && <>
                  <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => update(b.id,'completed')}>Done</button>
                  <button style={{ fontSize: 12, padding: '7px 14px', background: 'var(--red)', color: 'white', borderRadius: 8 }} onClick={() => update(b.id,'no_show')}>No-show</button>
                </>}
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>No bookings for this filter</div>}
        </div>
      </main>
    </div>
  );
}
