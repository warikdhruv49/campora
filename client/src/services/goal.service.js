import apiClient from './apiClient.js';

export const goalService = {
  async list() {
    const { data } = await apiClient.get('/goals');
    return data.data.goals;
  },
  async create(payload) {
    const { data } = await apiClient.post('/goals', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/goals/${id}`, payload);
    return data.data;
  },
  async contribute(id, amount) {
    const { data } = await apiClient.post(`/goals/${id}/contribute`, { amount });
    return data.data;
  },
  async withdraw(id, amount) {
    const { data } = await apiClient.post(`/goals/${id}/withdraw`, { amount });
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/goals/${id}`);
    return data;
  },
};
