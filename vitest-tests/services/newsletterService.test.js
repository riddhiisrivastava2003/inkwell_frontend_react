import { beforeEach, describe, expect, it, vi } from "vitest";
import newsletterService from "../../src/services/newsletterService";
import apiClient from "../../src/services/api/client";

vi.mock("../../src/services/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("services/newsletterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls subscribe endpoint", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { ok: true } });
    const res = await newsletterService.subscribe({ email: "user@test.com" });
    expect(apiClient.post).toHaveBeenCalledWith("/newsletter/subscribe", { email: "user@test.com" });
    expect(res).toEqual({ ok: true });
  });

  it("passes optional userId in activateSubscriber", async () => {
    apiClient.put.mockResolvedValueOnce({ data: { id: 7, status: "ACTIVE" } });
    const res = await newsletterService.activateSubscriber(7, 99);
    expect(apiClient.put).toHaveBeenCalledWith("/newsletter/subscribers/7/activate", null, {
      params: { userId: 99 },
    });
    expect(res.status).toBe("ACTIVE");
  });

  it("covers remaining newsletter endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: {} });
    apiClient.post.mockResolvedValue({ data: { sent: 1 } });
    apiClient.put.mockResolvedValue({ data: { ok: true } });

    await newsletterService.confirm("abc");
    await newsletterService.unsubscribe("abc");
    await newsletterService.listSubscribers();
    await newsletterService.getCount();
    await newsletterService.sendCampaign({ subject: "S" });
    await newsletterService.deactivateSubscriber(77);
    await newsletterService.deactivateOwnSubscription();

    expect(apiClient.get).toHaveBeenCalledWith("/newsletter/confirm", { params: { token: "abc" } });
    expect(apiClient.get).toHaveBeenCalledWith("/newsletter/unsubscribe", { params: { token: "abc" } });
    expect(apiClient.get).toHaveBeenCalledWith("/newsletter/subscribers");
    expect(apiClient.get).toHaveBeenCalledWith("/newsletter/count");
    expect(apiClient.post).toHaveBeenCalledWith("/newsletter/campaign", { subject: "S" });
    expect(apiClient.put).toHaveBeenCalledWith("/newsletter/subscribers/77/deactivate");
    expect(apiClient.put).toHaveBeenCalledWith("/newsletter/me/deactivate");
  });
});
