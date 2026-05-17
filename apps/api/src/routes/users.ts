import { Router, type Request, type Response } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  APP_ROLES,
  MAX_SYSTEM_ADMINS,
  listUsers,
  createUser,
  setStatus,
  findByEmail,
  activeSysAdminCount,
} from "../services/app-users.js";
import type { AppRole } from "../middleware/auth.js";

export const usersRouter = Router();

const SCOPED_ROLES: AppRole[] = ["constituency_officer", "wdc_agent"];

// Every route here is System-Administrator-only — enforced server-side.
usersRouter.use(requireRole("system_admin"));

/** GET /admin/users — list all accounts. */
usersRouter.get("/", async (_req: Request, res: Response) => {
  const users = await listUsers();
  const sysAdminCount = await activeSysAdminCount();
  res.json({ users, sysAdminCount, maxSystemAdmins: MAX_SYSTEM_ADMINS });
});

/** POST /admin/users — create an account. Returns a one-time temporary password. */
usersRouter.post("/", async (req: Request, res: Response) => {
  const fullName = String(req.body?.fullName ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const role = String(req.body?.role ?? "") as AppRole;
  const constituencyIdRaw = req.body?.constituencyId;
  const constituencyId =
    constituencyIdRaw === null || constituencyIdRaw === undefined || constituencyIdRaw === ""
      ? null
      : Number(constituencyIdRaw);

  // --- validation ---
  if (!fullName) {
    res.status(400).json({ error: "bad_request", message: "Full name is required." });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "bad_request", message: "A valid email address is required." });
    return;
  }
  if (!APP_ROLES.includes(role)) {
    res.status(400).json({ error: "bad_request", message: "Unknown role." });
    return;
  }
  if (SCOPED_ROLES.includes(role) && (constituencyId === null || Number.isNaN(constituencyId))) {
    res.status(400).json({ error: "bad_request", message: "This role must be tied to a constituency." });
    return;
  }
  if (await findByEmail(email)) {
    res.status(409).json({ error: "email_exists", message: "An account with this email already exists." });
    return;
  }
  // --- privileged-role cap (enforced server-side, not just in the UI) ---
  if (role === "system_admin") {
    const count = await activeSysAdminCount();
    if (count >= MAX_SYSTEM_ADMINS) {
      res.status(409).json({
        error: "sysadmin_cap",
        message: `The maximum of ${MAX_SYSTEM_ADMINS} System Administrator accounts has been reached.`,
      });
      return;
    }
  }

  const result = await createUser({
    fullName,
    email,
    role,
    constituencyId: SCOPED_ROLES.includes(role) ? constituencyId : null,
    createdBy: req.user?.fullName ?? "System Administrator",
  });
  res.status(201).json(result); // { user, tempPassword }
});

/** PATCH /admin/users/:id/status — activate or deactivate an account. */
usersRouter.patch("/:id/status", async (req: Request, res: Response) => {
  const status = String(req.body?.status ?? "");
  if (!["active", "deactivated"].includes(status)) {
    res.status(400).json({ error: "bad_request", message: "Status must be 'active' or 'deactivated'." });
    return;
  }
  // Re-activating a System Administrator must still respect the cap.
  const updated = await setStatus(req.params.id, status);
  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ user: updated });
});
