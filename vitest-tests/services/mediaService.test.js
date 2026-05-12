import { beforeEach, describe, expect, it, vi } from "vitest";
import mediaService from "../../src/services/mediaService";
import apiClient from "../../src/services/api/client";

vi.mock("../../src/services/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("services/mediaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads media with multipart headers", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 1 } });
    const file = new File(["hello"], "test.txt", { type: "text/plain" });

    await mediaService.upload({
      uploaderId: 12,
      file,
      altText: "cover",
      linkedPostId: 9,
    });

    expect(apiClient.post).toHaveBeenCalled();
    const [url, formData, config] = apiClient.post.mock.calls[0];
    expect(url).toBe("/media/upload");
    expect(formData).toBeInstanceOf(FormData);
    expect(config).toEqual({ headers: { "Content-Type": "multipart/form-data" } });
  });

  it("covers read/update/delete media endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.put.mockResolvedValue({ data: { ok: true } });
    apiClient.delete.mockResolvedValue({});

    await mediaService.getAll();
    await mediaService.getByUploader(4);
    await mediaService.getByPost(10);
    await mediaService.updateAlt(2, "new alt");
    await mediaService.delete(2);

    expect(apiClient.get).toHaveBeenCalledWith("/media");
    expect(apiClient.get).toHaveBeenCalledWith("/media/uploader/4");
    expect(apiClient.get).toHaveBeenCalledWith("/media/post/10");
    expect(apiClient.put).toHaveBeenCalledWith("/media/2/alt", null, { params: { altText: "new alt" } });
    expect(apiClient.delete).toHaveBeenCalledWith("/media/2");
  });
});
