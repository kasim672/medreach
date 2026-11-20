import assert from "node:assert/strict";
import test from "node:test";
import { validateE2eDatabaseTarget } from "../../scripts/e2e-database-target.mjs";

test("E2E seeding accepts the documented loopback fixture databases", () => {
  for (const uri of [
    "mongodb://127.0.0.1:27129/medreach_e2e_verification",
    "mongodb://localhost:27017/medreach_lifecycle_e2e",
    "mongodb://[::1]:27017/medreach_e2e",
  ]) {
    assert.match(validateE2eDatabaseTarget(uri), /^medreach_/);
  }
});

test("E2E seeding refuses non-fixtures and unsupported connection options without leaking input", () => {
  for (const uri of [
    undefined,
    "mongodb://127.0.0.1:27017/medreach",
    "mongodb://example.test/medreach_e2e",
    "mongodb+srv://example.test/medreach_e2e",
    "mongodb://127.0.0.1/medreach_e2e?replicaSet=example",
    "mongodb://fixture_user:fixture_secret@localhost/medreach_e2e",
  ]) {
    assert.throws(() => validateE2eDatabaseTarget(uri), (error) =>
      !error.message.includes("fixture_secret") && /E2E|fixture/.test(error.message));
  }
});
