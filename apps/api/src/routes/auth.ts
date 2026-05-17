import { Router, type Request, type Response } from "express";
import { signToken, type AuthUser } from "../middleware/auth.js";
import { findByEmail, verifyPassword, touchLastLogin } from "../services/app-users.js";

export const authRouter = Router();

/** POST /auth/login — email + password → JWT. */
authRouter.post("/login", async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    res.status(400).json({ error: "bad_request", message: "Email and password are required." });
    return;
  }

  const user = await findByEmail(email);
  if (!user) {
    res.status(401).json({ error: "invalid_credentials", message: "Email or password is incorrect." });
    return;
  }
  if (user.status === "deactivated") {
    res
      .status(403)
      .json({ error: "deactivated", message: "This account has been deactivated. Contact your administrator." });
    return;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "invalid_credentials", message: "Email or password is incorrect." });
    return;
  }

  await touchLastLogin(user.id);

  const claims: AuthUser = {
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as AuthUser["role"],
    constituencyId: user.constituencyId,
    status: user.status,
  };
  res.json({
    token: signToken(claims),
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      constituencyId: user.constituencyId,
      status: user.status,
    },
  });
});

/** GET /auth/me — return the signed-in user from the bearer token. */
authRouter.get("/me", (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  res.json({
    user: {
      id: req.user.sub,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      constituencyId: req.user.constituencyId,
      status: req.user.status,
    },
  });
});
