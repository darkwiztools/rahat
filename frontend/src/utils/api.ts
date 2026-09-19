import axios from 'axios';
const api = axios.create({ baseURL: '/api/v1', timeout: 10000 });
export async function healthCheck(): Promise<boolean> {
  try { const r = await api.get('/health'); return r.status === 200; } catch { return false; }
}
export { api };
