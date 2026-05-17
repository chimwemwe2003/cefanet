# Questions to ask CEFANET before building the production system

Use this as the agenda for your scoping meeting with CEFANET leadership and (ideally) an MLGRD representative. Every "TBD" answer here will turn into rework downstream. Don't start Sprint 1 with any blockers in Tier 1 unresolved.

---

## Tier 1 — Mandate & legal (will block everything else)

These need answers **before any infrastructure is provisioned**.

1. **MoU status with MLGRD** — Is the MoU signed? In draft? What does it say about CEFANET's access to ICDFMIS, ability to publish data publicly, and ownership of the platform?
2. **Public-data scope** — The blueprint says the public dashboard surfaces aggregated data only. Under the **Access to Information Act No. 24 of 2023**, what level of project-level detail is legally publishable without consent? Names of contractors? Specific GPS coordinates? Photos?
3. **Beneficiary PII** — Bursary and grant beneficiaries are individuals. Under the **Zambia Data Protection Act No. 3 of 2021**, what consent process exists? Who is the data controller — CEFANET, MLGRD, or the Local Authority?
4. **Anonymisation rules** — The demo uses `BEN-0001` style codes. Is that enough for public reporting, or do we need k-anonymity / suppression of small constituency totals?
5. **Data residency** — Must all data be hosted in Zambia? In Africa (e.g., AWS Cape Town)? Or is anywhere acceptable for the pilot? This determines cloud provider and cost.
6. **Audit Office (PAC / Auditor General) requirements** — What format do they need synthesis reports in? PDF? Excel? Direct API access?

---

## Tier 2 — Data sources & integrations

7. **ICDFMIS** — Does the API actually exist and is it documented? Has CEFANET been given credentials? What's the authentication mechanism? What entities does it expose (projects, disbursements, both)? **If "not yet" — what's the fallback for the pilot?**
8. **ICDFMIS data freshness** — How often is ICDFMIS updated? Nightly sync sufficient, or do we need on-demand pulls?
9. **Existing data** — Do CDFCs / WDCs already have project trackers (Excel? paper?) we should import? What format?
10. **Photo storage** — Where are GPS photos stored today (if anywhere)? Phone gallery? WhatsApp groups? Local computers? Migration plan?
11. **Joint Spot Monitoring (JSM)** reports — These exist on paper today. Do we digitise them in v1, or is that Phase 2?
12. **Local Authority reporting** — What systems do Local Authorities already use? Do they want us to push to those systems or pull from them?

---

## Tier 3 — Users, roles & training

13. **WDC digital literacy** — The blueprint assumes WDCs use a mobile app + SMS. What is the actual phone-ownership rate among current WDC members? Smartphone vs. feature phone? Network coverage in pilot wards?
14. **Training budget & format** — Who funds and runs WDC/CDFC training? Is CEFANET's field team available, or do we budget for a training partner? Per-diem rates?
15. **Initial user list** — How many users do we provision at pilot launch? Per role: super_admin, mlgrd_admin, district_coordinator, constituency_agent, wdc_agent, auditor?
16. **Onboarding mechanism** — Self-signup with admin approval? Admin-creates-then-emails? SMS one-time-passcode for WDCs without email?
17. **Language requirements** — Blueprint mentions English + Nyanja + Bemba. Which screens need vernacular versions? Just the public dashboard? Or admin screens too?
18. **Accessibility** — Are there WCAG / disability requirements? Many WDC members may be elderly — large text, voice-over considerations?

---

## Tier 4 — Hosting, budget & operations

19. **Cloud provider** — AWS Cape Town as the blueprint recommends, or does MLGRD prefer Azure (Zambian gov standard)? On-prem option for data sovereignty?
20. **Infrastructure budget** — What's the monthly cap? Blueprint estimates ~$500/mo at scale; can CEFANET commit to that? Is there donor funding (e.g., DFID, USAID, GIZ)?
21. **Domain ownership** — Who registers and owns `cefanet.org` (or `dnb.cefanet.org` etc.)? What about a `.gov.zm` subdomain — is that on the table?
22. **Email / SMS sending** — Who pays for transactional emails (AWS SES)? Africa's Talking SMS credits at ~K0.45/SMS — at ~1,000 SMS/month across 158 constituencies, who funds this?
23. **Support model post-launch** — Who handles "I can't log in" tickets? Is there a CEFANET helpdesk? Hours? Language?
24. **SLA expectations** — What uptime does MLGRD expect? 99%? 99.9%? Maintenance window allowed?
25. **Disaster recovery** — If the database is destroyed, how much data loss is tolerable (RPO)? How fast must we be back up (RTO)?
26. **Long-term ownership** — Year 3+: does CEFANET own and run this forever, or is it transferred to MLGRD? Open-source the code? Sustainability plan?

---

## Tier 5 — Pilot scope

27. **Which 5–10 constituencies?** — Blueprint mentions Lusaka Province. Confirmed which exact constituencies? What's the selection rationale (geographic spread, political balance, MP receptiveness)?
28. **Pilot timeline** — When does Sprint 1 actually start? Is the team hired? Hardware procured (laptops for field agents)?
29. **Definition of pilot success** — What metrics determine "ready to scale nationally"? Number of projects logged? % of WDCs actively using? Citizen feedback volume?
30. **Pilot evaluation method** — Who evaluates the pilot? CEFANET? An external M&E partner? When? What does failure mean — pause, pivot, or kill?

