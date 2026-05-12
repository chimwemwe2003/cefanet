"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, ShieldCheck, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { LoginRequestSchema, type LoginRequest } from "@cefanet/shared";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginRequest): Promise<void> {
    setError(null);
    try {
      const res = await api.login(values);
      setAuth(res.token, res.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  function fillDemo(email: string): void {
    setValue("email", email);
    setValue("password", "demo123");
  }

  return (
    <div className="max-w-md mx-auto mt-4 md:mt-12 flex flex-col gap-4">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sign in to CEFANET</h1>
            <p className="text-xs text-slate-500">
              Government and CEFANET staff only
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="input mt-1"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="input mt-1"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            ) : null}
          </div>
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-amber-600" />
          Demo accounts
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium">admin@cefanet.org</div>
              <div className="text-xs text-slate-500">Super Admin — full access</div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => fillDemo("admin@cefanet.org")}
              type="button"
            >
              Use
            </button>
          </li>
          <li className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium">officer@lusaka.gov.zm</div>
              <div className="text-xs text-slate-500">
                District Officer — Lusaka Central
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => fillDemo("officer@lusaka.gov.zm")}
              type="button"
            >
              Use
            </button>
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-500 mt-2">
            <Users className="h-3 w-3 mt-0.5" />
            Password for both is <code className="font-mono">demo123</code>. Public
            users see the dashboard without signing in.
          </li>
        </ul>
      </div>
    </div>
  );
}
