import apiClient from './apiClient.js';

export const accountService = {
  async list() {
    const { data } = await apiClient.get('/accounts');
    return data.data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/accounts', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/accounts/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await apiClient.delete(`/accounts/${id}`);
  },
  async stats(id) {
    const { data } = await apiClient.get(`/accounts/${id}/stats`);
    return data.data;
  },
};
