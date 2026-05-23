const BASE = '/api';
const headers = () => ({ 'Content-Type': 'application/json', ...(localStorage.getItem('slotpay_token') ? { Authorization: `Bearer ${localStorage.getItem('slotpay_token')}` } : {}) });
export const api = {
  get: (path) => fetch(`${BASE}${path}`, { headers: headers() }).then(r => r.json()),
  post: (path, body) => fetch(`${BASE}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  patch: (path, body) => fetch(`${BASE}${path}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path) => fetch(`${BASE}${path}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),
};
