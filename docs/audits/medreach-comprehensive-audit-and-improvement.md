# MedReach project audit and improvement

20 November 2026 · Baseline `938f45b` on `main` · Local working changes

## Review outcome

MedReach has three Next.js frontends on Bootstrap, Tailwind CSS and Skeleton CSS. Each connects to one Express API that owns validation, authentication, organisation permissions, durable workflow state and audit outcomes. MongoDB stores the records. Separate expiry, notification and recovery worker roles support request transitions and email delivery. Discovery, care coordination, Careers, provider operations and account support have existing integration coverage.

The audit produced a source inventory for 42 public and protected page patterns in each variant, Express mount and method registrations, and 48 model modules. It reviewed the active `user`, `provider_admin` and `system_admin` boundaries alongside legacy compatibility. The route inventory explains which checks belong to the browser and which the API must enforce. [Architecture and route inventory](architecture-and-route-inventory.md)

## Improvements implemented

- Ambulance booking now contains keyboard focus and restores focus on dismissal. Pending submissions cannot be repeated by rapid input. A confirmed ambulance, blood bank or urgent blood request retains its receipt and private link if session storage is unavailable.
- Urgent-blood forms have programmatic control labels across all three variants. The ordinary bed-request sign-up preserves the selected hospital in Tailwind and Skeleton. Skeleton's long action labels and form sections fit narrow screens.
- Sign-in waits for the browser to initialize the form handlers, so early keystrokes are retained.
- Health checks explicitly disable caching, including when a dependency fails readiness.
- All three variants now use the patched Next.js 15.5.29 release and verified PostCSS 8.5.28 resolution. CI actions are pinned to upstream commit SHAs, backend lint is included, and the test database image is on the supported MongoDB 8.0 line.
- Destructive browser seeding validates an explicit loopback MedReach fixture before connecting. Request data, backups, schemas, environment files and research results were preserved.

## Page and workflow audit

All 126 anonymous route visits returned HTTP 200. During the capture window, no browser exceptions or local HTTP 5xx responses were observed. Some protected and dynamic route visits still displayed a loading shell when sampled. The sole measured width overflow at 390 px was Skeleton's new bed request, which was corrected and retested. The broad suite independently exercises roles, provider and member isolation, sign-in, request lifecycle, tracking, discovery, search, error recovery, and Careers on the applicable projects. This evidence does not demonstrate every role and state on every page. [Interface review and screenshots](accessibility-and-ui-ux.md), [test and CI results](test-and-ci-results.md)

## Security and back end

Compared the authority and data boundaries to ASVS 5.0.0, WSTG 4.2 and the OWASP API risks. The changes address confirmed supply-chain exposure, a destructive fixture safety gap and health-response reliability. Existing backend tests are the evidence for normal and denied permissions, input validation, session policy, state transitions and isolation. No production security testing, attack reproduction or real customer data use occurred. [Security assessment](security-assessment.md), [remediation register](remediation-register.md)

## Performance and code quality

Compared production first-load sizes before and after. Local 390 px browser samples and ten warmed requests per API endpoint give context for regression triage. Most reported route bundles stayed at the same rounded size. The audit established no field Core Web Vitals result, production API latency or need for speculative schema, cache or query changes. [Performance and reliability](performance-and-reliability.md)

Optional storage writes across three request flows and native modal handling were consolidated behind small shared modules. Existing provider and patient requests retain their APIs and database relationships. The three framework packages and visual identities remain. The working diff updates 32 existing files and adds the report set, evidence, narrowly scoped helpers and a fixture safety test. No feature or source file was intentionally removed. Next.js was updated in place and the existing PostCSS override was preserved.

### Workspace inventory

| Category | Lines before | Lines after | MiB before | MiB after |
| --- | ---: | ---: | ---: | ---: |
| Application/config/assets | 65,905 | 65,995 | 22.1 | 22.1 |
| Caches | 5 | 5 | 4,468.3 | 4,057.7 |
| Dependencies | 3,700,567 | 3,700,623 | 467.9 | 467.9 |
| Documentation | 5,882 | 6,438 | 9.2 | 9.5 |
| Generated/build | 1,456,137 | 1,429,744 | 391.6 | 369.5 |
| Local tool metadata | 879,852 | 879,852 | 103.4 | 103.4 |
| Research/evaluation | 949,915 | 949,915 | 39.1 | 39.1 |
| Tests | 15,454 | 15,584 | 1.0 | 1.0 |
| Total measured | 7,073,717 | 7,048,156 | 5,502.6 | 5,070.2 |

The line counts are physical newline counts for recognized text file extensions. They include test fixtures and checked-in or local generated text where categorized, rather than measuring only authored logical statements. Bytes are file lengths, without Git object storage or symlink targets. Protected data, recovery directories, environment files and private notes were excluded. Generated and cache totals include pre-existing local output. The temporary Next.js build directories created solely for this audit were removed after verification.

## Readiness and remaining work

This revision improves the existing application without a schema migration, role expansion or frontend rewrite. Before a production readiness decision, verify hosted CI, TLS and proxy policy, least-privilege database accounts, MFA and account recovery with the intended policy, alert ownership, an isolated backup restoration, external email receipt and full assistive-technology journeys. The current synthetic observations cannot establish those conditions.

No commit, push, merge or deployment was performed.
