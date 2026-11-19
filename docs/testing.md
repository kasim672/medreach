# MedReach Testing Guide & Verification Suite

This document outlines the testing architecture, quality assurance protocols, and execution commands for MedReach.

---

## 1. Testing Philosophy & Isolation Principles

MedReach follows a rigorous, multi-tiered testing strategy ensuring that healthcare routing, triage decisions, and security invariants function predictably across all three frontend variants (Bootstrap, Tailwind, Skeleton).

```text
┌────────────────────────────────────────────────────────┐
│                   Playwright E2E Tests                 │
│         Browser Journeys across 3 Frontend Variants    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              Backend Database Integration Tests        │
│          Mongoose Models, Services, RBAC, Auth         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                 Isolated Unit & Logic Tests            │
│         Pure Algorithms: Ranking, Distance, Filters    │
└────────────────────────────────────────────────────────┘
```

### Critical Safety Invariants
1. **Canonical Database Protection:** All integration and Playwright test suites must run against isolated disposable databases (e.g., `mongodb://127.0.0.1:27017/medreach_e2e`). **Tests must NEVER execute against the canonical operational dataset (`mongodb://127.0.0.1:27017/medreach`).**
2. **Mocked / Disabled SMTP:** During automated test runs, outbound SMTP delivery is intercepted or mocked. Test executions never send emails to real inboxes.
3. **Cross-Variant Parity:** Playwright journey tests execute parameterized test matrices that test identical flows across Bootstrap (port 3000), Tailwind (port 3001), and Skeleton (port 3002).

---

## 2. Test Execution Commands

### A. Run Database Integration & API Tests
Executes the comprehensive suite of 250+ backend integration tests covering models, services, RBAC enforcement, session management, and triage logic.

```bash
# Run all database integration tests against isolated test DB
npm run backend:test:db
```

### B. Run Backend Test Suite
Executes the backend test suites using the Node.js test runner.

```bash
npm run backend:test
```

### C. Run Core Library Tests
Tests the isomorphic `@medreach/core` package shared between backend and frontends.

```bash
npm --workspace @medreach/core test
```

### D. Run Playwright End-to-End (E2E) Browser Tests
Executes headless Chromium browser automation testing realistic user journeys.

```bash
# 1. Ensure Playwright browser dependencies are installed
npx playwright install --with-deps chromium

# 2. Run E2E test suite (spawns servers and test DB automatically)
MEDREACH_E2E_MONGO_URI=mongodb://127.0.0.1:27017/medreach_e2e \
MONGODB_URI=mongodb://127.0.0.1:27017/medreach_e2e \
AI_PROVIDER=rule_based \
npm run test:e2e
```

### E. Run Footer Reveal Animation Tests Specifically
Validates the oversized cobalt-blue typography animation, scroll progress tracking, edge-to-edge responsiveness, and lack of horizontal overflow across all three variants:

```bash
npx playwright test tests/e2e/footer-reveal.spec.js
```

### F. Static Analysis & Code Quality
Verifies code style, syntax correctness, and import integrity.

```bash
npm run lint
```

