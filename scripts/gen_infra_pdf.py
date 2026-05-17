"""
Generate Infrastructure_Costs.pdf — a one-page (ish) breakdown of CEFANET CDF-MS
monthly infrastructure spend at MVP, pilot and national scale.

Run:  python scripts/gen_infra_pdf.py
"""
from __future__ import annotations

import sys
from fpdf import FPDF
from fpdf.enums import XPos, YPos


# Brand
INK_DARK = (15, 23, 42)
INK_MUTED = (100, 116, 139)
INK_LINE = (226, 232, 240)
MINISTRY = (21, 128, 61)        # #15803d
MINISTRY_DEEP = (20, 83, 45)    # #14532d
GOLD = (245, 158, 11)           # #f59e0b
ROW_ALT = (248, 250, 252)
WHITE = (255, 255, 255)


class Doc(FPDF):
    def header(self):
        # Letterhead bar
        self.set_fill_color(*MINISTRY_DEEP)
        self.rect(0, 0, self.w, 22, "F")
        # Gold accent stripe
        self.set_fill_color(*GOLD)
        self.rect(0, 22, self.w, 2, "F")

        # Logo block
        self.set_fill_color(*GOLD)
        self.rect(15, 5, 12, 12, "F")
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(*MINISTRY_DEEP)
        self.set_xy(15, 5)
        self.cell(12, 12, "C", align="C")

        # Title text
        self.set_xy(31, 5)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 5, "CEFANET CDF-MS")
        self.set_xy(31, 11)
        self.set_font("Helvetica", "", 9)
        self.cell(0, 5, "Constituency Development Fund Management System")

        # Right-aligned classification
        self.set_xy(self.w - 80, 7)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*GOLD)
        self.cell(65, 4, "INFRASTRUCTURE COSTS", align="R")
        self.set_xy(self.w - 80, 12)
        self.set_text_color(255, 255, 255, 180) if False else self.set_text_color(220, 220, 220)
        self.set_font("Helvetica", "", 7)
        self.cell(65, 4, "Internal · Republic of Zambia · MLGRD", align="R")

        self.set_text_color(*INK_DARK)
        self.set_y(32)

    def footer(self):
        self.set_y(-12)
        self.set_draw_color(*INK_LINE)
        self.line(15, self.h - 12, self.w - 15, self.h - 12)
        self.set_y(-9)
        self.set_font("Helvetica", "", 7)
        self.set_text_color(*INK_MUTED)
        self.cell(0, 4, f"CEFANET CDF-MS · Infrastructure cost sheet · Page {self.page_no()}", align="C")

    # ---- helpers ----

    def section_title(self, eyebrow: str, title: str):
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*MINISTRY)
        self.cell(0, 4, eyebrow.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(0.5)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*INK_DARK)
        self.cell(0, 6, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)

    def paragraph(self, text: str, size: int = 9):
        self.set_font("Helvetica", "", size)
        self.set_text_color(*INK_DARK)
        self.multi_cell(0, 4.5, text)
        self.ln(2)

    def kpi_row(self, cells):
        """cells = [(label, value, hint)]"""
        n = len(cells)
        usable_w = self.w - 30
        w = usable_w / n
        h_card = 22
        x_start = self.get_x()
        y_start = self.get_y()
        for i, (label, value, hint) in enumerate(cells):
            x = x_start + i * w
            self.set_xy(x, y_start)
            # Card background
            self.set_fill_color(*WHITE)
            self.set_draw_color(*INK_LINE)
            self.rect(x, y_start, w - 2, h_card, "DF")

            self.set_xy(x + 3, y_start + 2)
            self.set_font("Helvetica", "B", 7)
            self.set_text_color(*MINISTRY)
            self.cell(w - 6, 3.5, label.upper())

            self.set_xy(x + 3, y_start + 7)
            self.set_font("Helvetica", "B", 13)
            self.set_text_color(*INK_DARK)
            self.cell(w - 6, 6, value)

            if hint:
                self.set_xy(x + 3, y_start + 15)
                self.set_font("Helvetica", "", 7)
                self.set_text_color(*INK_MUTED)
                self.cell(w - 6, 3, hint)
        self.set_xy(x_start, y_start + h_card + 4)

    def cost_table(self, headers, rows, totals_row=None):
        # Layout
        col_widths = [70, 28, 28, 32, 22]
        usable = self.w - 30
        scale = usable / sum(col_widths)
        col_widths = [int(w * scale) for w in col_widths]
        line_h = 5.5
        x_start = self.get_x()

        # Header
        self.set_font("Helvetica", "B", 7.5)
        self.set_text_color(*INK_MUTED)
        self.set_fill_color(*ROW_ALT)
        self.set_draw_color(*INK_LINE)
        x = x_start
        for i, h in enumerate(headers):
            align = "L" if i == 0 else "R"
            self.set_xy(x, self.get_y())
            self.cell(col_widths[i], line_h, h.upper(), border="B", align=align, fill=True)
            x += col_widths[i]
        self.ln(line_h)

        # Body
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*INK_DARK)
        for ri, row in enumerate(rows):
            y0 = self.get_y()
            if ri % 2 == 0:
                self.set_fill_color(255, 255, 255)
            else:
                self.set_fill_color(*ROW_ALT)
            self.rect(x_start, y0, sum(col_widths), line_h, "F")

            x = x_start
            for i, cell in enumerate(row):
                align = "L" if i == 0 else "R"
                self.set_xy(x, y0)
                self.cell(col_widths[i], line_h, cell, align=align)
                x += col_widths[i]
            self.ln(line_h)

        # Total row
        if totals_row:
            self.set_draw_color(*MINISTRY)
            y0 = self.get_y()
            self.set_fill_color(240, 253, 244)  # ministry-50
            self.rect(x_start, y0, sum(col_widths), line_h + 2, "F")
            self.set_font("Helvetica", "B", 9)
            self.set_text_color(*MINISTRY_DEEP)
            x = x_start
            for i, cell in enumerate(totals_row):
                align = "L" if i == 0 else "R"
                self.set_xy(x, y0 + 1)
                self.cell(col_widths[i], line_h, cell, align=align)
                x += col_widths[i]
            self.ln(line_h + 3)


