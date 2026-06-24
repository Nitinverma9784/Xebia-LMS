// API service layer — backend integration

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Categories API
export const categoryApi = {
  list: () => apiFetch('/categories'),
  getById: (id) => apiFetch(`/categories/${id}`),
  getCategoryCourses: (categoryId) => apiFetch(`/categories/${categoryId}/courses`),
  create: (data) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};

// Courses API
export const courseApi = {
  list: () => apiFetch('/courses'),
  getById: (id) => apiFetch(`/courses/${id}`),
  create: (data) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),
};

// Modules API
export const moduleApi = {
  list: () => apiFetch('/modules'),
  getById: (id) => apiFetch(`/modules/${id}`),
  create: (data) => apiFetch('/modules', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/modules/${id}`, { method: 'DELETE' }),
};

// Submodules API
export const submoduleApi = {
  list: () => apiFetch('/submodules'),
  getById: (id) => apiFetch(`/submodules/${id}`),
  create: (data) => apiFetch('/submodules', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/submodules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/submodules/${id}`, { method: 'DELETE' }),
};

// Contents API
export const contentApi = {
  list: () => apiFetch('/contents'),
  getById: (id) => apiFetch(`/contents/${id}`),
  create: (data) => apiFetch('/contents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/contents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/contents/${id}`, { method: 'DELETE' }),
};