### G. Production Build Verification
Compiles Next.js production bundles for all three variants, confirming zero build errors, valid JSX/CSS, and consistent `BUILD_ID` generation.

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000 \
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY='' \
npm run build:variants
```

---

## 3. Test Coverage Matrix

| Test Suite | File Location | Key Capabilities Verified |
| :--- | :--- | :--- |
| **Authentication & Sessions** | `backend/test/auth.test.js`<br>`backend/test/authSecurity.mongo.test.js` | Bcrypt hashing (cost 12), JWT issuance, rotating refresh families, token reuse detection, session revocation. |
| **Hospital Directory & Geo** | `backend/test/hospitalAccess.test.js`<br>`backend/test/hospitalIdentity.test.js` | GeoJSON `2dsphere` distance sorting, text search, verified facility filters, slug generation. |
| **Emergency Bed Requisitions** | `backend/test/bedRequestLifecycle.mongo.test.js`<br>`backend/test/emergencyGuestWorkflow.test.js` | Emergency vs standard mode, idempotency deduplication, guest tracking tokens, staff triage transitions, expiry. |
| **Urgent Blood Requisitions** | `backend/test/urgentBloodFlow.test.js` | Blood group compatibility, 6-hour urgency window, donation pledges, provider assignment scoping. |
| **Ambulance Bookings** | `backend/test/ambulanceBooking.test.js`<br>`backend/test/ambulanceDirectory.test.js` | ALS/BLS capability tagging, emergency dispatch snapshotting, tracking token creation. |
| **Provider Administration** | `backend/test/onboarding.mongo.test.js`<br>`backend/test/manualProviderCredentials.mongo.test.js` | Organization assignment scoping, self-service application review, automatic credential provisioning. |
| **Role-Based Access Control** | `backend/test/roleRestructuring.mongo.test.js` | Multi-tenant query isolation, unauthorized access rejection, legacy role compatibility shims. |
| **Focused Pure Logic Tests** | `tests/unit/*.test.mjs` | Administrative state validations, complete hospital pagination, scroll math, and footer animation transforms. |
| **Footer Reveal Animation** | `tests/e2e/footer-reveal.spec.js` | Scroll-linked transform, oversized typography reveal, zero horizontal scrollbar overflow, WCAG contrast. |

---

## 4. Repeatable stress review

Start with the database-backed suite and all three browser projects. They cover
request transitions, cross-organisation access, duplicate submissions, competing
bookings, notification recovery, backup verification and mobile interactions.
Use `npm run backend:test:db` with isolated MongoDB fixtures and `npm run test:e2e`
with the `medreach_e2e` fixture after building the variants.

Run the sustained rehearsal against an empty isolated MongoDB database. It uses
two local API processes, six concurrent directory readers, concurrent inventory
updates and a synthetic worker. Database interruption takes place at the test
proxy. The fixture disables outbound email and uses no hosted services.

```bash
MEDREACH_SUSTAINED_MONGO_URI=mongodb://127.0.0.1:27017/medreach_sustained_reliability_test \
MEDREACH_SUSTAINED_SECONDS=120 \
npm --workspace @medreach/backend run rehearse:sustained
```

Keep the JSON report with the revision, fixture size, request counts, latency
percentiles and recovery outcomes. Local timings describe the fixture and host
where they were collected. Hosted capacity and live integration delivery need
separate evidence.

The 19 November 2026 rehearsal used 120 synthetic hospitals and 3,720
availability observations. Of 6,569 directory reads, 6,527 succeeded and 42
failed during planned interruptions. All 6,107 reads after recovery succeeded.
Successful reads measured 27.99 ms p50, 33.96 ms p95 and 38.26 ms p99. One of two
competing inventory edits committed and the other conflicted. The failed edit
during the database interruption persisted no change. The restarted worker
completed 100 jobs with 100 recorded effects, including the reclaimed job.

### Copy-ready review prompt

```text
Review the current MedReach revision without changing product features. Map each
finding to a concrete code path and an existing check or a focused regression
test. Run API, frontend, concurrency and recovery checks with synthetic fixtures
only. Verify accurate error states, no duplicate effects, and recovery after
the isolated failure ends. Record the revision, commands, observed metrics,
failures, retries and coverage gaps. Keep fixes small and evidence-driven.
```

## 5. Historical test evidence

The following counts were recorded in October 2026:

```text
✓ Backend Database Suites: 352 passing (0 failed, 0 skipped)
✓ Focused Unit Tests: 15 passing (0 failed, 0 skipped)
✓ Browser Journeys: 269 passed, 40 explicit Bootstrap-only scope skips
✓ Code Linter: 0 errors (12 existing hook dependency warnings)
✓ Next.js Build: 3/3 production variants compiled cleanly (39 static pages each)
```
