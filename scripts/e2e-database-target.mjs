const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
const fixtureName = /^medreach_(?:[a-z0-9]+_)*e2e(?:_[a-z0-9]+)*$/;

export function validateE2eDatabaseTarget(uri) {
  if (!uri) throw new Error("MEDREACH_E2E_MONGO_URI is required");

  let target;
  try {
    target = new URL(uri);
  } catch {
    throw new Error("The E2E database target is not a valid MongoDB URI");
  }

  const database = target.pathname.slice(1);
  if (target.protocol !== "mongodb:" || !loopbackHosts.has(target.hostname)
    || target.username || target.password || target.search || target.hash || !fixtureName.test(database)) {
    throw new Error("E2E seeding requires an unauthenticated loopback MongoDB URI for a MedReach E2E fixture database");
  }
  return database;
}
