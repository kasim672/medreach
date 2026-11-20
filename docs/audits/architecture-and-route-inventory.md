# Architecture and route inventory

Snapshot at baseline commit `938f45b`. The inventory reflects registrations in source. It does not establish authorization or exercise a workflow.

## System map

Each Next.js variant renders its own routes and framework styles. Tailwind and Skeleton share workflow adapters in `variants/shared`. Bootstrap resolves a bundled core mirror while the other variants use the workspace core. The browser calls Express over HTTP. Express owns validation, authentication, organisation scoping, persistence and audit events. Mongoose stores records in MongoDB. Notification, expiry and recovery workers operate independently of the UI.

| Active role | Intended scope |
| --- | --- |
| `user` | Public discovery, own account, own requests and career applications |
| `provider_admin` | Active membership and assigned organisation workflows |
| `system_admin` | Platform management, approvals, audit and explicit operational controls |

Existing legacy-role compatibility is documented in [Architecture](../architecture.md). Private guest links use scoped credentials distinct from authenticated account access.

## Workflow and integration map

| Area | Entry points and dependencies |
| --- | --- |
| Identity | Registration, sign-in, email verification, password recovery, sessions and conditionally configured MFA |
| Discovery | MongoDB directories, public summaries, freshness evidence, maps and route estimates |
| Care | Hospital triage and ordinary bed requests, blood requests and donation, diagnostics, ambulance transport and private tracking |
| Careers | Provider roles, applicant review, general expressions of interest and status tracking |
| Provider operations | Approvals, memberships, inventory, CSV staging, diagnostic quotas and scoped reports |
| Notifications | SMTP/Resend adapter, webhook verification, stored delivery outcomes, retry and recovery workers |
| Infrastructure | Vercel variants, Azure service configuration, MongoDB, GitHub Actions, isolated Playwright |
| Optional services | Maps/routing, configured AI providers and signed integration credentials |

## Next.js pages

| Route | Bootstrap | Tailwind | Skeleton |
| --- | --- | --- | --- |
| `/` | Yes | Yes | Yes |
| `/activate-provider` | Yes | Yes | Yes |
| `/admin` | Yes | Yes | Yes |
| `/admin/alerts` | Yes | Yes | Yes |
| `/admin/audit` | Yes | Yes | Yes |
| `/admin/emergency` | Yes | Yes | Yes |
| `/admin/hospitals` | Yes | Yes | Yes |
| `/admin/provider-accounts` | Yes | Yes | Yes |
| `/admin/provider-approvals` | Yes | Yes | Yes |
| `/admin/security` | Yes | Yes | Yes |
| `/admin/system-admins` | Yes | Yes | Yes |
| `/admin/users` | Yes | Yes | Yes |
| `/admin/verification` | Yes | Yes | Yes |
| `/ambulances` | Yes | Yes | Yes |
| `/blood-banks` | Yes | Yes | Yes |
| `/careers` | Yes | Yes | Yes |
| `/dashboard` | Yes | Yes | Yes |
| `/diagnostics` | Yes | Yes | Yes |
| `/diagnostics/request` | Yes | Yes | Yes |
| `/emergency` | Yes | Yes | Yes |
| `/forgot-password` | Yes | Yes | Yes |
| `/hospital` | Yes | Yes | Yes |
| `/hospital/jobs` | Yes | Yes | Yes |
| `/hospitals` | Yes | Yes | Yes |
| `/hospitals/[slug]` | Yes | Yes | Yes |
| `/jobs/[id]` | Yes | Yes | Yes |
| `/login` | Yes | Yes | Yes |
| `/map` | Yes | Yes | Yes |
| `/profile` | Yes | Yes | Yes |
| `/provider` | Yes | Yes | Yes |
| `/provider/inventory` | Yes | Yes | Yes |
| `/provider/jobs` | Yes | Yes | Yes |
| `/provider/register` | Yes | Yes | Yes |
| `/register` | Yes | Yes | Yes |
| `/requests` | Yes | Yes | Yes |
| `/requests/[id]` | Yes | Yes | Yes |
| `/requests/new` | Yes | Yes | Yes |
| `/reset-password` | Yes | Yes | Yes |
| `/track` | Yes | Yes | Yes |
| `/urgent-blood` | Yes | Yes | Yes |
| `/verify-email` | Yes | Yes | Yes |
| `/verify-notification-email` | Yes | Yes | Yes |

## Express mounts

