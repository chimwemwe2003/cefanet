import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Strip trailing slashes (except root) so `/login/` matches `/login` on static hosts. */
export function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  let p = pathname;
  while (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}
