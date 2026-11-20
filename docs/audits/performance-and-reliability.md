# Performance and reliability

## Environment and method

Local Node.js 24.15.0, Chromium and MongoDB 8.0.38. The three Next.js apps were built in production mode. Browser traffic used synthetic records with no external maps or email dependencies. Measurement was on this machine without network or CPU throttling. Results are useful for regression triage and do not represent production users.

## Build output before and after

These are Next.js reported first-load JavaScript sizes. The baseline was Next.js 15.5.28 and the patched builds used 15.5.29. Values are rounded by Next.js.

| Route | Bootstrap | Tailwind | Skeleton |
| --- | --- | --- | --- |
| Shared first load | 103 → 103 kB | 103 → 103 kB | 103 → 103 kB |
| Homepage | 138 → 138 kB | 138 → 138 kB | 139 → 139 kB |
| Ambulances | 127 → 127 kB | 131 → 131 kB | 130 → 132 kB |
| Urgent blood | 114 → 114 kB | 113 → 113 kB | 113 → 113 kB |
| New bed request | 129 → 129 kB | 129 → 129 kB | 130 → 130 kB |

The shared dialog adds keyboard and receipt behaviour. The measured change on Skeleton's ambulance route is approximately 2 kB at the reported precision. The audit did not establish an application-wide performance regression or a repeatable loading bottleneck that justified a framework, cache or query rewrite.

## Mobile lab observations

One 390 × 844 Chromium navigation per page plus a screenshot. The values below are early LCP observations and accumulated layout shifts from the capture window. This was a warm local route sweep with other checks running.

| Variant | Home LCP / shifts | Ambulances LCP / shifts | Careers LCP / shifts | Urgent blood LCP / shifts |
| --- | --- | --- | --- | --- |
| Bootstrap | 764 ms / 0.000 | 112 ms / 0.010 | 144 ms / 0.000 | 120 ms / 0.000 |
| Tailwind | 920 ms / 0.035 | 248 ms / 0.040 | 136 ms / 0.035 | 108 ms / 0.035 |
| Skeleton | 744 ms / 0.030 | 96 ms / 0.037 | 140 ms / 0.030 | 88 ms / 0.030 |

There is no paired baseline mobile timing, field percentile or defensible INP estimate from this sample. Good Core Web Vitals targets are LCP at or below 2.5 seconds, INP below 200 milliseconds and CLS below 0.1. See [Google Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

## Loopback backend sample

Twelve sequential GETs per endpoint, excluding the first two warmups. Latency covers response body receipt. Payloads and timings use the local synthetic collection and do not support a before/after latency claim.

| Endpoint | Median | Maximum | Response bytes |
| --- | ---: | ---: | ---: |
| Readiness | 32.16 ms | 697.54 ms | 127 |
| Hospitals summary | 6.16 ms | 125.38 ms | 616 |
| Diagnostics summary | 4.31 ms | 5.75 ms | 757 |
| Blood-bank summary | 3.30 ms | 5.06 ms | 463 |
| Ambulance summary | 3.04 ms | 4.27 ms | 448 |
| Jobs summary | 10.05 ms | 17.60 ms | 514 |

The large readiness outlier warrants repeat measurement under controlled load. Readiness uses a live database check. The update marks liveness and readiness responses non-cacheable so an intermediary cannot serve an older success response as a new sample. Existing directory projections, paging, cache rules and inventory freshness policies stay in place. There was no database index or schema change.

## Reliability review

- HTTP handlers, worker recovery, deduplication, idempotency and replica-set transaction coverage were reviewed against their existing integration suites. Receipt UI now separates successful request creation from optional browser storage.
- The parallel local verification reproduced driver connection checkout timeouts in otherwise separate MongoDB instances. A fresh bounded-cache database run was used to distinguish infrastructure contention from deterministic application failures. See [verification results](test-and-ci-results.md).
- Remote provider availability, SMTP receipt, proxy caching and recovery objectives require controlled staging evidence. The local audit does not establish production SLOs.
