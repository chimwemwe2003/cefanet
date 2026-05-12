import type {
  Constituency,
  Project,
  ProjectDetail,
  DashboardSummary,
  FinancialOverview,
  BursaryStats,
  Beneficiary,
  Alert,
  LoginRequest,
  LoginResponse,
} from "@cefanet/shared";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("cefanet_token");
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (body: LoginRequest) =>
    http<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => http<{ user: LoginResponse["user"] }>("/auth/me"),

  // Constituencies
  listConstituencies: () => http<Constituency[]>("/constituencies"),
  dashboardSummary: (id: number) =>
    http<DashboardSummary>(`/constituencies/${id}/summary`),

  // Projects
  listProjects: (constituencyId: number) =>
    http<Project[]>(`/projects?constituencyId=${constituencyId}`),
  getProject: (id: number) => http<ProjectDetail>(`/projects/${id}`),

  // Financials
  financialOverview: (constituencyId: number) =>
    http<FinancialOverview>(`/financials/overview?constituencyId=${constituencyId}`),

  // Bursaries
  bursaryStats: (constituencyId: number) =>
    http<BursaryStats>(`/bursaries/stats?constituencyId=${constituencyId}`),
  listBeneficiaries: (constituencyId: number) =>
    http<Beneficiary[]>(`/bursaries/beneficiaries?constituencyId=${constituencyId}`),

  // Alerts
  listAlerts: (constituencyId?: number) =>
    http<Alert[]>(
      constituencyId ? `/alerts?constituencyId=${constituencyId}` : "/alerts"
    ),
};

export { API_URL };
