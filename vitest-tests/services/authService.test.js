import { beforeEach, describe, expect, it, vi } from "vitest";
import authService from "../../src/services/authService";
import apiClient from "../../src/services/api/client";

vi.mock("../../src/services/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("services/authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls login endpoint", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { token: "t" } });
    const response = await authService.login({ email: "a@b.com", password: "123" });
    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.com",
      password: "123",
    });
    expect(response).toEqual({ token: "t" });
  });

  it("validates token with query params", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { userId: 1 } });
    const response = await authService.validate("jwt-token");
    expect(apiClient.post).toHaveBeenCalledWith("/auth/validate", null, {
      params: { token: "jwt-token" },
    });
    expect(response).toEqual({ userId: 1 });
  });

  it("returns following ids fallback to empty array", async () => {
    apiClient.get.mockResolvedValueOnce({ data: {} });
    const response = await authService.getFollowingIds(10);
    expect(apiClient.get).toHaveBeenCalledWith("/auth/users/10/following");
    expect(response).toEqual([]);
  });

  it("calls register and registerAdmin endpoints", async () => {
    apiClient.post.mockResolvedValue({ data: { ok: true } });
    await authService.register({ username: "u" });
    await authService.registerAdmin({ username: "a" });
    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", { username: "u" });
    expect(apiClient.post).toHaveBeenCalledWith("/auth/register-admin", { username: "a" });
  });

  it("calls forgot/reset password endpoints", async () => {
    apiClient.post.mockResolvedValue({ data: { message: "ok" } });
    await authService.forgotPassword("x@y.com");
    await authService.resetPassword("tok", "newpass");
    expect(apiClient.post).toHaveBeenCalledWith("/auth/forgot-password", { email: "x@y.com" });
    expect(apiClient.post).toHaveBeenCalledWith("/auth/reset-password", { token: "tok", newPassword: "newpass" });
  });

  it("calls user listing and search endpoints", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await authService.getUsers();
    await authService.searchUsers("ink");
    await authService.getUserById(5);
    expect(apiClient.get).toHaveBeenCalledWith("/auth/users");
    expect(apiClient.get).toHaveBeenCalledWith("/auth/search", { params: { username: "ink" } });
    expect(apiClient.get).toHaveBeenCalledWith("/auth/users/5");
  });

  it("calls follow and unfollow endpoints", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { following: true } });
    apiClient.delete.mockResolvedValueOnce({ data: { following: false } });
    await authService.followAuthor(22);
    await authService.unfollowAuthor(22);
    expect(apiClient.post).toHaveBeenCalledWith("/auth/users/22/follow");
    expect(apiClient.delete).toHaveBeenCalledWith("/auth/users/22/follow");
  });

  it("calls profile and password update endpoints", async () => {
    apiClient.put.mockResolvedValue({ data: { ok: true } });
    await authService.updateUserProfile(1, { username: "new" });
    await authService.changePassword(1, { currentPassword: "a", newPassword: "b" });
    expect(apiClient.put).toHaveBeenCalledWith("/auth/users/1/profile", { username: "new" });
    expect(apiClient.put).toHaveBeenCalledWith("/auth/users/1/password", { currentPassword: "a", newPassword: "b" });
  });

  it("calls role/status/delete admin endpoints", async () => {
    apiClient.put.mockResolvedValue({ data: { ok: true } });
    apiClient.delete.mockResolvedValue({ data: { ok: true } });
    await authService.changeUserRole(3, "AUTHOR");
    await authService.setUserStatus(3, false);
    await authService.deleteUser(3);
    expect(apiClient.put).toHaveBeenCalledWith("/auth/users/3/role", { role: "AUTHOR" });
    expect(apiClient.put).toHaveBeenCalledWith("/auth/users/3/status", null, { params: { active: false } });
    expect(apiClient.delete).toHaveBeenCalledWith("/auth/users/3");
  });

  it("calls audit/oauth/analytics and builds oauth url", async () => {
    apiClient.get.mockResolvedValue({ data: {} });
    await authService.getAuditLogs();
    await authService.oauthSuccess();
    await authService.platformAnalytics();
    expect(apiClient.get).toHaveBeenCalledWith("/auth/audit-logs");
    expect(apiClient.get).toHaveBeenCalledWith("/auth/oauth2/success");
    expect(apiClient.get).toHaveBeenCalledWith("/auth/admin/platform-analytics");
    expect(authService.oauthUrl("google")).toContain("/oauth2/authorization/google");
  });
});
