import test from "node:test";
import assert from "node:assert/strict";
import { safeWebUrl } from "../../packages/core/src/webUrl.js";
import { safeWebUrl as bootstrapSafeWebUrl } from "../../variants/bootstrap/_core/webUrl.js";

for (const [name, validate] of [["shared core", safeWebUrl], ["Bootstrap", bootstrapSafeWebUrl]]) {
  test(`${name} keeps valid provider website links and rejects unsupported destinations`, () => {
    assert.equal(validate(" https://hospital.example/about "), "https://hospital.example/about");
    assert.equal(validate("http://clinic.example/"), "http://clinic.example/");

    for (const value of [null, {}, "", "/contact", "//example.test", "ftp://example.test/", "https://", "https://name@clinic.example/"]) {
      assert.equal(validate(value), null);
    }
  });
}
