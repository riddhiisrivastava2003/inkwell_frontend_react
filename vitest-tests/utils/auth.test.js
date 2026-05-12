import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  parseJwtPayload,
  setAuthStorage,
} from "../../src/utils/auth";
import { STORAGE_KEYS } from "../../src/utils/constants";

describe("utils/auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and reads token/user from localStorage", () => {
    setAuthStorage({
      token: "abc-token",
      user: { id: 1, username: "inkwell" },
    });

    expect(getStoredToken()).toBe("abc-token");
    expect(getStoredUser()).toEqual({ id: 1, username: "inkwell" });
  });

  it("returns null for malformed user JSON", () => {
    localStorage.setItem(STORAGE_KEYS.USER, "{broken-json");
    expect(getStoredUser()).toBeNull();
  });

  it("clears auth storage keys", () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "t");
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 9 }));

    clearAuthStorage();

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });

  it("parses jwt payload", () => {
    const payload = { userId: 7, role: "AUTHOR" };
    const encoded = btoa(JSON.stringify(payload));
    const token = `header.${encoded}.sig`;
    expect(parseJwtPayload(token)).toEqual(payload);
  });

  it("returns null for invalid jwt token", () => {
    expect(parseJwtPayload("invalid-token")).toBeNull();
  });
});
