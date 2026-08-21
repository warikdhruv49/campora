import apiClient from './apiClient.js';

export const authService = {
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data;
  },
  async login(payload) {
    const { data } = await apiClient.post('/auth/login', payload);
    return data.data;
  },
  async google(credential) {
    const { data } = await apiClient.post('/auth/google', { credential });
    return data.data;
  },
  async me() {
    const { data } = await apiClient.get('/users/me');
    return data.data.user;
  },
  async updateProfile(payload) {
    const { data } = await apiClient.patch('/users/me', payload);
    return data.data.user;
  },
  async changePassword(payload) {
    const { data } = await apiClient.patch('/users/password', payload);
    return data;
  },
  async forgotPassword(email) {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data.data;
  },
  async resetPassword(payload) {
    const { data } = await apiClient.post('/auth/reset-password', payload);
    return data;
  },
  async verifyEmail(token) {
    const { data } = await apiClient.post('/auth/verify-email', { token });
    return data.data.user;
  },
  async resendVerification() {
    const { data } = await apiClient.post('/auth/resend-verification');
    return data.data;
  },
};
