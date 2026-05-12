import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, users } from "@cefanet/db";
import { LoginRequestSchema, type LoginResponse } from "@cefanet/shared";
import { signToken } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  const parse = LoginRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "bad_request", issues: parse.error.issues });
    return;
  }

  const { email, password } = parse.data;
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];

  if (!user) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    constituencyId: user.constituencyId,
  });

  const response: LoginResponse = {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      constituencyId: user.constituencyId,
    },
  };
  res.json(response);
});

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
    },
  });
});
