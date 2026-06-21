import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Parts ──────────────────────────────────────────────
export const fetchParts = (params = {}) =>
  api.get('/parts', { params }).then(r => r.data.data);

export const fetchCategories = () =>
  api.get('/parts/categories').then(r => r.data.data);

export const createPart = (data) =>
  api.post('/parts', data).then(r => r.data.data);

export const updatePart = (id, data) =>
  api.put(`/parts/${id}`, data).then(r => r.data.data);

export const deletePart = (id) =>
  api.delete(`/parts/${id}`).then(r => r.data);

// ── Configurations ─────────────────────────────────────
export const fetchConfigurations = () =>
  api.get('/configurations').then(r => r.data.data);

export const fetchConfigurationById = (id) =>
  api.get(`/configurations/${id}`).then(r => r.data.data);

export const createConfiguration = (data) =>
  api.post('/configurations', data).then(r => r.data.data);

export const updateConfiguration = (id, data) =>
  api.put(`/configurations/${id}`, data).then(r => r.data.data);

export const deleteConfiguration = (id) =>
  api.delete(`/configurations/${id}`).then(r => r.data);

// ── Pricing ────────────────────────────────────────────
export const fetchPriceBreakdown = (configId) =>
  api.get(`/pricing/configuration/${configId}`).then(r => r.data.data);