def main():
    doc = Doc(orientation="P", unit="mm", format="A4")
    doc.set_auto_page_break(auto=True, margin=18)
    doc.set_margins(15, 32, 15)
    doc.add_page()

    # Title block
    doc.section_title(
        "Cost summary · monthly running infrastructure",
        "Infrastructure Cost Breakdown"
    )
    doc.paragraph(
        "Monthly cloud + third-party service costs for running CEFANET CDF-MS at three "
        "scale points. All figures in USD per month with Zambian Kwacha equivalents at "
        "K25 / USD. Costs exclude one-time setup, labour, training and field hardware."
    )

    # KPI strip
    doc.kpi_row([
        ("MVP scale", "$345 / mo", "5 constituencies · K8,625"),
        ("Pilot scale", "$890 / mo", "10 constituencies · K22,250"),
        ("National scale", "$3,100-$6,200 / mo", "226 constituencies · K78k-K155k"),
    ])

    # Service-by-service table
    doc.section_title("Line items", "Service-by-service monthly cost")
    headers = ["Service", "MVP $", "Pilot $", "National $", "Tier"]
    rows = [
        ["AWS ECS Fargate (API + workers)",         "80",   "150",  "600 - 900",     "Compute"],
        ["AWS RDS PostgreSQL Multi-AZ",             "90",   "140",  "500 - 700",     "Data"],
        ["AWS ElastiCache Redis",                   "30",    "50",  "180 - 280",     "Data"],
        ["AWS S3 + CloudFront (photos, reports)",   "20",    "60",  "360 - 720",     "Storage"],
        ["AWS Cognito (identity, MFA)",              "0",     "0",   "80 - 200",     "Auth"],
        ["AWS Secrets Manager + KMS",                "5",    "10",        "30",      "Security"],
        ["AWS Route 53 + ACM + WAF",                "25",    "30",        "90",      "Edge"],
        ["AWS SES (transactional email)",            "5",    "10",   "60 - 150",     "Comms"],
        ["AWS CloudWatch + X-Ray",                  "20",    "40",  "170 - 290",     "Observability"],
        ["Sentry (error tracking)",                 "26",    "26",  "100 - 200",     "Observability"],
        ["KoboToolbox hosted (form server)",         "0",   "200",  "200 - 700",     "Field data"],
        ["Africa's Talking SMS (variable usage)",   "10",    "80",  "600 - 1,700",   "Field data"],
        ["Africa's Talking USSD code rental",        "0",    "50",   "50 - 100",     "Field data"],
        ["GitHub Team plan",                         "4",     "4",         "4",      "Dev tools"],
        ["Domain + uptime monitoring",              "30",    "40",        "90",      "Edge"],
    ]
    totals = ["TOTAL MONTHLY", "~345", "~890", "3,100 - 6,200", ""]
    doc.cost_table(headers, rows, totals)

    # Annualised
    doc.ln(2)
    doc.section_title("Annualised", "Year-1 running cost projections")
    headers2 = ["Phase", "USD / year", "K / year", "Notes", "Tier"]
    rows2 = [
        ["MVP (Phase 1 deployment)",        "$4,140",       "K103,500",   "Sprints 1-6, 5 constituencies",       "Year-1"],
        ["Pilot (Phase 2)",                 "$10,680",      "K267,000",   "5-10 constituencies, full features",  "Year-1"],
        ["Hardening (Phase 3)",             "$15,000",      "K375,000",   "Performance work, mobile app live",   "Year-1"],
        ["National (Phase 4 + Year-2)",     "$37,200 - $74,400", "K930k-K1.86M", "All 226 constituencies live",   "Year-1+"],
    ]
    doc.cost_table(headers2, rows2)

    # Cost-saving levers
    doc.ln(1)
    doc.section_title("Cost levers", "How to reduce monthly spend at scale")
    doc.set_font("Helvetica", "", 9)
    doc.set_text_color(*INK_DARK)
    levers = [
        "1-year AWS Reserved Instances on Fargate + RDS reduce compute and database cost by 30-40 percent.",
        "S3 Intelligent-Tiering + lifecycle policy moving photos older than 24 months to Glacier reduces storage cost by ~50 percent at national scale.",
        "Africa's Talking volume discount activates above 500,000 SMS per year (typical national volume).",
        "Self-hosting Kobo on the same AWS account saves ~$200/mo at the cost of ~0.5 DevOps days/month.",
        "Cloudflare in front of CloudFront caches the public dashboard; reduces CloudFront egress costs by 60-70 percent.",
    ]
    for line in levers:
        doc.set_x(15)
        doc.set_font("Helvetica", "B", 8.5)
        doc.set_text_color(*MINISTRY)
        doc.cell(4, 4.5, "->")
        doc.set_font("Helvetica", "", 9)
        doc.set_text_color(*INK_DARK)
        doc.multi_cell(0, 4.5, line)
        doc.ln(0.5)

    # New page if needed for assumptions
    if doc.get_y() > 240:
        doc.add_page()

    doc.ln(2)
    doc.section_title("Assumptions & exclusions", "What this number does and does not cover")
    doc.paragraph(
        "INCLUDED: AWS af-south-1 (Cape Town) compute, database, storage, edge and observability. "
        "Identity (Cognito), secrets, certificates, email and SMS gateways. Error tracking, uptime "
        "monitoring, version control and CI/CD platforms. KoboToolbox and Africa's Talking subscriptions. "
        "Domain registration and renewals."
    )
    doc.paragraph(
        "EXCLUDED FROM THIS SHEET: developer and field-officer salaries; one-time costs (DPIA, penetration "
        "testing, branding, legal review); training rounds and per-diems; field hardware (tablets, power banks); "
        "communications campaigns; M&E evaluation. See DEVELOPMENT_BUDGET.md for the full breakdown."
    )
    doc.paragraph(
        "FX assumption: K25 per USD. Costs adjust automatically with the prevailing rate."
    )

    # Footer signature line
    doc.ln(4)
    doc.set_draw_color(*INK_LINE)
    doc.line(15, doc.get_y(), doc.w - 15, doc.get_y())
    doc.ln(2)
    doc.set_font("Helvetica", "", 8)
    doc.set_text_color(*INK_MUTED)
    doc.multi_cell(0, 4, (
        "Prepared for the CEFANET-MLGRD MoU process. Figures revised as live vendor quotes are received. "
        "This document is internal and not for public circulation."
    ))

    out = "Infrastructure_Costs.pdf"
    doc.output(out)
    print(f"PDF generated: {out}")


if __name__ == "__main__":
    sys.exit(main())
