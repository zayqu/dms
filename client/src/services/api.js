const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
export async function api(path, opts={}) {
  const headers = Object.assign({}, opts.headers || {});
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const txt = await res.text().catch(()=>null);
  let json = null;
  try { json = txt ? JSON.parse(txt) : null; } catch(e) { json = txt; }
  if (!res.ok) throw new Error((json && json.error) || res.statusText || 'API error');
  return json;
}
export default { api };