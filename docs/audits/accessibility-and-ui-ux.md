# Accessibility and interface review

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the W3C Recommendation used as the target. The review used keyboard interaction, semantic form controls, assertions for focus and viewport sizing, and Chromium screenshots. The full desktop/tablet/mobile journey suite includes viewport and navigation checks. The additional 390-pixel route sweep visited each of 42 pages in each variant anonymously.

## Findings

| ID | Severity | Affected workflow | Change and evidence |
| --- | --- | --- | --- |
| UI-01 | Medium | Ambulance booking dialog in all variants | Replaced the generic modal container with a native modal, retained the variant-specific content and layout, kept focus inside, restored opener focus, and supported Escape. Test coverage exercises keyboard open, traversal and dismissal. |
| UI-02 | Medium | Urgent blood entry in all variants | Associated all ten visible field labels with their controls. The browser regression fills the form by accessible name and checks the recorded receipt. |
| UI-03 | Medium | Ordinary bed request in Tailwind and Skeleton | Registration now receives the same return destination as sign-in, including the hospital selection. Skeleton action text can wrap at narrow widths and its form grid uses compressible tracks. |
| UI-04 | Medium | Sign-in in all variants | A controlled input could lose an early entry before its React handler was attached. Fields wait for browser initialization. A regression checks the server-rendered form with JavaScript disabled. |
| UI-05 | Medium | Tailwind urgent-blood heading | Changed foreground contrast from 2.39:1 to 7.68:1 against the existing banner. The browser fixture verifies the computed white heading. Screenshots below predate this correction. |
| REL-01 | Medium | Ambulance, urgent blood and blood-bank request receipts | Session storage is optional. A confirmed request retains its private link when storage fails. Ambulance submissions also have an immediate duplicate guard while pending. |

## Evidence and scope

The anonymous smoke sweep recorded 126 HTTP 200 page responses, zero captured page exceptions, and zero observed local HTTP 5xx responses during the capture window. Several dynamic or protected routes still showed their loading shell at the moment of sampling. Role and lifecycle coverage comes from the separate browser and API suites. A 16-pixel overflow appeared on Skeleton's ordinary bed request before the button-wrap correction.

Mobile captures of the synthetic urgent-blood screen are available for [Bootstrap](evidence/bootstrap-urgent-blood-mobile.png), [Tailwind](evidence/tailwind-urgent-blood-mobile.png) and [Skeleton](evidence/skeleton-urgent-blood-mobile.png). The banner in these images indicates connectivity to the disposable API fixture. No actual patient record appears.

The three CSS frameworks and all variants' existing identity were preserved. Screen-reader sessions, page-by-page contrast measurements, complete keyboard interaction with maps and third-party widgets, and accessibility review by people using assistive technology remain outside this verification.
