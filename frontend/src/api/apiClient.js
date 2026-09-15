const rawApiUrl = import.meta.env.VITE_API_URL || '';
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API = rawApiUrl
  ? rawApiUrl.replace(/\/$/, '')
  : (isLocal ? 'http://localhost:4000/api' : 'https://vegetables-demo-1.onrender.com/api');



export const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const FALLBACK_VEG_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80';
export const FALLBACK_PKG_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

export function getImageUrl(url, fallback = FALLBACK_VEG_IMG) {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  return url.trim();
}

export async function api(path, opts = {}) {
  const token = localStorage.getItem('token');
  const r = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    }
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || 'Request failed');
  return d;
}
