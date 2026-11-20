# Remediation register

| Priority | Items | Status and decision |
| --- | --- | --- |
| Immediate protection | SEC-01 through SEC-03 | Patch framework dependencies, pin workflow actions and fence the destructive browser fixture. No application permission or database schema change. |
| Runtime and usability | UI-01 through UI-04, REL-01 | Preserve keyboard navigation, accessible labels, registration context and confirmed request receipts across variants. |
| Runtime health | REL-02 | Add `Cache-Control: no-store` to liveness and readiness routes, including failed readiness. Keep body, HTTP status and routes intact. |
| CI maintenance | SEC-04 | The hosted [Backend API Tests job](https://github.com/kasim672/medreach/actions/runs/44779699729/job/136438791786) passed with disposable MongoDB 8.0 standalone and replica-set fixtures and the backup tools. |
| Cookie-origin policy | SEC-05 | Reject originless same-site and cross-site cookie mutations when Fetch Metadata identifies the request. [Middleware verification and scope](security-assessment.md#sec-05--cookie-authenticated-mutations-without-origin) |
| Operational verification | Outstanding | Verify hosted proxy and response headers, least-privilege database users, secrets management, alert delivery and an isolated restore drill with recorded recovery targets. |
| Accessibility completion | Outstanding | Run representative screen-reader journeys, contrast and zoom checks and review maps, tables and error announcements. |
| Performance | Outstanding | Capture repeatable throttled browser runs and real-user field metrics if and when authorized. Profile representative directory cardinalities before changing indexes or cache policy. |
| Compatibility | Deferred | A Next.js major upgrade, stricter script CSP, schema migration, frontend rewrite and privilege-policy redesign lack current justification or need independent verification. |