| Mount | Handler |
| --- | --- |
| `/api/webhooks/resend` | `resendWebhookRouter` |
| `/health` | `healthRouter` |
| `/api/auth` | `authRoutes` |
| `/api/hospitals` | `hospitalRoutes` |
| `/api/admin/hospital-enrichment` | `hospitalEnrichmentRouter` |
| `/api/admin/backend-metrics` | `backendMetricsRouter` |
| `/api/hospitals` | `availabilityRoutes` |
| `/api/inventory` | `inventoryRouter` |
| `/api/capacity` | `capacityRouter` |
| `/api/provider-imports` | `inventoryImportsRouter` |
| `/api/privacy` | `privacyRouter` |
| `/api/integrations` | `integrationsRouter` |
| `/api/contracts` | `contractsRouter` |
| `/api/provider-adoption` | `providerAdoptionRouter` |
| `/api/admin/provider-accounts` | `providerAccountRouter` |
| `/api/admin/provider-approvals` | `providerApprovalRouter` |
| `/api/providers` | `providerRouter` |
| `/api/admin` | `adminRoutes` |
| `/api/alerts` | `alertRoutes` |
| `/api/users` | `userRoutes` |
| `/api/assistant` | `assistantRoutes` |
| `/api/hospital-admin` | `hospitalAdminRoutes` |
| `/api/emergency-requests` | `emergencyRequestRoutes` |
| `/api/emergency-coordination` | `emergencyCoordinationRouter` |
| `/api/admin/backend` | `backendOperationsRouter` |
| `/api/tracking` | `trackingRouter` |
| `/api/blood-banks/campaigns` | `bloodCampaignRoutes` |
| `/api/blood-campaigns` | `bloodCampaignRoutes` |
| `/api/blood-requests` | `bloodRequestRoutes` |
| `/api/blood-banks` | `resourceRouter("blood_bank")` |
| `/api/diagnostics` | `resourceRouter("diagnostic")` |
| `/api/ambulances` | `resourceRouter("ambulance")` |
| `/api/admin/resources` | `resourceAdminRouter` |
| `/api/jobs` | `jobsRouter` |
| `/api/applications` | `applicationsRouter` |
| `/api/organizations` | `organizationCareersRouter` |
| `/api/organization-applications` | `orgApplicationsRouter` |
| `/api/routing` | `routingRouter` |
| `/api/analytics` | `analyticsRouter` |
| `/api/email` | `emailRouter` |
| `/api/admin/refinement` | `refinementRouter` |

## Router methods

Paths in this table are relative to the Express mounts above. Multiple router exports in a file are identified by the router variable. Routes built by helper functions should be checked against their source.

