"use client";

import { useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  MailCheck,
  Lock,
  X,
  Power,
  RotateCcw,
  CheckCircle2,
  Search,
  Loader2,
  KeyRound,
  Copy,
} from "lucide-react";
import { KPIcard, MCard, SectionTitle, DataTable } from "@/components/cdfms/ui";
import { useScope } from "@/lib/cdfms/store";
import { can, ROLE_LABEL, ROLE_DESCRIPTION, CAPS, type Role } from "@/lib/cdfms/rbac";
import { ASSIGNABLE_ROLES, SCOPED_ROLES } from "@/lib/cdfms/user-store";
import { useUserAdmin, type AdminUser, type CreateInput, type CreateOutcome } from "@/lib/cdfms/use-users";
import { CONSTITUENCIES } from "@/lib/cdfms/constituencies";
import { constituencyById } from "@/lib/cdfms/data";
import { downloadCsv } from "@/lib/cdfms/export";

type AccountStatus = AdminUser["status"];

const STATUS_BADGE: Record<AccountStatus, string> = {
  invited: "bg-amber-50 text-amber-700 ring-amber-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  deactivated: "bg-slate-100 text-slate-600 ring-slate-200",
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  invited: "Invited",
  active: "Active",
  deactivated: "Deactivated",
};

export default function UserManagementPage() {
  const scope = useScope();
  const admin = useUserAdmin();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(
    () =>
      admin.users.filter((a) =>
        search
          ? a.fullName.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase())
          : true
      ),
    [admin.users, search]
  );

  // ---- Access gate ----
  if (!can(scope?.role, "admin:users")) {
    return (
      <MCard>
        <SectionTitle title="User Management" description="Restricted module." />
        <p className="text-sm text-ink-500 inline-flex items-center gap-1.5">
          <Lock className="h-4 w-4" /> Only a System Administrator can manage user accounts.
        </p>
      </MCard>
    );
  }

  const total = admin.users.length;
  const active = admin.users.filter((a) => a.status === "active").length;
  const invited = admin.users.filter((a) => a.status === "invited").length;
  const deactivated = admin.users.filter((a) => a.status === "deactivated").length;

  function handleExport() {
    downloadCsv("CEFANET_user_accounts", admin.users, [
      { header: "ID", cell: (a) => a.id },
      { header: "Full name", cell: (a) => a.fullName },
      { header: "Email", cell: (a) => a.email },
      { header: "Role", cell: (a) => ROLE_LABEL[a.role] },
      {
        header: "Scope",
        cell: (a) => (a.constituencyId ? constituencyById(a.constituencyId)?.name ?? "" : "National"),
      },
      { header: "Status", cell: (a) => a.status },
      { header: "Created", cell: (a) => a.createdAt.slice(0, 10) },
      { header: "Last login", cell: (a) => a.lastLoginAt?.slice(0, 10) ?? "never" },
      { header: "Created by", cell: (a) => a.createdBy },
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] tracking-[.2em] uppercase text-ministry-700 font-semibold">
            Module · Governance · System Administration
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 normal-case tracking-normal text-[10px] font-semibold ring-1 ${
                admin.isLive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${admin.isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
              {admin.isLive ? "Live · Neon database" : "Offline demo data"}
            </span>
          </div>
          <h1 className="font-serif text-3xl text-ink-900 mt-1">User Management</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Create accounts, assign roles and constituency / ward scope, and deactivate users.
            {admin.isLive
              ? " Accounts are stored in the CEFANET CDF-MS database."
              : " You are in offline demo mode — accounts are stored only in this browser."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50 shadow-sm"
          >
            Export Excel
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-ministry-700 text-white px-3 py-2 text-sm font-semibold hover:bg-ministry-800 shadow-ministry"
          >
            <UserPlus className="h-4 w-4" />
            Create user account
          </button>
        </div>
      </div>

      {admin.error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {admin.error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIcard label="Total accounts" value={`${total}`} icon={<Users className="h-4 w-4" />} />
        <KPIcard label="Active" value={`${active}`} tone="positive" icon={<ShieldCheck className="h-4 w-4" />} />
        <KPIcard label="Pending invite" value={`${invited}`} tone="warning" icon={<MailCheck className="h-4 w-4" />} hint="Not yet signed in" />
        <KPIcard label="Deactivated" value={`${deactivated}`} hint="Access revoked" />
      </section>

      <div>
        <SectionTitle
          eyebrow="Accounts"
          title={`All user accounts · ${filtered.length}`}
          right={
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="rounded-lg border border-ink-200 pl-7 pr-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-ministry-300"
              />
            </div>
          }
        />
        {admin.loading ? (
          <div className="rounded-xl border border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-ministry-600" />
            Loading accounts from the database…
          </div>
        ) : (
          <DataTable
            rows={filtered}
            empty="No accounts match your search."
            columns={[
              {
                header: "User",
                cell: (a) => (
                  <div>
                    <div className="font-medium text-ink-900">{a.fullName}</div>
                    <div className="text-[11px] text-ink-500 font-mono">{a.email}</div>
                  </div>
                ),
              },
              {
                header: "Role",
                cell: (a) => (
                  <div>
                    <div className="text-ink-900">{ROLE_LABEL[a.role]}</div>
                    <div className="text-[10px] text-ink-400 font-mono">{a.id.slice(0, 12)}</div>
                  </div>
                ),
              },
              {
                header: "Scope",
                cell: (a) => (
                  <span className="text-ink-700">
                    {a.constituencyId ? constituencyById(a.constituencyId)?.name ?? "—" : "National"}
                  </span>
                ),
              },
              {
                header: "Status",
                cell: (a) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_BADGE[a.status]}`}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                ),
              },
              {
                header: "Last login",
                cell: (a) => (
                  <span className="text-xs text-ink-500">
                    {a.lastLoginAt ? a.lastLoginAt.slice(0, 10) : "—"}
                  </span>
                ),
              },
              {
                header: "Action",
                cell: (a) =>
                  a.status === "deactivated" ? (
                    <button
                      onClick={() => void admin.setStatus(a.id, "active")}
                      className="inline-flex items-center gap-1 rounded-md border border-ministry-300 text-ministry-700 text-xs px-2 py-1 hover:bg-ministry-50"
                    >
                      <RotateCcw className="h-3 w-3" /> Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => void admin.setStatus(a.id, "deactivated")}
                      className="inline-flex items-center gap-1 rounded-md border border-red-300 text-red-600 text-xs px-2 py-1 hover:bg-red-50"
                    >
                      <Power className="h-3 w-3" /> Deactivate
                    </button>
                  ),
              },
            ]}
          />
        )}
      </div>

      {createOpen ? (
        <CreateUserModal
          isLive={admin.isLive}
          sysAdminCount={admin.sysAdminCount}
          maxSystemAdmins={admin.maxSystemAdmins}
          emailExists={admin.emailExists}
          onClose={() => setCreateOpen(false)}
          onCreate={admin.create}
        />
      ) : null}
    </div>
  );
}

function CreateUserModal({
  isLive,
  sysAdminCount,
  maxSystemAdmins,
  emailExists,
  onClose,
  onCreate,
}: {
  isLive: boolean;
  sysAdminCount: number;
  maxSystemAdmins: number;
  emailExists: (email: string) => boolean;
  onClose: () => void;
  onCreate: (input: CreateInput) => Promise<CreateOutcome>;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [constituencyId, setConstituencyId] = useState<number | "">("");
  const [confirmSysAdmin, setConfirmSysAdmin] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; role?: string; scope?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreateOutcome | null>(null);
  const [copied, setCopied] = useState(false);

  const needsScope = role !== "" && SCOPED_ROLES.includes(role);
  const isSysAdmin = role === "system_admin";
  const sysAdminCapReached = sysAdminCount >= maxSystemAdmins;

  function validate(): boolean {
    const e: typeof errors = {};
    if (!fullName.trim()) e.fullName = "Please enter the user's full name.";
    if (!email.trim()) e.email = "Please enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Please enter a valid email address.";
    else if (emailExists(email)) e.email = "An account with this email already exists.";
    if (!role) e.role = "Please choose a role.";
    else if (isSysAdmin && sysAdminCapReached)
      e.role = `The maximum of ${maxSystemAdmins} System Administrator accounts has been reached. Deactivate one before adding another.`;
    else if (isSysAdmin && !confirmSysAdmin)
      e.role = "Please confirm this privileged-role assignment below.";
    if (role !== "" && SCOPED_ROLES.includes(role) && constituencyId === "")
      e.scope = "This role must be tied to a constituency.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate() {
    if (!validate() || role === "") return;
    setSubmitting(true);
    const outcome = await onCreate({
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      constituencyId: needsScope && constituencyId !== "" ? Number(constituencyId) : null,
    });
    setSubmitting(false);
    if (!outcome.ok) {
      setErrors((p) => ({ ...p, email: outcome.error ?? "Could not create the account." }));
      return;
    }
    setCreated(outcome);
  }

  function copyPassword() {
    if (created?.tempPassword) {
      void navigator.clipboard?.writeText(created.tempPassword);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/60 flex items-end md:items-center justify-center p-3" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-ink-200 px-5 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-ministry-700 font-semibold">
              System Administration
            </div>
            <div className="font-serif text-lg text-ink-900">
              {created ? "Account created" : "Create user account"}
            </div>
          </div>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {created && created.user ? (
          <div className="p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="font-serif text-xl text-ink-900 mt-3">{created.user.fullName}</div>
            <p className="text-sm text-ink-600 mt-1">
              Account created as <strong>{ROLE_LABEL[created.user.role]}</strong>
              {created.user.constituencyId
                ? ` for ${constituencyById(created.user.constituencyId)?.name}`
                : " with national scope"}
              {isLive ? " and saved to the database." : "."}
            </p>

            {created.tempPassword ? (
              <div className="mt-4 rounded-lg bg-ministry-50 border border-ministry-200 p-3 text-left">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ministry-700 font-semibold">
                  <KeyRound className="h-3.5 w-3.5" /> Temporary password
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <code className="flex-1 font-mono text-base text-ink-900 bg-white border border-ink-200 rounded px-2 py-1.5">
                    {created.tempPassword}
                  </code>
                  <button
                    onClick={copyPassword}
                    className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-2 py-1.5 text-xs hover:bg-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-ink-600 mt-2">
                  Share this securely with <strong>{created.user.email}</strong>. They sign in with
                  it and should change it after first login. This password is shown only once.
                </p>
              </div>
            ) : null}

            <div className="mt-5">
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-ministry-700 text-white text-sm font-semibold py-2.5 hover:bg-ministry-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-ink-900">Full name</label>
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrors((p) => ({ ...p, fullName: undefined }));
                }}
                placeholder="e.g. C. Mwape"
                className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ministry-300 ${
                  errors.fullName ? "border-red-300" : "border-ink-200"
                }`}
              />
              {errors.fullName ? <div className="text-xs text-red-600 mt-1">{errors.fullName}</div> : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-ink-900">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="e.g. c.mwape@cefanet.org"
                className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ministry-300 ${
                  errors.email ? "border-red-300" : "border-ink-200"
                }`}
              />
              {errors.email ? <div className="text-xs text-red-600 mt-1">{errors.email}</div> : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-ink-900">Role</label>
              <div className="text-xs text-ink-500 mb-1.5">
                Determines the user&apos;s dashboard, approval authority and data scope.
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {ASSIGNABLE_ROLES.map((r) => {
                  const active = role === r;
                  const privileged = r === "system_admin";
                  const disabled = privileged && sysAdminCapReached;
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setRole(r);
                        setConfirmSysAdmin(false);
                        setErrors((p) => ({ ...p, role: undefined }));
                      }}
                      className={`text-left rounded-lg border px-3 py-2 transition-all ${
                        disabled
                          ? "border-ink-200 bg-ink-50 opacity-60 cursor-not-allowed"
                          : active
                          ? "border-ministry-600 bg-ministry-50 ring-1 ring-ministry-200"
                          : "border-ink-200 hover:border-ministry-300"
                      }`}
                    >
                      <div className="text-sm font-semibold text-ink-900 flex items-center gap-1.5">
                        {ROLE_LABEL[r]}
                        {privileged ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 text-red-700 ring-1 ring-red-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                            <ShieldCheck className="h-2.5 w-2.5" /> Privileged
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-ink-500">
                        {privileged && sysAdminCapReached
                          ? `Limit reached — ${maxSystemAdmins} of ${maxSystemAdmins} administrator accounts in use.`
                          : ROLE_DESCRIPTION[r]}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.role ? <div className="text-xs text-red-600 mt-1">{errors.role}</div> : null}
            </div>

            {/* Privileged-role confirmation */}
            {isSysAdmin && !sysAdminCapReached ? (
              <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 leading-relaxed">
                    <strong>System Administrator is the platform&apos;s most powerful role.</strong>{" "}
                    It can create and deactivate any account and change system configuration. Assign
                    it only to trusted IT personnel. {sysAdminCount} of {maxSystemAdmins}{" "}
                    administrator accounts are currently in use.
                  </div>
                </div>
                <label className="mt-2.5 flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmSysAdmin}
                    onChange={(e) => {
                      setConfirmSysAdmin(e.target.checked);
                      setErrors((p) => ({ ...p, role: undefined }));
                    }}
                    className="mt-0.5 h-4 w-4 accent-red-600"
                  />
                  <span className="text-xs font-semibold text-red-900">
                    I confirm this person should have full System Administrator access.
                  </span>
                </label>
              </div>
            ) : null}

            {needsScope ? (
              <div>
                <label className="text-sm font-semibold text-ink-900">
                  Assign constituency / ward scope
                </label>
                <div className="text-xs text-ink-500 mb-1.5">
                  This role can only see and act within its assigned constituency.
                </div>
                <select
                  value={constituencyId}
                  onChange={(e) => {
                    setConstituencyId(e.target.value === "" ? "" : Number(e.target.value));
                    setErrors((p) => ({ ...p, scope: undefined }));
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ministry-300 ${
                    errors.scope ? "border-red-300" : "border-ink-200"
                  }`}
                >
                  <option value="">Choose a constituency…</option>
                  {CONSTITUENCIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.province})
                    </option>
                  ))}
                </select>
                {errors.scope ? <div className="text-xs text-red-600 mt-1">{errors.scope}</div> : null}
              </div>
            ) : role !== "" ? (
              <div className="rounded-lg bg-ink-50 border border-ink-200 p-3 text-xs text-ink-600">
                This role has <strong>national scope</strong> — no constituency assignment needed.
              </div>
            ) : null}

            {role !== "" ? (
              <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3">
                <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                  This account will be granted
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {CAPS[role].map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center rounded-full bg-white border border-ministry-100 text-[10px] font-medium px-2 py-0.5 text-ministry-700"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-ministry-700 text-white text-sm font-semibold py-3 hover:bg-ministry-800 shadow-ministry disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Creating account…" : "Create account"}
            </button>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              {isLive
                ? "The account is saved to the database. A one-time temporary password is generated for you to share with the user."
                : "Offline demo mode — the account is stored only in this browser."}{" "}
              All account actions are written to the audit trail.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
