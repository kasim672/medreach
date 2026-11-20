# Test and CI results

## Isolation and commands

Node.js 24.15.0 and MongoDB 8.0.38. Each integration run started MongoDB inside an independent user/network namespace created with `unshare -Urn`, loopback only, using a new temporary directory. The backend suite used a standalone instance and a single-member replica set named `medreach-capacity-test`. The Playwright configuration requires an explicit `MEDREACH_E2E_MONGO_URI` containing a separate synthetic fixture. SMTP was disabled and assistant tests used the rule-based provider or local responses. The exposed local database and protected repository/recovery directories stayed outside the test boundary.

The following commands ran within those conditions, with a distinct Next.js output directory and an overridden local API URL during the builds.

```sh
npm run backend:test:db
node --test tests/unit/*.test.mjs
npm run lint
npm --workspace @medreach/backend run lint
npm run score
npm run build:variants
npm run test:e2e -- --reporter=list --project=bootstrap
npm run test:e2e -- --reporter=list --project=tailwind
npm run test:e2e -- --reporter=list --project=skeleton
npm run test:e2e -- --repeat-each=3 login-performance bootstrap-login-cleanup
npm run test:e2e -- --project=bootstrap diagnostic-requests bootstrap-provider-usability
npm run test:e2e -- --project=skeleton --grep='tracking needs only|ordinary bed signup|login gives immediate feedback|contains keyboard'
npm ci --ignore-scripts --no-audit
npm audit --json --audit-level=moderate
git diff --check
```

The clean dependency install ran in a temporary directory containing the current workspace manifests and lockfile. Next.js resolves PostCSS 8.5.28 through the existing override. `npm ls postcss --all` still labels that override invalid against Next.js’s upstream exact PostCSS pin. A clean install, runtime resolution, advisory audit and all three builds succeeded. The browser route sweep was a temporary Playwright spec using the route inventory and the existing seed. Results were persisted for the audit. Repo-level type checking has no separate command. All three production builds completed Next.js's lint and type-validity stage.

## Baseline and verification

| Check | Observed baseline | Observed after changes |
| --- | --- | --- |
| Shared unit tests | 28 passed | 30 passed, zero skipped |
| Frontend lint | 0 errors, 8 warnings | 0 errors, 5 warnings |
| Backend lint | 0 errors, 2 warnings | 0 errors, 2 warnings |
| Production builds | Bootstrap, Tailwind and Skeleton passed | Bootstrap, Tailwind and Skeleton passed |
| npm advisories | One affected package, three moderate advisories for Next.js | Registry returned zero known npm advisories for the corrected lockfile |
| Backend DB integration | Stopped after fixture replica-set name mismatch. Baseline partially ran | See detailed backend result below |
| Browser baseline | 381 passed, 1 failed, 32 skipped | See project results below |
| Mobile route smoke | 42 pages inventoried in each variant | 126 page instances rendered, no observed 5xx or page exceptions during the checks |

The backend lint warnings concern the existing Gemini error causes. The remaining frontend warnings concern affected hook dependencies in the existing blood-bank campaign pages and Bootstrap tracking. The risk scoring script ran and reported insufficient measured dimensions for a score.

### Backend DB verification

The first post-change run reached the diagnostic and tracking suites but hit MongoDB connection checkout timeouts while browser suites and builds were running. It was stopped after the test process failed to exit. The follow-up used a fresh namespace and a bounded MongoDB cache, and passed **680 tests with zero failures and zero skips**. All database gates were enabled.

### Browser verification

| Project | Initial broad run | Full follow-up before the final sign-in correction |
| --- | --- | --- |
| Bootstrap | 139 passed, 3 failed | 141 passed, 1 flaky case passed on retry, 0 skipped |
| Tailwind | 125 passed, 1 failed, 16 skipped | 126 passed, 0 failed, 16 skipped |
| Skeleton | 124 passed, 2 failed, 16 skipped | 126 passed, 0 failed, 16 skipped |

The initial Bootstrap run had two diagnostic receipt timeouts and a provider draft assertion racing its mocked response. The diagnostic and provider rerun passed all nine tests. The initial Tailwind and Skeleton runs used builds from before the final bed registration correction. Skeleton also timed out during reference-only tracking. All affected cases passed the focused reruns and the full follow-up.

The full follow-up's one flaky Bootstrap login assertion revealed an empty email state after a fast fill. The form now waits for client initialization before accepting input in all variants. This also prevents the server-rendered form from submitting before browser handlers are installed. The dedicated final login checks ran after this change. Bootstrap-only navbar, theme and demo checks account for the intentional skips.

The final sign-in regression run passed **12 checks per variant**, 36 in all, with no skips or failures. It repeats four tests three times, including disabled server-rendered fields, duplicate-submit protection, session reuse and the registration return path. All three production builds were rerun after the sign-in correction.

## GitHub Actions

