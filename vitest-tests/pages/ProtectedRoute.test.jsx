import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../../src/pages/shared/ProtectedRoute";

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../src/hooks/useAuth";

const renderWithRouter = (ui, initialPath = "/secure") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/secure" element={ui} />
      </Routes>
    </MemoryRouter>
  );

describe("pages/ProtectedRoute", () => {
  it("shows loader while auth is checking", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isChecking: true,
      user: null,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/Checking session/i)).toBeInTheDocument();
  });

  it("renders protected content for authorized user", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isChecking: false,
      user: { role: "ADMIN" },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Secret")).toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isChecking: false,
      user: null,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to home when role is not allowed", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isChecking: false,
      user: { role: "READER" },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
