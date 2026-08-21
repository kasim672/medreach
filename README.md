# MedReach — Empirical Security Evaluation of RWD Frameworks

A controlled testbed and empirical study that **fulfils the stated limitations and future work** of:

> F. Almeida and C. Sousa, *"Security Risks in Responsive Web Design Frameworks,"* **Digital** 2026, 6(1), 26. https://doi.org/10.3390/digital6010026

The paper is a **qualitative** Y/N/P risk analysis of five RWD frameworks. It explicitly states (its §6.3) that it does **not** provide empirical testing, excludes **reactive-component frameworks** and **backend integration**, and lists **penetration testing, CSS-only attacks, and supply-chain attacks** as future work. This project delivers exactly those, with **14/14 executed, passing checks**.

## Repository layout

```
Medreach/
├── backend/                 Shared Express + MongoDB API (the single independent variable control)
│   ├── src/                 models, routes, controllers, middleware (JWT, RBAC, rate-limit, helmet CSP)
│   └── tests/               7 integration tests (auth, RBAC, headers, NoSQL-injection) — all pass
├── evaluation/
│   ├── scans/               npm audit + retire.js findings (consolidated-scan-findings.json)
│   ├── pentest/             Bootstrap CVE-2019-8331 executed verification + manual harness
│   ├── css-exfil-poc/       CSS-ONLY exfiltration PoC (no JavaScript) + collector + executed test
│   └── supply-chain-poc/    compromised build-dependency PoC + executed test
├── react-component-arm/     Reactive-framework (React) XSS comparison — Limitation 2
├── report/
│   └── EMPIRICAL-FINDINGS-REPORT.md   <-- START HERE: full mapping to paper Table 5 & §6.3
├── variants/                Frontend UI variants (same routes/API, CSS framework = only variable)
│   ├── bootstrap/           Bootstrap 5 — BUILT, `next build` passes (5 routes)
│   ├── tailwind/            Tailwind CSS 4 — scaffold (style-swap of reference)
│   └── skeleton/            Skeleton CSS — scaffold (style-swap; needs shared JS layer)
├── digital-06-00026.pdf     the source paper
└── MedReach_Project_Scope.txt / scope.txt   original project briefs
```

## Headline findings

- **F1 (tooling):** `npm audit` reported 0 vulns for *every* framework including the vulnerable Bootstrap 4.1.3; only signature-based `retire.js` caught CVE-2019-8331 (jQuery 1.12.4 positive control confirms the scanner works). Dependency-graph auditing alone is insufficient.
- **CVE-2019-8331 version boundary** pinned to the 4.3.1 sanitizer addition (sanitizer tokens: 0 → 10 → 19 across 4.1.3 / 4.6.0 / 5.3.3).
- **CSS-only exfiltration executed:** attribute selectors leaked a secret's character to a collector with zero JavaScript — defeats "no JS ⇒ no theft" and script-src-only CSP assumptions.
- **Supply-chain build-poisoning executed:** a malicious build plugin ran and tampered with the shipped CSS; static-CSS frameworks (Bootstrap/Skeleton) have no equivalent vector.
- **React (Limitation 2):** XSS is safe-by-default (JSX auto-escaping); risk returns only via the explicit `dangerouslySetInnerHTML` opt-out.

## Reproduce everything

```bash
cd backend && npm install && node --test tests/*.test.js                    # 7 pass
cd evaluation && npm install && node --test pentest/bootstrap-xss-executed.test.js   # 2 pass
cd evaluation && node --test css-exfil-poc/exfil-verify.test.js             # 1 pass
cd evaluation && node --test supply-chain-poc/supply-chain.test.js          # 2 pass
cd react-component-arm && npm install && node --test react-xss.test.js      # 2 pass
```

Environment: Node v24.19.0. All checks executed & passing 2026-08-19.

## Scope honesty

This delivers the **security** thesis end-to-end, plus a **working Bootstrap 5 frontend** (`variants/bootstrap/`, `next build` passes, 5 routes wired to the backend). The Tailwind and Skeleton variants are scaffolded as documented style-swaps against the identical component contract (`variants/README.md`), and the N=30 usability study from the original scope remains future work (usability axis). PoCs were verified via jsdom + source analysis; a headless-browser re-run (Playwright) is the recommended next validation step. See `report/EMPIRICAL-FINDINGS-REPORT.md` §8 for full threats-to-validity.