---

## Tier 6 — Security & privacy

31. **DPIA (Data Protection Impact Assessment)** — Has one been done? Who is the Data Protection Officer? Required before pilot under the 2021 Act.
32. **Phone number handling** — Storing phone numbers as plain text vs. HMAC hash (blueprint says hash). For SMS reply functionality we need plaintext temporarily — is that acceptable?
33. **Right to be forgotten** — Can a beneficiary request deletion of their records? How does that propagate to ICDFMIS / Local Authority records?
34. **Anti-corruption considerations** — Will the platform be used as evidence in PAC/AG investigations? Does that change retention requirements, immutability requirements?
35. **Whistleblower / anonymous reporting** — Does the SMS feedback channel allow truly anonymous tips? Phone numbers are traceable by carrier — is that disclosed in the UX?
36. **Penetration test budget** — Blueprint requires pen-test before pilot. Budgeted? Who performs (in-house, AfricaCERT, third party)?

---

## Tier 7 — MfDR (Pillar 2) specifics

37. **Indicator library** — What's the canonical list of CDF performance indicators? Does CEFANET have it, or do we need to derive from the MfDR framework documents?
38. **Indicator definitions** — For each indicator, who defines the formula, target value, frequency, data source? Can we get this in a structured form (spreadsheet)?
39. **Results-chain templates** — Are there existing templates for the Inputs → Outputs → Outcomes → Impact chains per project category (Infrastructure, Education, etc.), or do we co-design them?
40. **Quarterly synthesis report format** — Sample document available? What's the canonical structure CEFANET produces today?

---

## Tier 8 — Citizen Engagement (Pillar 3) specifics

41. **Community Scorecards** — Existing scorecard tool that CEFANET uses today? Excel template? Paper form? Sample available?
42. **Scorecard cadence** — How often do communities meet to score projects? Quarterly? Per project completion?
43. **SMS feedback handling workflow** — Who reads incoming SMS? Field agent? Admin? How fast must we respond? Auto-acknowledge?
44. **Sentiment classification** — Blueprint mentions sentiment on SMS feedback. Manual tagging acceptable for pilot, or do we need an ML classifier from day 1?
45. **Anonymisation of feedback** — Are SMS senders ever revealed? Under what circumstances (e.g., procurement fraud allegation)?

---

## Tier 9 — Open data & transparency commitments

46. **Open data publication** — Will aggregated CDF data be published as an open dataset (CKAN-style)? Update frequency?
47. **Embargo periods** — Is there an embargo before publication (e.g., MLGRD has 7 days to review)?
48. **Journalist / researcher access** — Will there be a separate API tier for researchers? Authentication mechanism?
49. **Civic-tech ecosystem** — Are there other Zambian civic-tech projects (BongoHive, CIPESA, OSF Africa) we should integrate with or learn from?

---

## Tier 10 — Engineering team & process

50. **Who's on the build team?** — Confirmed: 1 Tech Lead + 2 Full-stack + 1 UI/UX + 1 DevOps + 1 QA + 1 M&E SME (per blueprint). Hired? Contractors? In-house?
51. **Code ownership** — Public open-source (GPL? MIT?) or proprietary CEFANET? Affects licensing of dependencies.
52. **Version control & code review** — GitHub org confirmed? Mandatory code review? Branch protection?
53. **Decision authority** — Who is the product owner with final say on scope changes — CEFANET ED, M&E lead, or a joint MLGRD-CEFANET steering committee?
54. **Sprint cadence** — Two-week sprints (per blueprint)? Or align to MLGRD's reporting cycle (quarterly)?
55. **External code audit** — At which sprint does a third party (e.g., AfricaCERT) audit the code before national rollout?

---

## Tier 11 — Migration from the demo

Specific to moving from what was built for Thursday's demo to the production system:

56. **Do we keep the demo running** at `cefanet-2f71f.web.app` post-Thursday? Hand it to CEFANET as a sandbox? Tear it down?
57. **What demo data carries over** — anything? Or do we start with empty tables and import from real CDFC submissions?
58. **Mock auth → Cognito migration** — When is the cutover? Will demo accounts be invalidated, or do we map `admin@cefanet.org` → a real Cognito user?
59. **Lazy DB connection** — Demo uses a Proxy-based lazy connection. Should production use a connection pool (PgBouncer)? Connection limits per ECS task?
60. **Branding** — Logo, colour palette, typography, official CEFANET style guide. Available? Or to be designed in Sprint 1?

---

## How to use this list

- **Print or share** with leadership before the meeting so they can prepare
- **Don't ask all 60 in one session.** Group into 3–4 hour-long meetings: Legal+Mandate, Data+Integrations, Users+Operations, Engineering+Security
- **Flag every "I don't know"** as a sprint-0 task: someone owns finding the answer before Sprint 1 starts
- **Don't write a single line of production code** while Tier 1 questions are unanswered

The goal isn't to interrogate CEFANET — it's to surface the assumptions hidden inside the blueprint, so the production team isn't making them silently and getting them wrong.
