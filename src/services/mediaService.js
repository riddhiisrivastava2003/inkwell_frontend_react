import apiClient from './api/client';

const mediaService = {
  async upload({ uploaderId, file, altText, linkedPostId }) {
    const formData = new FormData();
    if (uploaderId !== undefined && uploaderId !== null) formData.append('uploaderId', uploaderId);
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (linkedPostId) formData.append('linkedPostId', linkedPostId);

    const { data } = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async getAll() {
    const { data } = await apiClient.get('/media');
    return data;
  },
  async getByUploader(uploaderId) {
    const { data } = await apiClient.get(`/media/uploader/${uploaderId}`);
    return data;
  },
  async getByPost(postId) {
    const { data } = await apiClient.get(`/media/post/${postId}`);
    return data;
  },
  async updateAlt(mediaId, altText) {
    const { data } = await apiClient.put(`/media/${mediaId}/alt`, null, { params: { altText } });
    return data;
  },
  async delete(mediaId) {
    await apiClient.delete(`/media/${mediaId}`);
  },
};

export default mediaService;

