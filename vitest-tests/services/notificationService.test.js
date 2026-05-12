import { beforeEach, describe, expect, it, vi } from "vitest";
import notificationService from "../../src/services/notificationService";
import apiClient from "../../src/services/api/client";

vi.mock("../../src/services/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("services/notificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches unread count", async () => {
    apiClient.get.mockResolvedValueOnce({ data: { count: 3 } });
    const res = await notificationService.getUnreadCount(22);
    expect(apiClient.get).toHaveBeenCalledWith("/notifications/recipient/22/unread-count");
    expect(res).toEqual({ count: 3 });
  });

  it("sends role broadcast", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { sent: 5 } });
    const payload = { role: "AUTHOR", title: "Notice" };
    const res = await notificationService.sendRoleBroadcast(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/notifications/broadcast/role", payload);
    expect(res).toEqual({ sent: 5 });
  });

  it("covers remaining notification endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.put.mockResolvedValue({ data: { ok: true } });

    await notificationService.getRecipientNotifications(2);
    await notificationService.markRead(99);
    await notificationService.markAllRead(2);

    expect(apiClient.get).toHaveBeenCalledWith("/notifications/recipient/2");
    expect(apiClient.put).toHaveBeenCalledWith("/notifications/99/read");
    expect(apiClient.put).toHaveBeenCalledWith("/notifications/recipient/2/read-all");
  });
});
