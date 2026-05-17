"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, AlertTriangle, ChevronDown, KeyRound } from "lucide-react";
import { useCdfmsAuth } from "@/lib/cdfms/store";
import { apiLogin, ApiError, isApiConfigured } from "@/lib/cdfms/auth-api";
import { ROLE_LABEL, ROLE_DESCRIPTION, type Role } from "@/lib/cdfms/rbac";
import { CONSTITUENCIES } from "@/lib/cdfms/constituencies";
import { DemoWatermark } from "@/components/cdfms/demo-watermark";

const DEMO_PASSWORD = "demo1234";
const DEMO_ACCOUNTS: Array<{ email: string; label: string }> = [
  { email: "admin@cefanet.org", label: "System Administrator" },
  { email: "ps@mlgrd.gov.zm", label: "Ministry Official" },
  { email: "officer@cefanet.org", label: "Constituency Officer" },
  { email: "ward@cefanet.org", label: "Ward Officer" },
  { email: "auditor@ago.gov.zm", label: "Auditor General Office" },
  { email: "cso@cefanet.org", label: "CSO / CEFANET Stakeholder" },
];

const OFFLINE_ROLES: Role[] = [
  "constituency_officer",
  "ministry_official",
  "auditor",
  "wdc_agent",
  "cso_stakeholder",
  "system_admin",
];

export default function LoginPage() {
  const router = useRouter();
  const signInLive = useCdfmsAuth((s) => s.signInLive);
  const signInDemo = useCdfmsAuth((s) => s.signInDemo);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineOpen, setOfflineOpen] = useState(false);

  function landingFor(role: Role): string {
    return role === "wdc_agent" ? "/field" : "/dashboard";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const { token, user } = await apiLogin(email.trim(), password);
      signInLive(token, {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        constituencyId: user.constituencyId,
      });
      router.push(landingFor(user.role));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Sign-in failed. Please try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  function enterOffline(role: Role) {
    const firstConst = CONSTITUENCIES[0]?.id ?? 1;
    const scoped = role === "constituency_officer" || role === "wdc_agent";
    signInDemo(role, `${ROLE_LABEL[role]} (demo)`, {
      homeConstituencyId: scoped ? firstConst : undefined,
    });
    router.push(landingFor(role));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ministry-700 via-ministry-800 to-ministry-900 p-4 md:p-8">
      <DemoWatermark />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* Brand panel */}
        <div className="bg-gradient-to-br from-ministry-700 to-ministry-900 text-white p-8 md:p-10 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gold-500 text-ministry-900 flex items-center justify-center font-bold text-2xl shadow-ministry">
              C
            </div>
            <div className="leading-tight">
              <div className="font-serif text-xl">CEFANET CDF-MS</div>
              <div className="text-[10px] uppercase tracking-[.2em] text-gold-200">
                Republic of Zambia · MLGRD
              </div>
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl leading-tight mt-10">
            CEFANET Constituency Development Fund Management System
          </h1>
          <p className="text-sm text-ministry-100/80 mt-3 max-w-md leading-relaxed">
            Real-time stewardship of <span className="font-semibold text-gold-200">K9.04 billion</span> across{" "}
            <span className="font-semibold text-gold-200">226 constituencies</span>. Sign in with
            the account issued to you by your System Administrator.
          </p>

          <div className="mt-auto pt-10 text-[11px] text-ministry-100/60 leading-relaxed">
            One Zambia · One Nation · One System
            <br />
            Demo build · Not for production use
          </div>
        </div>

        {/* Sign-in panel */}
        <div className="p-6 md:p-10 flex flex-col">
          <div className="text-[11px] uppercase tracking-[.2em] text-ministry-700 font-semibold">
            Secure sign-in
          </div>
          <h2 className="font-serif text-2xl text-ink-900 mt-1">Sign in to your account</h2>
          <p className="text-sm text-ink-500 mt-1">
            Accounts are created and assigned by the System Administrator. Your role and data
            scope are determined by your account.
          </p>

          <form onSubmit={handleLogin} className="mt-5 flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-700">Email address</label>
              <input
                type="email"
                value={email}
                autoComplete="username"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cefanet.org"
                className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ministry-300 focus:border-ministry-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-700">Password</label>
              <input
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ministry-300 focus:border-ministry-500"
              />
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-ministry-700 text-white text-sm font-semibold py-3 hover:bg-ministry-800 shadow-ministry-lg transition-colors disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
              <KeyRound className="h-3 w-3" /> Demo accounts · password{" "}
              <code className="font-mono text-ministry-700">{DEMO_PASSWORD}</code>
            </div>
            <div className="mt-1.5 grid grid-cols-1 gap-1">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillDemo(a.email)}
                  className="flex items-center justify-between text-left rounded-md px-2 py-1.5 hover:bg-white border border-transparent hover:border-ink-200 transition-colors"
                >
                  <span className="text-xs text-ink-700">{a.label}</span>
                  <span className="text-[11px] font-mono text-ministry-600">{a.email}</span>
                </button>
              ))}
            </div>
            <div className="text-[10px] text-ink-400 mt-1.5">
              Tap an account to fill the form, then press Sign in.
            </div>
          </div>

          {/* Offline demo fallback */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setOfflineOpen((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-800"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${offlineOpen ? "rotate-180" : ""}`} />
              {isApiConfigured()
                ? "Server unreachable? Use offline demo mode"
                : "Offline demo mode (no server configured)"}
            </button>
            {offlineOpen ? (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Offline mode skips real authentication and lets you preview any role. Data is not
                  saved to the database. Use this only if the server is down.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {OFFLINE_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => enterOffline(r)}
                      className="text-left rounded-md border border-ink-200 bg-white px-2 py-1.5 hover:border-ministry-300"
                    >
                      <div className="text-xs font-semibold text-ink-900">{ROLE_LABEL[r]}</div>
                      <div className="text-[10px] text-ink-500 truncate">{ROLE_DESCRIPTION[r]}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 text-[11px] text-ink-500 leading-relaxed">
            By signing in you agree to abide by the Public Finance Management Act No. 1 of 2018,
            CDF Act No. 1 of 2024, and Data Protection Act No. 3 of 2021. All actions on this
            platform are logged for audit purposes.
          </div>
        </div>
      </div>
    </div>
  );
}
