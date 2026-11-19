# Frontend parity scope

[Documentation](README.md) · [Project overview](../README.md)

Bootstrap is the reference for common product behavior. Each frontend retains
its own framework styles and components. Successful builds do not prove
identical interactions or isolate CSS as the only research variable.

## Shared workflows

Discovery/detail/maps; provider applications and approval; common login;
organisation-scoped provider administration; standard/emergency bed requests;
normal/urgent blood requests and blood donation; ambulance bookings; routine
and emergency diagnostic requests; published jobs and vacancy management;
reference tracking; user history and grounded assistant actions. Provider
workspaces include inventory and organisation-specific request management.

Directory searches use service-specific paginated reads. A preselected hospital
loads its option and, for ordinary requests, its verified bed inventory.
Emergency requests do not show numerical bed availability. Account navigation
follows the signed-in role, and sign-out requires confirmation.

Loading, true empty, failure and targeted Retry behavior must remain distinct.
The homepage and dashboard publish successful resources independently.

## Intentional differences

- Manual credential handover follows the existing backend policy in all three
  variants. The generated password is available for immediate handover only,
  and the browser tests check that it is not retained after navigation.
- Skeleton provides an additional career-tracking copy/manual-selection control.
- Bootstrap-specific navbar style and demo-video tests remain scoped to that
  variant. Shared navigation, footer and responsive journeys cover all three.
- Bootstrap aliases its local `_core`; the other variants use the workspace
  core. Homepage orchestration is deliberately shared.

## Verification ownership

[Release QA](release-qa.md) owns current counts, commands and limitations.
[Research plan](MedReach_Corrected_Plan.md) explains experimental confounds.
Historical crawler/build totals are not current test results.

Crawler execution, Google OAuth, in-app notification inboxes, User Admin pages
and `/admin/operations` are retired. Keep maps, email, provider approvals,
stored provenance and the main `/admin` dashboard.
