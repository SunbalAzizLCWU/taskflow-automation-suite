// Thin API client. Reads the JWT from localStorage and attaches it.
// Base URL comes from VITE_API_URL (production) or is empty (dev, proxied).

const BASE = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem('taskflow_token');
}
export function setToken(token) {
  if (token) localStorage.setItem('taskflow_token', token);
  else localStorage.removeItem('taskflow_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  me: () => request('/auth/me'),
  // tasks
  listTasks: () => request('/tasks'),
  createTask: (body) => request('/tasks', { method: 'POST', body }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PATCH', body }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  // rules
  listRules: () => request('/rules'),
  createRule: (body) => request('/rules', { method: 'POST', body }),
  deleteRule: (id) => request(`/rules/${id}`, { method: 'DELETE' }),
  // logs
  listLogs: () => request('/logs'),
  // ai
  aiRule: (description) => request('/ai/rule', { method: 'POST', body: { description } }),
  aiSuggest: () => request('/ai/suggest-tasks'),
  aiSummarize: () => request('/ai/summarize-logs', { method: 'POST', body: {} }),
};
