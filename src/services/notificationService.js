import apiClient from './api/client';

const notificationService = {
  async getRecipientNotifications(recipientId) {
    const { data } = await apiClient.get(`/notifications/recipient/${recipientId}`);
    return data;
  },
  async getUnreadCount(recipientId) {
    const { data } = await apiClient.get(`/notifications/recipient/${recipientId}/unread-count`);
    return data;
  },
  async markRead(notificationId) {
    const { data } = await apiClient.put(`/notifications/${notificationId}/read`);
    return data;
  },
  async markAllRead(recipientId) {
    const { data } = await apiClient.put(`/notifications/recipient/${recipientId}/read-all`);
    return data;
  },
  async sendRoleBroadcast(payload) {
    const { data } = await apiClient.post('/notifications/broadcast/role', payload);
    return data;
  },
};

export default notificationService;

