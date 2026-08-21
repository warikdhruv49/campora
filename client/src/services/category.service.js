import apiClient from './apiClient.js';

export const categoryService = {
  async list() {
    const { data } = await apiClient.get('/categories');
    return data.data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/categories', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/categories/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await apiClient.delete(`/categories/${id}`);
  },
};
