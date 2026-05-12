import apiClient from './api/client';

const normalizeId = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : value;
};

const commentService = {
  async getByPost(postId) {
    const { data } = await apiClient.get(`/comments/post/${postId}`);
    return data;
  },
  async add(payload) {
    const authorId = normalizeId(payload.userId ?? payload.authorId);
    const body = {
      content: payload.content,
      postId: normalizeId(payload.postId),
      authorId,
      userId: authorId,
    };
    const parentCommentId = normalizeId(payload.parentCommentId);
    if (parentCommentId !== undefined) body.parentCommentId = parentCommentId;

    const requestConfig = {
      params: authorId !== undefined ? { userId: authorId } : {},
    };

    const { data } = await apiClient.post('/comments', body, requestConfig);
    return data;
  },
  async update(commentId, userId, payload) {
    const { data } = await apiClient.put(`/comments/${commentId}`, payload, { params: { userId } });
    return data;
  },
  async remove(commentId, userId) {
    await apiClient.delete(`/comments/${commentId}`, { params: { userId } });
  },
  async approve(commentId) {
    const { data } = await apiClient.put(`/comments/${commentId}/approve`);
    return data;
  },
  async reject(commentId) {
    const { data } = await apiClient.put(`/comments/${commentId}/reject`);
    return data;
  },
  async like(commentId, userId) {
    const { data } = await apiClient.post(`/comments/${commentId}/like`, null, { params: { userId } });
    return data;
  },
  async unlike(commentId, userId) {
    const { data } = await apiClient.post(`/comments/${commentId}/unlike`, null, { params: { userId } });
    return data;
  },
  async count(postId) {
    const { data } = await apiClient.get(`/comments/count/${postId}`);
    return data;
  },
  async countTotal() {
    const { data } = await apiClient.get('/comments/count-total');
    return data;
  },
};

export default commentService;

