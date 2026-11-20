export default async function globalSetup() {
  if (!process.env.MEDREACH_E2E_MONGO_URI) {
    throw new Error("Set MEDREACH_E2E_MONGO_URI to an isolated database with a MedReach E2E fixture name.");
  }
  await import("../../scripts/e2e-seed.mjs");
}
