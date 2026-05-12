import apiClient from './api/client';

const postService = {
  async getPublishedPosts(keyword = '', page = 1, limit = 8) {
    const { data } = await apiClient.get('/posts/published', {
      params: keyword ? { keyword } : {},
    });
    const start = (page - 1) * limit;
    return {
      items: data.slice(start, start + limit),
      hasMore: data.length > start + limit,
      total: data.length,
    };
  },
  async getPostById(postId) {
    const { data } = await apiClient.get(`/posts/${postId}`);
    return data;
  },
  async getPostBySlug(slug) {
    const { data } = await apiClient.get(`/posts/slug/${slug}`);
    return data;
  },
  async getPostsByAuthor(authorId) {
    const { data } = await apiClient.get(`/posts/author/${authorId}`);
    return data;
  },
  async getPostsByCategory(categoryId) {
    const { data } = await apiClient.get(`/posts/category/${categoryId}`);
    return data;
  },
  async getPostsByTag(tagId) {
    const { data } = await apiClient.get(`/posts/tag/${tagId}`);
    return data;
  },
  async createPost(payload) {
    const { data } = await apiClient.post('/posts', payload);
    return data;
  },
  async updatePost(postId, payload) {
    const { data } = await apiClient.put(`/posts/${postId}`, payload);
    return data;
  },
  async updateStatus(postId, status) {
    const { data } = await apiClient.put(`/posts/${postId}/status`, null, {
      params: { status },
    });
    return data;
  },
  async deletePost(postId) {
    await apiClient.delete(`/posts/${postId}`);
  },
  async likePost(postId, like = true) {
    const { data } = await apiClient.post(`/posts/${postId}/like`, null, { params: { like } });
    return data;
  },
  async viewPost(postId, sessionKey) {
    const { data } = await apiClient.post(`/posts/${postId}/view`, null, {
      params: { sessionKey },
    });
    return data;
  },
  async savePost(postId) {
    const { data } = await apiClient.post(`/posts/${postId}/save`);
    return data;
  },
  async unsavePost(postId) {
    const { data } = await apiClient.delete(`/posts/${postId}/save`);
    return data;
  },
  async getSaveStatus(postId) {
    const { data } = await apiClient.get(`/posts/${postId}/save-status`);
    return data;
  },
  async getSavedPosts() {
    const { data } = await apiClient.get('/posts/saved');
    return data;
  },
  async getSummary(postId) {
    const { data } = await apiClient.get(`/posts/${postId}/summary`);
    return data;
  },
  async getCategories() {
    const { data } = await apiClient.get('/categories');
    return data;
  },
  async createCategory(payload) {
    const { data } = await apiClient.post('/categories', payload);
    return data;
  },
  async updateCategory(categoryId, payload) {
    const { data } = await apiClient.put(`/categories/${categoryId}`, payload);
    return data;
  },
  async deleteCategory(categoryId) {
    await apiClient.delete(`/categories/${categoryId}`);
  },
  async getTags() {
    const { data } = await apiClient.get('/tags');
    return data;
  },
  async getTrendingTags() {
    const { data } = await apiClient.get('/tags/trending');
    return data;
  },
  async createTag(payload) {
    const { data } = await apiClient.post('/tags', payload);
    return data;
  },
  async deleteTag(tagId) {
    await apiClient.delete(`/tags/${tagId}`);
  },
  async adminAnalytics() {
    const { data } = await apiClient.get('/admin/analytics');
    return data;
  },
  async getAllPostsForAdmin() {
    const { data } = await apiClient.get('/admin/posts');
    return data;
  },
  async featurePost(postId, featured = true) {
    const { data } = await apiClient.put(`/admin/posts/${postId}/feature`, null, {
      params: { featured },
    });
    return data;
  },
};

export default postService;

