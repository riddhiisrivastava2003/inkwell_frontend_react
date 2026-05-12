import { beforeEach, describe, expect, it, vi } from "vitest";
import commentService from "../../src/services/commentService";
import apiClient from "../../src/services/api/client";

vi.mock("../../src/services/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("services/commentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes add payload and sends user param", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 1 } });
    await commentService.add({
      postId: "44",
      userId: "7",
      content: "Hi",
      parentCommentId: "2",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/comments",
      { content: "Hi", postId: 44, authorId: 7, userId: 7, parentCommentId: 2 },
      { params: { userId: 7 } }
    );
  });

  it("calls unlike endpoint", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { likesCount: 0 } });
    const data = await commentService.unlike(8, 11);
    expect(apiClient.post).toHaveBeenCalledWith("/comments/8/unlike", null, {
      params: { userId: 11 },
    });
    expect(data).toEqual({ likesCount: 0 });
  });

  it("covers remaining comment endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.put.mockResolvedValue({ data: { ok: true } });
    apiClient.delete.mockResolvedValue({});
    apiClient.post.mockResolvedValue({ data: { ok: true } });

    await commentService.getByPost(1);
    await commentService.update(4, 10, { content: "u" });
    await commentService.remove(4, 10);
    await commentService.approve(4);
    await commentService.reject(4);
    await commentService.like(4, 10);
    await commentService.count(1);
    await commentService.countTotal();

    expect(apiClient.get).toHaveBeenCalledWith("/comments/post/1");
    expect(apiClient.put).toHaveBeenCalledWith("/comments/4", { content: "u" }, { params: { userId: 10 } });
    expect(apiClient.delete).toHaveBeenCalledWith("/comments/4", { params: { userId: 10 } });
    expect(apiClient.put).toHaveBeenCalledWith("/comments/4/approve");
    expect(apiClient.put).toHaveBeenCalledWith("/comments/4/reject");
    expect(apiClient.post).toHaveBeenCalledWith("/comments/4/like", null, { params: { userId: 10 } });
    expect(apiClient.get).toHaveBeenCalledWith("/comments/count/1");
    expect(apiClient.get).toHaveBeenCalledWith("/comments/count-total");
  });
});
