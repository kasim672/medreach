# MedReach final security and release verification

## 1. Overall status

Baseline commit `938f45b`. This release review includes the prior local audit changes and the dedicated follow-up authorization and browser rendering checks. Production readiness requires a separate decision based on the remaining deployment, recovery and security evidence. [Comprehensive audit](medreach-comprehensive-audit-and-improvement.md) · [Remediation register](remediation-register.md)

## 2. Security testing

The review uses [ASVS 5.0.0](https://asvs.owasp.org/), [WSTG stable 4.2](https://wstg.owasp.org/v4.2/), [OWASP Top 10 2025](https://top10.owasp.org/), [OWASP API Security Top 10 2023](https://owasp.org/www-project-api-security/), and the [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/). The development edition of WSTG is separate from the stable guidance. Tests use synthetic fixtures in disposable network namespaces without external application traffic.

| Category | Endpoint or code | Method and result | Severity and remediation | Regression and residual risk |
| --- | --- | --- | --- | --- |
| SQL injection | Runtime manifests, Express and Mongoose persistence | **Not applicable.** The reviewed application has no SQL client, query builder or SQL data-access layer. | None applicable. | Reassess if a SQL integration is introduced. |
| MongoDB input and query validation | `GET /api/hospitals`, `/api/jobs`, `/api/alerts`, `/api/blood-requests` and `/api/diagnostics/requests`; login and diagnostic writes | Existing defensive malformed-input, typed-filter and authorization regressions. The diagnostic suite uses a real disposable database. | Existing input shape guards, route schemas, explicitly constructed filters and organisation scoping retained. | `securityHardening.test.js`, `authInputTypes.test.js`, `inputShape.test.js` and `diagnosticRequests.test.js`. Arbitrary aggregation and update-operator probes remain **Not tested**. |
| Browser content and XSS | Staff applicant UI at `/hospital/jobs` | Existing legacy link policy and browser tests. An inert angle-bracket marker in the applicant name must render as text and produce no element. | Existing React text rendering and URL restrictions retained. | `security-hardening.spec.js`. Dedicated reflected, stored and DOM exploit probes remain **Not tested**. |
| CSRF policy | `backend/src/middleware/security.js`, synthetic `POST /health/live` | Defensive policy regression verifies allowed, denied, missing Origin and Fetch Metadata conditions. | SEC-05 hardens cookie-bearing same-site and cross-site mutations lacking an allowlisted Origin. | `app.test.js`. Headerless compatibility remains. Per-operation forged browser requests and hosted proxy behavior remain **Not tested**. |
| SSRF and external integrations | `GET /api/routing/hospital/:id`, routing and provider adapters, `POST /api/webhooks/resend` | Reviewed configured destinations, coordinate validation, timeouts and webhook signature validation. Existing local delivery regressions cover valid and rejected events. | No new confirmed issue on the reviewed paths. | Dedicated destination, DNS, redirect and rebinding probes remain **Not tested**. |
| Traversal, file handling and execution | Résumé validator, applicant UI and maintenance scripts | Existing résumé policy and browser fixture coverage. Reviewed argument-array process invocation and local fixture boundaries. | No new confirmed issue on those reviewed paths. | Dedicated traversal, upload-parser evasion, command and template probes remain **Not tested**. |
| Dependency and CI supply chain | Workspace lockfile and both GitHub workflows | Dependency advisory query returned zero vulnerabilities. Static workflow review checked action SHAs, permissions and triggers. | Maintains Next.js 15.5.29 and pinned actions. | Private advisories and transitive workflow action behavior remain outside the observed dependency graph. |

See the [security assessment](security-assessment.md) for exact covered validation categories, response headers, auth policies and the residual missing-Origin risk. This review does not establish penetration-test coverage of all endpoints.

## 3. Authentication and authorization

| Direct API operation | Allowed case | Denied or limited case |
| --- | --- | --- |
| `GET /api/admin/users?roleGroup=system_admin` | System Admin receives a scoped, credential-free list. | Anonymous client gets 401. User and Provider Admin get 403. |
| `GET /api/providers/mine` and `GET /api/providers/hospital/:id/report` | Provider Admin sees both assigned fixture organisations and can read the assigned hospital report. | Unassigned diagnostic and ambulance reports return 403. |
| `POST /api/admin/provider-approvals/organizations/hospital/:id/approve` | Existing System Admin onboarding and approval workflows cover the permitted role. | Provider Admin receives 403 even for the assigned hospital. |
| `PATCH /api/admin/resources/:id` and `PATCH /api/ambulances/bookings/:id/status` | Role and assignment rules remain enforced by the API. | Provider Admin cannot change a foreign provider's contact record or booking. |
| `GET /api/emergency-requests/:id` and `GET /api/ambulances/bookings/:reference` | Submitter and appropriately authorized staff workflows use private request details. | A different user cannot read the private bed record. |
| `GET /api/tracking/:type/:reference` and private diagnostic request endpoints | Public references return a limited status projection. Subject and assigned-provider fixtures exercise private reads and updates. | Public tracking excludes patient details. An unrelated provider cannot list, read or change someone else's diagnostic request. |

This matrix combines direct Supertest and Playwright API assertions. It covers representative boundaries and is not an exhaustive endpoint-by-role-by-state authorization proof.

## 4. Frontend results

Bootstrap remains the reference. Tailwind and Skeleton retain their own CSS frameworks. The full browser suites exercise the final sign-in implementation, onboarding, role dashboards, request and career lifecycles, private tracking, responsive layouts and security headers. The earlier 42-route-per-variant browser inventory remains the route inventory evidence, not a new claim that every state on every page was observed. [Page inventory](architecture-and-route-inventory.md) · [Screenshots and accessibility](accessibility-and-ui-ux.md)

## 5. Backend and database results

The complete MongoDB-gated suite runs against a disposable standalone database and a separate single-member replica set. It includes transactional capacity, version races, idempotency, scoped writes, relationship integrity, migration guards and local backup creation, verification and restoration with synthetic records. The isolated restore regressions verified BSON content, indexes, refusal of a populated destination and encrypted retained-backup recovery. Production recovery tooling, credentials, elapsed recovery targets and live data remain outside this verification.

## 6. Performance and accessibility

The prior audit measured Chromium on a 390 × 844 local viewport and measured loopback directory response latency. Those samples remain local synthetic evidence. No production Core Web Vitals or INP percentile was measured in this release pass. The latest production builds report 103 kB common first-load JavaScript for each variant. Bootstrap, Tailwind and Skeleton report 121, 122 and 122 kB respectively for sign-in, and 127, 131 and 132 kB for the ambulance directory. These are rounded Next.js build estimates. The browser suites include mobile viewport and keyboard focus regressions. Tailwind’s urgent-blood heading inherited a dark heading color over a dark-red banner because the global heading rule outranked the utility. The CSS color pair measured 2.39:1 before and 7.68:1 with the corrected white heading. Browser coverage checks the computed heading color. The screenshots linked in the earlier report show the pre-correction palette. Ten warm loopback requests per synthetic endpoint produced median response times of 4.79 ms for readiness, 3.23 ms for hospitals, 1.74 ms for diagnostics, 1.53 ms for blood banks, 1.81 ms for ambulances and 2.69 ms for jobs. Tests used Node.js 24.15.0 and a disposable MongoDB 8.0.38 instance on the same machine. There was no network throttling or representative production dataset. Full screen-reader and zoom coverage remains outstanding. [Measurement conditions and earlier values](performance-and-reliability.md)

## 7. Dependency and infrastructure security

The PostCSS override stays at 8.5.28. Next.js resolves that version even though npm's dependency-tree diagnostic compares it against the upstream exact 8.4.31 pin. The prior clean-install evidence applies to the unchanged lockfile. Static GitHub validation checked PyYAML parsing, shell syntax, full-length action pins, read-only contents permission and absence of `pull_request_target`. Only `gh`, repository tests and the basic local validation tools were available among the inspected tool classes. Actionlint, Semgrep, CodeQL, Gitleaks and ZAP were unavailable.

The previous redacted Git-history pattern scan applies to the same ancestor history. The staged path and credential-pattern review found one match in `tests/unit/e2e-database-target.test.mjs`, a deliberate fake connection-string fixture. The three staged PNGs depict blank synthetic forms. No secret values were printed. No cloud secret, database account or production CI configuration was used for runtime security testing.

## 8. Test commands and results

- `npm run backend:test:db` in a new namespace with standalone and replica-set fixtures.
- `node --test tests/unit/*.test.mjs`.
- `npm run lint` and `npm --workspace @medreach/backend run lint`.
- `npm run build:variants` with an isolated Next.js output directory and the local API URL. Tailwind was rebuilt with `npm --workspace @medreach/variant-tailwind run build` after the contrast correction.
- `npm run test:e2e -- --project=<bootstrap|tailwind|skeleton> --reporter=list --retries=1` independently per variant in disposable namespaces.
- `npm audit --json --audit-level=high` and `npm run score`. The scoring script requires measured research dimensions for a grade.
- `git diff --check` plus workflow structure and shell validation. Next.js checks types during the builds. There is no separate repository-wide type-check script.

| Local gate | Result |
| --- | --- |
| MongoDB-gated backend and integration | 682 passed, zero failed or skipped |
| Shared units | 30 passed |
| Bootstrap browser | 144 passed, zero failures or skips |
| Tailwind browser | 128 passed, zero failures, 16 Bootstrap-specific skips |
| Skeleton browser | 128 passed, zero failures, 16 Bootstrap-specific skips |
| Lint and builds | Zero lint warnings or errors, three successful production builds |
| Dependency audit | Zero known advisories returned for the current lockfile |

Local and hosted result totals are recorded separately. [Test and CI details](test-and-ci-results.md)

## 9. GitHub publication

Target [kasim672/medreach](https://github.com/kasim672/medreach), branch `codex/medreach-final-security-verification`. Only the audited work and supporting evidence are included in scope. Both CI workflows explicitly accept pushes to this branch. [Branch workflow history](https://github.com/kasim672/medreach/actions?query=branch%3Acodex%2Fmedreach-final-security-verification)

## 10. Outstanding risks

- Dedicated exploit-focused probes listed as **Not tested** need a separate authorized assessment. The current evidence supports the stated defensive behaviors only.
- Before production adoption, verify hosted TLS, proxy header handling, cookie settings and database service-account privileges. Frontend CSP has frame, object, base and form directives. Deployment-specific script-source restrictions still require maps and integration compatibility checks.
- Verify live email and alert delivery and perform a timed restoration drill in an explicitly isolated staging environment. Existing recovery backups and real databases remain preserved.
- Screen-reader testing, production latency measurement and production monitoring remain separate release responsibilities.
