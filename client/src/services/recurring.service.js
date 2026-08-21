import apiClient from './apiClient.js';

export const recurringService = {
  async list() {
    const { data } = await apiClient.get('/recurring');
    return data.data.rules;
  },
  async create(payload) {
    const { data } = await apiClient.post('/recurring', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/recurring/${id}`, payload);
    return data.data;
  },
  async runNow(id) {
    const { data } = await apiClient.post(`/recurring/${id}/run`);
    return data.data;
  },
  async processDue() {
    const { data } = await apiClient.post('/recurring/process-due');
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/recurring/${id}`);
    return data;
  },
};
