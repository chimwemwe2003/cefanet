"use client";

// Thin client for the CDF-MS real-auth + user-management API.

import type { Role } from "./rbac";
import type { LiveUser } from "./store";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function isApiConfigured(): boolean {
  return API_URL.length > 0;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, "No server is configured for this build.");
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(res.status, String(body.message ?? body.error ?? `Request failed (${res.status}).`));
  }
  return body as T;
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ---- Auth ----

export interface LoginResponse {
  token: string;
  user: LiveUser & { status: string };
}

export function apiLogin(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---- User management (System Administrator only) ----

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  constituencyId: number | null;
  status: "active" | "invited" | "deactivated";
  createdAt: string;
  lastLoginAt: string | null;
  createdBy: string;
}

export interface ListUsersResponse {
  users: ApiUser[];
  sysAdminCount: number;
  maxSystemAdmins: number;
}

export function apiListUsers(token: string): Promise<ListUsersResponse> {
  return request<ListUsersResponse>("/admin/users", { headers: authHeader(token) });
}

export interface CreateUserResponse {
  user: ApiUser;
  tempPassword: string;
}

export function apiCreateUser(
  token: string,
  input: { fullName: string; email: string; role: Role; constituencyId: number | null }
): Promise<CreateUserResponse> {
  return request<CreateUserResponse>("/admin/users", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function apiSetUserStatus(
  token: string,
  id: string,
  status: "active" | "deactivated"
): Promise<{ user: ApiUser }> {
  return request<{ user: ApiUser }>(`/admin/users/${id}/status`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  });
}