| Module | Router | Method | Relative path |
| --- | --- | --- | --- |
| `admin.js` | `router` | PATCH | `/users/:id/notifications` |
| `admin.js` | `router` | GET | `/users` |
| `admin.js` | `router` | GET | `/users/:id` |
| `admin.js` | `router` | PATCH | `/users/:id/status` |
| `admin.js` | `router` | PATCH | `/users/:id/role` |
| `admin.js` | `router` | POST | `/users/:id/revoke-sessions` |
| `admin.js` | `router` | POST | `/users/:id/trigger-reset` |
| `admin.js` | `router` | POST | `/users/:id/resend-verification` |
| `admin.js` | `router` | GET | `/ownership-claims` |
| `admin.js` | `router` | POST | `/ownership-claims/:id/review` |
| `admin.js` | `router` | GET | `/hospitals` |
| `admin.js` | `router` | GET | `/overview` |
| `admin.js` | `router` | POST | `/hospitals/:id/verify` |
| `admin.js` | `router` | GET | `/audit` |
| `admin.js` | `router` | GET | `/facility-claims` |
| `admin.js` | `router` | GET | `/data-conflicts` |
| `admin.js` | `router` | GET | `/hospital-field-claims` |
| `admin.js` | `router` | GET | `/hospital-field-conflicts` |
| `admin.js` | `router` | POST | `/facility-claims/:id/review` |
| `admin.js` | `router` | POST | `/hospital-field-claims/:id/review` |
| `alertRoutes.js` | `router` | GET | `/` |
| `alertRoutes.js` | `router` | POST | `/` |
| `alertRoutes.js` | `router` | PATCH | `/:id/deactivate` |
| `analytics.js` | `router` | GET | `/overview` |
| `assistantRoutes.js` | `router` | POST | `/message` |
| `authRoutes.js` | `router` | POST | `/register` |
| `authRoutes.js` | `router` | POST | `/login` |
| `authRoutes.js` | `router` | GET | `/mfa` |
| `authRoutes.js` | `router` | POST | `/mfa/enroll` |
| `authRoutes.js` | `router` | POST | `/mfa/confirm` |
| `authRoutes.js` | `router` | POST | `/mfa/recovery-codes` |
| `authRoutes.js` | `router` | POST | `/reauthenticate` |
| `authRoutes.js` | `router` | POST | `/refresh` |
| `authRoutes.js` | `router` | POST | `/logout` |
| `authRoutes.js` | `router` | GET | `/me` |
| `authRoutes.js` | `router` | GET | `/sessions` |
| `authRoutes.js` | `router` | DELETE | `/sessions/:id` |
| `authRoutes.js` | `router` | POST | `/forgot-password` |
| `authRoutes.js` | `router` | POST | `/reset-password` |
| `authRoutes.js` | `router` | POST | `/request-verification` |
| `authRoutes.js` | `router` | POST | `/verify-email` |
| `authRoutes.js` | `router` | PUT | `/profile` |
| `authRoutes.js` | `router` | PUT | `/password` |
| `authRoutes.js` | `router` | POST | `/activate-provider` |
| `authRoutes.js` | `router` | POST | `/verify-notification-email` |
| `availability.js` | `router` | GET | `/:id/facilities` |
| `availability.js` | `router` | GET | `/:id/availability` |
| `availability.js` | `router` | POST | `/:id/availability` |
| `backendMetrics.js` | `router` | GET | `/` |
| `backendOperations.js` | `router` | GET | `/coverage` |
| `backendOperations.js` | `router` | PUT | `/coverage` |
| `backendOperations.js` | `router` | GET | `/health` |
| `backendOperations.js` | `router` | GET | `/jobs` |
| `backendOperations.js` | `router` | GET | `/incidents` |
| `backendOperations.js` | `router` | GET | `/incidents/:id/alerts` |
| `backendOperations.js` | `router` | POST | `/incidents/:id/acknowledge` |
| `backendOperations.js` | `router` | POST | `/inventory/recover` |
| `backendOperations.js` | `router` | POST | `/jobs/:id/retry` |
| `bloodCampaignRoutes.js` | `router` | GET | `/` |
| `bloodCampaignRoutes.js` | `router` | GET | `/:id` |
| `bloodCampaignRoutes.js` | `router` | POST | `/` |
| `bloodCampaignRoutes.js` | `router` | POST | `/propose` |
| `bloodCampaignRoutes.js` | `router` | PATCH | `/:id/status` |
| `bloodCampaignRoutes.js` | `router` | PATCH | `/:id` |
| `bloodRequestRoutes.js` | `router` | POST | `/urgent` |
| `bloodRequestRoutes.js` | `router` | POST | `/standard` |
| `bloodRequestRoutes.js` | `router` | POST | `/` |
| `bloodRequestRoutes.js` | `router` | GET | `/` |
| `bloodRequestRoutes.js` | `router` | PATCH | `/:id/status` |
| `bloodRequestRoutes.js` | `router` | GET | `/:reference` |
| `capacity.js` | `router` | GET | `/diagnostic/:organizationId/daily` |
| `capacity.js` | `router` | PUT | `/diagnostic/:organizationId/daily` |
| `capacity.js` | `router` | POST | `/hospital/:organizationId/configure` |
| `capacity.js` | `router` | POST | `/requests/EmergencyRequest/:requestId/:action` |
| `careers.js` | `jobsRouter` | GET | `/` |
| `careers.js` | `jobsRouter` | GET | `/organizations` |
| `careers.js` | `jobsRouter` | GET | `/manage` |
| `careers.js` | `jobsRouter` | POST | `/` |
| `careers.js` | `jobsRouter` | GET | `/:id` |
| `careers.js` | `jobsRouter` | PATCH | `/:id/availability` |
| `careers.js` | `jobsRouter` | PATCH | `/:id` |
| `careers.js` | `jobsRouter` | POST | `/:id/status` |
| `careers.js` | `jobsRouter` | POST | `/:id/apply` |
| `careers.js` | `jobsRouter` | GET | `/:id/applications` |
| `careers.js` | `applicationsRouter` | GET | `/mine` |
| `careers.js` | `applicationsRouter` | PATCH | `/:id` |
| `contracts.js` | `router` | GET | `/v1/openapi.json` |
| `diagnosticRequests.js` | `router` | POST | `/` |
| `diagnosticRequests.js` | `router` | GET | `/` |
| `diagnosticRequests.js` | `router` | PATCH | `/:id/status` |
| `diagnosticRequests.js` | `router` | PATCH | `/:reference/cancel` |
| `diagnosticRequests.js` | `router` | GET | `/:reference` |
| `email.js` | `router` | GET | `/status` |
| `email.js` | `router` | GET | `/deliveries` |
| `email.js` | `router` | POST | `/deliveries/:id/retry` |
| `email.js` | `router` | POST | `/deliveries/:id/resolve` |
| `emergencyCoordination.js` | `router` | GET | `/:sourceType/:sourceId` |
| `emergencyCoordination.js` | `router` | POST | `/:sourceType/:sourceId/acknowledge` |
| `emergencyRequests.js` | `router` | GET | `/` |
| `emergencyRequests.js` | `router` | POST | `/emergency` |
| `emergencyRequests.js` | `router` | POST | `/standard` |
| `emergencyRequests.js` | `router` | POST | `/` |
| `emergencyRequests.js` | `router` | GET | `/:id` |
| `emergencyRequests.js` | `router` | PATCH | `/:id` |
| `health.js` | `router` | GET | `/` |
| `health.js` | `router` | GET | `/live` |
| `health.js` | `router` | GET | `/ready` |
| `hospitalAdmin.js` | `router` | GET | `/hospitals` |
| `hospitalAdmin.js` | `router` | GET | `/hospitals/:id/facility-claims` |
| `hospitalAdmin.js` | `router` | POST | `/hospitals/:id/facility-claims` |
| `hospitalAdmin.js` | `router` | GET | `/ownership-claims` |
| `hospitalAdmin.js` | `router` | POST | `/ownership-claims` |
| `hospitalEnrichment.js` | `router` | GET | `/` |
| `hospitalEnrichment.js` | `router` | POST | `/:hospitalId` |
| `hospitalEnrichment.js` | `router` | GET | `/:candidateId` |
| `hospitalEnrichment.js` | `router` | POST | `/:candidateId/review` |
| `hospitalRoutes.js` | `router` | GET | `/` |
| `hospitalRoutes.js` | `router` | GET | `/:idOrSlug/enriched` |
| `hospitalRoutes.js` | `router` | GET | `/:slug` |
| `hospitalRoutes.js` | `router` | POST | `/` |
| `hospitalRoutes.js` | `router` | PUT | `/:id` |
| `hospitalRoutes.js` | `router` | PATCH | `/:id/beds` |
| `hospitalRoutes.js` | `router` | DELETE | `/:id` |
| `integrations.js` | `router` | GET | `/credentials/:kind/:organizationId` |
| `integrations.js` | `router` | POST | `/credentials/:kind/:organizationId` |
| `integrations.js` | `router` | DELETE | `/credentials/:kind/:organizationId/:id` |
| `integrations.js` | `router` | GET | `/inventory` |
| `integrations.js` | `router` | PUT | `/inventory/:resourceKey` |
| `inventory.js` | `router` | GET | `/:kind/:organizationId` |
| `inventory.js` | `router` | GET | `/:kind/:organizationId/:resourceKey/history` |
| `inventory.js` | `router` | PUT | `/:kind/:organizationId/:resourceKey` |
| `inventoryImports.js` | `router` | GET | `/catalogue` |
| `inventoryImports.js` | `router` | POST | `/:kind/:organizationId/preview` |
| `inventoryImports.js` | `router` | GET | `/:id` |
| `inventoryImports.js` | `router` | POST | `/:id/confirm` |
| `organizationCareers.js` | `organizationCareersRouter` | GET | `/careers` |
| `organizationCareers.js` | `organizationCareersRouter` | POST | `/:id/apply` |
| `organizationCareers.js` | `organizationCareersRouter` | GET | `/:id/applications` |
| `organizationCareers.js` | `orgApplicationsRouter` | PATCH | `/:id` |
| `privacy.js` | `router` | GET | `/retention-policy` |
| `privacy.js` | `router` | POST | `/exports` |
| `privacy.js` | `router` | POST | `/exports/:id/download` |
| `providerAdmin.js` | `providerAccountRouter` | POST | `/manual-provision` |
| `providerAdmin.js` | `providerAccountRouter` | POST | `/:id/credentials` |
| `providerAdmin.js` | `providerAccountRouter` | GET | `/` |
| `providerAdmin.js` | `providerAccountRouter` | POST | `/` |
| `providerAdmin.js` | `providerAccountRouter` | POST | `/:id/actions` |
| `providerAdmin.js` | `providerAccountRouter` | POST | `/:id/assignments` |
| `providerAdmin.js` | `providerAccountRouter` | PATCH | `/:id/assignments/:membershipId` |
| `providerAdmin.js` | `providerRouter` | GET | `/mine` |
| `providerAdmin.js` | `providerRouter` | GET | `/:kind/:id/report` |
| `providerAdmin.js` | `providerRouter` | POST | `/applications` |
| `providerAdmin.js` | `providerApprovalRouter` | GET | `/organizations` |
| `providerAdmin.js` | `providerApprovalRouter` | POST | `/organizations/:kind/:id/approve` |
| `providerAdmin.js` | `providerApprovalRouter` | GET | `/` |
| `providerAdmin.js` | `providerApprovalRouter` | POST | `/:id/review` |
| `providerAdoption.js` | `router` | GET | `/groups` |
| `providerAdoption.js` | `router` | PUT | `/groups/:id` |
| `providerAdoption.js` | `router` | GET | `/:kind/:organizationId/quality` |
| `providerAdoption.js` | `router` | GET | `/:kind/:organizationId/reporting-readiness` |
| `providerAdoption.js` | `router` | GET | `/:kind/:organizationId/onboarding` |
| `providerAdoption.js` | `router` | PUT | `/:kind/:organizationId/onboarding` |
| `providerAdoption.js` | `router` | POST | `/memberships/:id/offboard` |
| `providerAdoption.js` | `router` | PATCH | `/memberships/:id/access` |
| `refinement.js` | `router` | GET | `/status` |
| `refinement.js` | `router` | GET | `/candidates` |
| `refinement.js` | `router` | POST | `/claims/:id` |
| `refinement.js` | `router` | POST | `/candidates/:id/review` |
| `resendWebhook.js` | `resendWebhookRouter` | POST | `/` |
| `resources.js` | `router` | GET | `/` |
| `resources.js` | `router` | POST | `/book` |
| `resources.js` | `router` | PATCH | `/bookings/:id/status` |
| `resources.js` | `router` | GET | `/bookings` |
| `resources.js` | `router` | GET | `/bookings/:reference` |
| `resources.js` | `router` | GET | `/:id` |
| `resources.js` | `resourceAdminRouter` | POST | `/` |
| `resources.js` | `resourceAdminRouter` | PATCH | `/:id` |
| `resources.js` | `resourceAdminRouter` | DELETE | `/:id` |
| `routing.js` | `router` | GET | `/hospital/:id` |
| `tracking.js` | `router` | GET | `/:type/:reference` |
| `userRoutes.js` | `router` | GET | `/me/saved` |
| `userRoutes.js` | `router` | POST | `/me/saved/:hospitalId` |
| `userRoutes.js` | `router` | DELETE | `/me/saved/:hospitalId` |