Both workflow YAML files parsed with PyYAML. Static checks confirmed read-only contents permissions, pinned action SHAs and no `pull_request_target` trigger. Review included test and build coverage, fixture startup and cleanup, lockfile install, and failed browser artifact capture. `actionlint` and a local container runner were unavailable. The isolated local MongoDB 8.0.38 run exercised the same release line as the updated CI fixtures. Hosted service-image execution is recorded in the release results below.

During the baseline phase, hosted checks were read for commit `938f45b`. All ten returned checks completed successfully, including Critical Browser Journeys, Backend API Tests, lint and units, three builds, RWD scoring and three evaluation checks. The later release branch results are recorded separately below.

## Final verification after the sign-in correction

The final pass reused the isolated fixture approach. It provisioned fresh network namespaces and different temporary MongoDB data directories for the backend and each browser project. SMTP and third-party assistant services remained disabled. The backend run and the three browser runs were sequenced to avoid repeating the earlier database checkout timeouts. Test output and Playwright traces reside in the temporary audit directory.

Commands rerun for this pass included `npm run backend:test:db`, `node --test tests/unit/*.test.mjs`, `npm run lint`, `npm --workspace @medreach/backend run lint`, `npm run build:variants`, and `npm run test:e2e -- --project=<variant> --reporter=list --retries=1` separately for each variant. The browser projects include the final sign-in behavior and expanded response header checks. No browser spec was removed.

The five frontend warnings were fixed without disabling the hook rule. Campaign fetch callbacks now declare their filter dependencies. Bootstrap tracking now keys its callback to the account identity, matching the other variants. The two remaining backend warnings came from intentionally withholding raw Gemini errors that can carry a credential-bearing URL. The error now preserves only sanitized metadata as its cause. A single scoped lint directive documents the intentional decision to withhold the original exception.

Next.js 15.5.29 resolves PostCSS 8.5.28 with the existing override. An offline npm lockfile dry run reported it up to date, and the earlier clean-install and registry-audit results remain applicable to the identical lockfile. The npm dependency-tree diagnostic still compares the overridden version to Next.js's upstream 8.4.31 pin and reports `ELSPROBLEMS`. This pass preserved the override and added no package changes.

`actionlint` was unavailable. Both workflows parsed with PyYAML, all 13 action references used full commit SHAs, every shell step passed `bash -n` after substituting workflow expressions, permissions remained `contents: read`, and neither workflow used `pull_request_target`. These were static local checks. The release branch results below cover execution on GitHub.

The final isolated backend run passed 682 tests with every database gate enabled, zero failures and zero skips. Shared units passed 30/30 and both lint commands reported zero errors and zero warnings. All three production builds passed. The complete browser suites finished on the final sign-in implementation and expanded security checks.

| Browser project | Passed | Failed | Flaky | Skipped |
| --- | ---: | ---: | ---: | ---: |
| Bootstrap | 144 | 0 | 0 | 0 |
| Tailwind | 128 | 0 | 0 | 16 |
| Skeleton | 128 | 0 | 0 | 16 |

The 32 skips are the existing Bootstrap-specific cases. All three variants passed the frontend CSP, API CSP and caching checks, the pre-hydration sign-in regression, and the applicable role and request-isolation journeys.

## Release branch local verification

The release branch reran the complete suites after the role-matrix, applicant-rendering and Tailwind contrast changes. The backend passed **682** tests with all database gates enabled. Shared units passed **30** tests. Both lint commands returned zero errors and warnings. All production builds passed, including the Tailwind rebuild after the contrast correction.

| Browser project | Passed | Failed | Flaky | Skipped |
| --- | ---: | ---: | ---: | ---: |
| Bootstrap | 144 | 0 | 0 | 0 |
| Tailwind | 128 | 0 | 0 | 16 |
| Skeleton | 128 | 0 | 0 | 16 |

The skipped checks are Bootstrap-specific. The database suite confirmed synthetic backup and restore behavior and all three variants passed the new provider self-approval, applicant text-rendering and applicable contrast assertions. See [release verification](medreach-final-security-and-release-verification.md) for the hosted workflow evidence.

## Release branch hosted verification

Both hosted workflows completed successfully on `da630f3974b6fa347726da6b6facfa907c0ca307`, the exact audit code revision pushed to `codex/medreach-final-security-verification`. The CI workflow passed all seven jobs, including the MongoDB 8.0 backup-tool setup and full browser journeys. The hosted logs recorded 682 backend tests, 30 shared unit tests and 400 browser tests passed, with 32 Bootstrap-specific browser skips. The standalone build matrix and the three evaluation jobs also passed. GitHub applied Node 24 to the pinned v4 actions and reported a Node 20 deprecation warning. No browser failure artifacts were generated. [CI run](https://github.com/kasim672/medreach/actions/runs/44779699729) · [Evaluation run](https://github.com/kasim672/medreach/actions/runs/44779699736)
