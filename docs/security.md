# Security

[Documentation](README.md) · [Project overview](../README.md)

## Roles and organisation isolation

New account roles are `system_admin`, `provider_admin` and `user`.
Public registration cannot select an administrator role. Platform APIs require
System Admin independently of frontend visibility.

Provider membership includes user, organisation ID, kind and active state.
Protected provider requests, reports, availability and Careers operations check
that scope on the backend. An organisation switcher is a convenience, not an
authorization control.

Legacy `admin` and `user_admin` records do not confer global privileges.
Existing `hospital_admin` compatibility is limited to historical assigned
hospital relationships. Do not silently promote or delete legacy accounts.
Inventory their references before an approved migration.

System Admin role/status mutations use a serialized guard to protect the last
active System Admin against concurrent deactivation/demotion. Preserve the main
`/admin` dashboard; there is no replacement User Admin role.

## Account lifecycle

- bcrypt password hashing retains its existing cost; performance work does not
  weaken password verification.
- Access JWTs require a valid active database-backed session and current
  account status/version. Refresh sessions rotate and can be revoked.
- Activation, recovery and notification-address verification use hashed,
  expiring tokens. Contact/state/version checks prevent old links from taking
  effect after an account or contact changes.
- Generic user management cannot bypass provider activation.
- Password resets, account/assignment changes revoke applicable stale sessions.
- Production invitations require eligible contacts; `.example` login IDs
  are not deliverable notification addresses.
- Shared demo defaults retain the isolated-database/email-disabled guard.
  Local manual credential handover has separate environment/transport checks.
  Generated secrets are returned only on generation/reset; only hashes persist.

## Private requests and patient information

| Viewer | Request visibility |
| --- | --- |
| Signed-in sender | Details of their own request |
| Assigned provider administrator | Details for the organisation they manage, subject to workflow and approval rules |
| System Admin | Request details through administrative controls |
| Guest with a private link | Details of the guest request associated with that link |
| Visitor with a public reference | Reference, status and last update only |

Signed-in diagnostic requests use the sender’s account for patient tracking.
Guest links are limited to guest records for diagnostic and ambulance requests.
The link is an access credential and belongs outside logs, screenshots and
shared public URLs. Archived hospital assignments no longer grant legacy staff
access to bed requests through the detail or list endpoints.

The API uses MongoDB through Mongoose. Query validation rejects non-scalar
filters and unsafe keys before controllers run. The local regression suite
checks input handling and request access across account roles.

Mutation validation and stale-state checks retain the existing request lifecycle.
An emergency classification is explicit; `ambulanceRequired` alone is insufficient.

## Notification reliability

Ordinary requests notify relevant eligible providers and the user. Explicit bed,
blood and ambulance emergencies also notify configured active System Admins.
Notification contacts/preferences and assignment eligibility are checked,
including before a delayed RequestNotification send.

Replay-safe messages use encrypted durable outbox content, deduplicated event
keys and atomic delivery leases. The worker processes only explicit queued rows,
in bounded batches, with bounded failure recovery. It does not replay arbitrary
historical rows. Permission/contact changes can invalidate a pending recipient.

Account links remain inline and non-replayable: no raw reset/activation token
is retained in an email retry envelope. Sensitive account actions may still
wait for the transport timeout.

Sent means SMTP/Resend acceptance. Definitive failures and ambiguous outcomes
are distinct; uncertain sends are not automatically repeated. Exactly-once
mail delivery cannot be guaranteed across a transport/persistence crash.
No new inbox-delivery claim is made by a successful HTTP response.

## HTTP and secrets

Security middleware enforces origin restrictions, rate limits, scalar query
parameters and security headers. Production must configure trusted proxy
boundaries and cross-site cookies correctly. Private/authenticated responses
remain `no-store`; public directory revalidation does not cache patient data.

Secrets belong in backend environment variables. Never expose MongoDB, SMTP,
Resend or JWT secrets through `NEXT_PUBLIC_*`. Rotating `JWT_SECRET` affects
sessions, guest credential recovery and encrypted email content.

Resume links/uploads retain existing safety validation. Directory-grounded AI
fallbacks do not invent providers or availability; enabling an external AI
service is a privacy decision described in [privacy](privacy.md).

Provider website links in public directories accept absolute HTTP and HTTPS
URLs without embedded credentials. Private request routes mark responses as
`no-store` before rejecting invalid input. Error logs for request delivery,
search, audit persistence and API startup use bounded error metadata. CI jobs
use read-only repository permissions and discard checkout credentials.

## Independent assessment

Use an isolated deployment with synthetic records, two provider organisations
and test accounts for every role. Give the assessor a fixed revision, the
enabled feature flags and written authorisation for the assessment. Ask for
each finding to include impact, affected role and route, and redacted evidence
with the requirements it covers. Use the [OWASP ASVS](https://asvs.owasp.org/)
to define the review scope.

| Priority | Area | Evidence to collect |
| --- | --- | --- |
| First | Privileged sign-in | Confirm deployed MFA policy, unique administrator credentials, recovery ownership, session revocation and recent reauthentication. Check System Admin and Provider Admin separately. |
| First | Record access | Verify permissions with two independent organisations, signed-out visitors, ordinary users and guest tracking links. Include resumes, exports, diagnostic requests and provider administration. |
| First | Deployment boundaries | Confirm that Caddy is the trusted ingress, the API and MongoDB ports are private, production CORS allows the intended frontends, and cookies and redirects work over HTTPS. |
| Next | Integrations and data recovery | Verify signed webhook handling, notification retries and delivery evidence, private backup storage, and a restore into an isolated environment. |
| Next | Repository settings | Review GitHub secret scanning, push protection, dependency alerts and release workflow permissions. Check for historical and operational secrets separately from dependency advisories. |

## Data and deployment boundaries

Stored provenance remains even though crawler execution and scraping badges are
removed. Do not seed/reset the recovered dataset or automatically migrate roles.
Standalone MongoDB does not provide crash-atomicity across every multi-document
business/audit operation.

See [verification](release-qa.md), [deployment](deployment.md) and
[stored data](stored-data.md). Automated checks do not establish absence of
vulnerabilities, regulatory certification or hosted readiness.
