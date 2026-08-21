import apiClient from './apiClient.js';

export const transactionService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/transactions', { params });
    return { items: data.data, meta: data.meta };
  },
  async create(payload) {
    const { data } = await apiClient.post('/transactions', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/transactions/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await apiClient.delete(`/transactions/${id}`);
  },
};