## MongoDB model modules

`Alert`, `AmbulanceBooking`, `AuditLog`, `AuthToken`, `AvailabilityObservation`, `BackendLatencyBucket`, `BackgroundJob`, `BloodCampaign`, `BloodRequest`, `DataConflict`, `DataExport`, `DataSource`, `DiagnosticDailyCapacity`, `DiagnosticRequest`, `EmailDelivery`, `EmailWebhookEvent`, `EmergencyCoordination`, `EmergencyCoverage`, `EmergencyRequest`, `FacilitySourceClaim`, `Hospital`, `HospitalEnrichment`, `HospitalFacility`, `HospitalFieldClaim`, `HospitalFieldConflict`, `IntegrationCredential`, `InventoryImport`, `InventoryObservation`, `Job`, `JobApplication`, `OperationalAlertReceipt`, `OperationalIncident`, `OrganizationApplication`, `OrganizationUsage`, `OwnershipClaim`, `PrivilegedSecurity`, `ProviderApplication`, `ProviderMembership`, `RateLimitBucket`, `RefinementCandidate`, `RequestNotification`, `ResourceInventory`, `ResourceProvider`, `ResourceReservation`, `User`, `WorkerHeartbeat`, `providerAdoptionModels`, `requestStatusEffectsSchema`.

See [Database schema](../database-schema.md) for relationship diagrams and the model modules for enforceable fields and indexes.
