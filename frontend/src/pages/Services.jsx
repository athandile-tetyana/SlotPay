import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
const empty = { name:'', description:'', price:'', deposit_amount:'', duration_minutes:60, category:'' };
export default function Services() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);
  const load = () => api.get('/services').then(d => Array.isArray(d) && setServices(d));
  useEffect(() => { load(); }, []);
  const save = async () => { await api.post('/services', form); setAdding(false); setForm(empty); load(); };
  const remove = async (id) => { await api.delete(`/services/${id}`); load(); };
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28 }}>Services</h1>
          <button className="btn-green" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : '+ Add Service'}</button>
        </div>
        {adding && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>New Service</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['name','Service name','text'],['category','Category','text'],['price','Full price (R)','number'],['deposit_amount','Deposit (R)','number'],['duration_minutes','Duration (mins)','number']].map(([k,p,t]) => (
                <div key={k}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5 }}>{p}</label>
                <input type={t} placeholder={p} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} /></div>
              ))}
              <div style={{ gridColumn: '1/-1' }}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5 }}>Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
            </div>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={save}>Save Service</button>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
          {services.map(s => (
            <div key={s.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div><div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>{s.category && <span className="badge badge-muted" style={{ marginTop: 4 }}>{s.category}</span>}</div>
                <button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>×</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{s.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>R{s.price}</span>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>R{s.deposit_amount} deposit</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>⏱ {s.duration_minutes} min</div>
            </div>
          ))}
          {services.length===0 && <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', gridColumn: '1/-1' }}>No services yet</div>}
        </div>
      </main>
    </div>
  );
}
