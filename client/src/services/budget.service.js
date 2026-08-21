import apiClient from './apiClient.js';

export const budgetService = {
  async overview() {
    const { data } = await apiClient.get('/budgets');
    return data.data;
  },
  async setOverall(amount) {
    const { data } = await apiClient.put('/budgets/overall', { amount });
    return data;
  },
  async upsertCategory(payload) {
    const { data } = await apiClient.post('/budgets', payload);
    return data.data;
  },
  async update(id, amount) {
    const { data } = await apiClient.patch(`/budgets/${id}`, { amount });
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/budgets/${id}`);
    return data;
  },
};
