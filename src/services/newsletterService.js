import apiClient from './api/client';

const newsletterService = {
  async subscribe(payload) {
    const { data } = await apiClient.post('/newsletter/subscribe', payload);
    return data;
  },
  async confirm(token) {
    const { data } = await apiClient.get('/newsletter/confirm', { params: { token } });
    return data;
  },
  async unsubscribe(token) {
    const { data } = await apiClient.get('/newsletter/unsubscribe', { params: { token } });
    return data;
  },
  async listSubscribers() {
    const { data } = await apiClient.get('/newsletter/subscribers');
    return data;
  },
  async getCount() {
    const { data } = await apiClient.get('/newsletter/count');
    return data;
  },
  async sendCampaign(payload) {
    const { data } = await apiClient.post('/newsletter/campaign', payload);
    return data;
  },
  async activateSubscriber(subscriberId, userId) {
    const { data } = await apiClient.put(`/newsletter/subscribers/${subscriberId}/activate`, null, {
      params: userId ? { userId } : undefined,
    });
    return data;
  },
  async deactivateSubscriber(subscriberId) {
    const { data } = await apiClient.put(`/newsletter/subscribers/${subscriberId}/deactivate`);
    return data;
  },
  async deactivateOwnSubscription() {
    const { data } = await apiClient.put('/newsletter/me/deactivate');
    return data;
  },
};

export default newsletterService;

