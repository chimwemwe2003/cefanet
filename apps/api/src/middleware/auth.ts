import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "cefanet-demo-secret-change-in-prod";

// CDF-MS role identifiers (mirror of the web app's RBAC role list).
export type AppRole =
  | "constituency_officer"
  | "ministry_official"
  | "auditor"
  | "wdc_agent"
  | "cso_stakeholder"
  | "system_admin";

export interface AuthUser {
  sub: string; // user id
  email: string;
  fullName: string;
  role: AppRole;
  constituencyId: number | null;
  status: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

/** Soft auth — populates req.user if a valid bearer token is present. */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return next();
  }
  const decoded = verifyToken(header.slice(7).trim());
  if (decoded) req.user = decoded;
  next();
}

/** Hard guard — rejects requests whose token role is not in the allow-list. */
export function requireRole(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized", message: "Sign-in required." });
      return;
    }
    if (req.user.status === "deactivated") {
      res.status(403).json({ error: "deactivated", message: "This account has been deactivated." });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "forbidden", required: roles });
      return;
    }
    next();
  };
}
