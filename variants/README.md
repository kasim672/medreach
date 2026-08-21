# MedReach Frontend Variants

Three framework variants of the **same** application. Per `MedReach_Corrected_Plan.md` §6,
they share an **identical component contract** and an **identical backend API client**
(`lib/api.js`) so that the **CSS framework is the only independent variable**.

| Variant | Status | Framework | Notes |
|---|---|---|---|
| `bootstrap/` | **Built + compiles** (`next build` ✓, 5 routes) | Bootstrap 5.3.3 | Reference implementation |
| `tailwind/` | Scaffold | Tailwind CSS 4 | Style-swap of the reference; see parity rules below |
| `skeleton/` | Scaffold | Skeleton CSS | Style-swap; needs a shared JS interaction layer (Skeleton ships no JS) |

## Component contract (identical across all three)

Every variant implements exactly these routes with the same data flow and the same
`lib/api.js` calls — only markup/classes differ:

- `/` — hospital search (labelled input, `aria-live` results, semantic card list)
- `/hospitals/[id]` — hospital detail (emergency call button, status, beds)
- `/login` — auth form (label/`htmlFor`, `aria-describedby` error linkage, `role="alert"`)
- `/admin` — admin dashboard (backend-enforced RBAC; UI only reflects it)

## Parity rules (the confound the plan §6 warns about)

1. **Hold the JS interaction layer constant.** Tailwind and Skeleton ship no JS
   components. Any modal/dropdown JS added to them must be the *same* (same headless
   lib or same hand-rolled component) so we are not accidentally measuring our own glue code.
2. **Name the variable precisely:** it is *"the framework's bundled component/JS
   philosophy"*, not "CSS". Markup differences (semantic classes vs. utility soup vs.
   minimal) are intrinsic to the comparison — acknowledged, not hidden.
3. **Never change `lib/api.js`, the routes, or the backend between variants.**

## Build / run (Bootstrap reference)

```bash
cd bootstrap && npm install && npm run build   # ✓ compiles, 5 routes
npm run dev                                     # http://localhost:3000 (needs backend on :4000)
```

## DevSecOps note (recorded for the study)

`next build` on the reference variant surfaced **2 npm-audit vulnerabilities (1 critical,
1 high)** in `next` and `postcss` — the latter directly relevant to the Tailwind
build-pipeline supply-chain axis. See `../evaluation/scans/frontend-npm-audit-summary.txt`.
