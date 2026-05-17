"use client";

// Real, working exports. No fake buttons.
//
// • Excel export: generate a CSV string with proper escaping → trigger browser
//   download. Excel opens .csv natively; no external library required.
//
// • PDF export: open a /print/* route in a new tab; that page is print-styled
//   and the user uses Ctrl+P → "Save as PDF". Zero dependencies, perfect
//   fidelity, matches what real ministry users do today with their browsers.

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: Array<{ header: string; cell: (row: T) => string | number | null | undefined }>
): void {
  const lines = [
    columns.map((c) => csvCell(c.header)).join(","),
    ...rows.map((r) => columns.map((c) => csvCell(c.cell(r))).join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/**
 * Open a print-ready report in a new tab. The /print/* route renders a
 * print-stylesheet layout; the user invokes Ctrl+P / browser print to save
 * as PDF or print to paper.
 */
export function openPrintReport(path: string): void {
  const url = path.startsWith("/") ? path : `/${path}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
