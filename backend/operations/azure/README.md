# Azure deployment

Production uses the Central India Ubuntu 24.04 VM `medreach-backend`
(Standard B2als_v2, 2 vCPUs, 4 GiB RAM). All three Vercel frontends share
[the HTTPS API](https://medreach-backend.centralindia.cloudapp.azure.com).
Caddy proxies requests to Express. The API and each of the three workers run
as separate systemd services. MongoDB runs as an authenticated, single-member
replica set on the same VM and listens on loopback.

The tested VM still runs a pinned revision from before this directory was
renamed. Install the updated systemd template before restarting services after
updating its checkout. After merging to main, the VM still needs its own
reviewed software update. GitHub and Vercel deployments do not update the VM.

## VM and networking

Allow inbound TCP 80/443 and restrict SSH to the operator's IP in both Azure
network security group and the host firewall. Keep ports 4000 and 27017 inaccessible
from the internet. Point an owned API hostname to the VM's public IP.

Install Git, a supported system-wide Node release >=22.19.0 at `/usr/bin/node`,
Caddy, MongoDB Database Tools and a supported MongoDB Community release.
Check the CPU architecture and MongoDB supported OS/kernel matrix first.
Match the source MongoDB major version during migration or follow its supported
upgrade procedure. ARM64 MongoDB requires ARMv8.2-A or later.

## Application processes

Clone the repository to `/opt/medreach`. Create a dedicated `medreach` system
user/group. Keep source code owned by the deployment operator and readable by
the service user. Install locked production backend dependencies from the root
with `npm ci --omit=dev --workspace @medreach/backend --include-workspace-root=false`.

Create `/etc/medreach/runtime.env`, owned by root with mode 0600. Copy the
current production environment securely into this systemd EnvironmentFile.
Use systemd environment-file quoting, with one KEY=value per line and no
`export` statements. Preserve JWT, email-envelope and other encryption keys
needed for existing accounts and queued notifications. Preserve current feature
flags, mail configuration, exact CORS origins and canonical frontend URL.
Set `NODE_ENV=production`, `PORT=4000`, `COOKIE_SAME_SITE=none` and
`TRUST_PROXY=127.0.0.1/32,::1/128` for the direct Caddy-to-API topology. Configure an
authenticated `MONGODB_URI` for the chosen database. For the local replica set,
include `authSource=admin&replicaSet=medreach-rs` and URL-encode credentials.

Install `medreach@.service` into `/etc/systemd/system/`. Install the edited
Caddyfile as `/etc/caddy/Caddyfile`, then run `caddy validate --config
/etc/caddy/Caddyfile`. Reload Caddy after hostname/DNS configuration.

After restoring and verifying the database, run:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now medreach@api medreach@notification medreach@expiry medreach@recovery
sudo systemctl status medreach@api medreach@notification medreach@expiry medreach@recovery
curl --fail https://YOUR_API_HOST/health/ready
```

The existing API/worker startup checks verify required indexes. Diagnose a
missing index using the existing migration dry-run tooling before applying an
additive migration. Do not bypass startup checks.

## Database migration

1. Inspect the current Atlas tier, alert metric, database name, MongoDB version,
   collection sizes and indexes. Record the selected source and destination.
2. On the new VM, create MongoDB's keyfile with a random secret, owned by the
   packaged MongoDB service user with mode 0400. Merge `mongod.conf.template`
   into the installed MongoDB configuration and start MongoDB.
3. Using MongoDB's localhost exception on this new empty instance, initiate
   `medreach-rs` with member `localhost:27017`, wait for PRIMARY, and create the
   initial administrator. Authenticate as that administrator to create a
   dedicated application user with readWrite on the intended application DB.
   Use interactive password prompts. Keep credentials outside shell history.
4. Pause every source writer, including local processes and integrations.
   Reuse `backend/scripts/verifiedBackup.js` to create an encrypted backup and
   verify restoration on its explicitly isolated test database. Keep the
   receipt, archive and separately protected encryption key. The existing
   verifier requires the source to remain quiesced during comparison.
5. Restore the verified archive into the explicit empty destination. The current
   retained-backup tool accepts only a local isolated test database without
   credentials. A production restore command supporting the authenticated target
   must be prepared after target details are known. Authenticate the entire
   encrypted archive before writing restored documents, as the existing tool
   does. Keep destination email/workers disabled during verification. Preserve
   BSON IDs, index definitions and collection options. Compare document-content
   digests, counts and indexes against the quiesced source using the existing
   backup digest helpers.
6. Run application reads and controlled transaction tests on the isolated
   restored dataset. Verify concurrent last-slot booking, cancellation/expiry
   release, authentication and worker restart/recovery. Enable only one set of
   live workers after verification to avoid mixed-environment delivery.

This replica set has one member. A VM failure interrupts both API and database.
Arrange retained, encrypted off-host backups and isolated restore drills before
accepting live writes. Preserve source data through migration verification.

## Cutover and rollback

Record baseline request latency and measure the new API from India, including
an idle interval. Verify all three worker heartbeats and notification handling.
Update `NEXT_PUBLIC_API_URL` for the existing Vercel projects and rebuild them.
Verify browser cookie/CORS behavior, login, directories, booking and tracking.

Before destination writes begin, rollback can restore the previous API and
frontend configuration. After destination writes begin, pause writes and
reconcile new records before reverting the database target. A frontend revert
alone must not send users to a stale database.

## References

- https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal
- https://www.mongodb.com/docs/manual/administration/production-notes/
- https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set-with-keyfile-access-control/
