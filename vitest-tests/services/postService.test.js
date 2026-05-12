import { beforeEach, describe, expect, it, vi } from "vitest";
import postService from "../../src/services/postService";
import apiClient from "../../src/services/api/client";

vi.mock("../../src/services/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("services/postService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("paginates published posts client side", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    });
    const result = await postService.getPublishedPosts("", 2, 2);
    expect(result.items).toEqual([{ id: 3 }, { id: 4 }]);
    expect(result.hasMore).toBe(true);
    expect(result.total).toBe(5);
  });

  it("calls status update endpoint with query params", async () => {
    apiClient.put.mockResolvedValueOnce({ data: { id: 12, status: "PUBLISHED" } });
    const res = await postService.updateStatus(12, "PUBLISHED");
    expect(apiClient.put).toHaveBeenCalledWith("/posts/12/status", null, {
      params: { status: "PUBLISHED" },
    });
    expect(res.status).toBe("PUBLISHED");
  });

  it("returns undefined for deletePost response", async () => {
    apiClient.delete.mockResolvedValueOnce({});
    const out = await postService.deletePost(99);
    expect(apiClient.delete).toHaveBeenCalledWith("/posts/99");
    expect(out).toBeUndefined();
  });

  it("calls basic read endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: { id: 1 } });
    await postService.getPostById(1);
    await postService.getPostBySlug("hello");
    await postService.getPostsByAuthor(2);
    await postService.getPostsByCategory(3);
    await postService.getPostsByTag(4);
    expect(apiClient.get).toHaveBeenCalledWith("/posts/1");
    expect(apiClient.get).toHaveBeenCalledWith("/posts/slug/hello");
    expect(apiClient.get).toHaveBeenCalledWith("/posts/author/2");
    expect(apiClient.get).toHaveBeenCalledWith("/posts/category/3");
    expect(apiClient.get).toHaveBeenCalledWith("/posts/tag/4");
  });

  it("calls create and update endpoints", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 10 } });
    apiClient.put.mockResolvedValueOnce({ data: { id: 10, title: "u" } });
    await postService.createPost({ title: "x" });
    await postService.updatePost(10, { title: "u" });
    expect(apiClient.post).toHaveBeenCalledWith("/posts", { title: "x" });
    expect(apiClient.put).toHaveBeenCalledWith("/posts/10", { title: "u" });
  });

  it("calls interaction endpoints", async () => {
    apiClient.post.mockResolvedValue({ data: { ok: true } });
    apiClient.get.mockResolvedValue({ data: { saved: true } });
    apiClient.delete.mockResolvedValue({ data: { saved: false } });
    await postService.likePost(9, false);
    await postService.viewPost(9, "sess");
    await postService.savePost(9);
    await postService.unsavePost(9);
    await postService.getSaveStatus(9);
    await postService.getSavedPosts();
    expect(apiClient.post).toHaveBeenCalledWith("/posts/9/like", null, { params: { like: false } });
    expect(apiClient.post).toHaveBeenCalledWith("/posts/9/view", null, { params: { sessionKey: "sess" } });
    expect(apiClient.post).toHaveBeenCalledWith("/posts/9/save");
    expect(apiClient.delete).toHaveBeenCalledWith("/posts/9/save");
    expect(apiClient.get).toHaveBeenCalledWith("/posts/9/save-status");
    expect(apiClient.get).toHaveBeenCalledWith("/posts/saved");
  });

  it("calls category and tag endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.post.mockResolvedValue({ data: { id: 1 } });
    apiClient.put.mockResolvedValue({ data: { id: 1 } });
    apiClient.delete.mockResolvedValue({});
    await postService.getCategories();
    await postService.createCategory({ name: "Tech" });
    await postService.updateCategory(5, { name: "AI" });
    await postService.deleteCategory(5);
    await postService.getTags();
    await postService.getTrendingTags();
    await postService.createTag({ name: "Tag" });
    await postService.deleteTag(8);
    expect(apiClient.get).toHaveBeenCalledWith("/categories");
    expect(apiClient.post).toHaveBeenCalledWith("/categories", { name: "Tech" });
    expect(apiClient.put).toHaveBeenCalledWith("/categories/5", { name: "AI" });
    expect(apiClient.delete).toHaveBeenCalledWith("/categories/5");
    expect(apiClient.get).toHaveBeenCalledWith("/tags");
    expect(apiClient.get).toHaveBeenCalledWith("/tags/trending");
    expect(apiClient.post).toHaveBeenCalledWith("/tags", { name: "Tag" });
    expect(apiClient.delete).toHaveBeenCalledWith("/tags/8");
  });

  it("calls admin endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: {} });
    apiClient.put.mockResolvedValue({ data: { featured: true } });
    await postService.adminAnalytics();
    await postService.getAllPostsForAdmin();
    await postService.featurePost(11, true);
    expect(apiClient.get).toHaveBeenCalledWith("/admin/analytics");
    expect(apiClient.get).toHaveBeenCalledWith("/admin/posts");
    expect(apiClient.put).toHaveBeenCalledWith("/admin/posts/11/feature", null, {
      params: { featured: true },
    });
  });
});
