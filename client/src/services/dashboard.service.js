import apiClient from './apiClient.js';

export const dashboardService = {
  async get(range = '1M') {
    const { data } = await apiClient.get('/dashboard', { params: { range } });
    return data.data;
  },
  async timeline(range = '1M') {
    const { data } = await apiClient.get('/dashboard/timeline', { params: { range } });
    return data.data;
  },
  async health() {
    const { data } = await apiClient.get('/dashboard/health');
    return data.data;
  },
};

export const searchService = {
  async search(q) {
    const { data } = await apiClient.get('/analytics/search', { params: { q } });
    return data.data;
  },
};
