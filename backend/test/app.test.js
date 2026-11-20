// Wiring tests — no database required (supertest against the in-process app).
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { env } from "../src/config/env.js";
import { createApp } from "../src/app.js";

const app = createApp();

test("GET /health → 200 ok", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test("health exposes separate liveness and dependency readiness", async () => {
  const live = await request(app).get("/health/live");
  assert.equal(live.status, 200);
  assert.equal(live.body.ok, true);
  assert.equal(live.body.check, "liveness");

  const ready = await request(app).get("/health/ready");
  assert.equal(ready.status, 503);
  assert.equal(ready.body.ok, false);
  assert.equal(ready.body.check, "readiness");
  assert.equal(ready.body.dependencies.mongodb, "disconnected");
});

test("unknown route → 404 JSON", async () => {
  const res = await request(app).get("/does-not-exist");
  assert.equal(res.status, 404);
  assert.match(res.body.error, /Not found/);
});

test("helmet security headers present (the experimental constant)", async () => {
  const res = await request(app).get("/health");
  assert.ok(res.headers["content-security-policy"], "CSP header should be set");
  assert.equal(res.headers["x-content-type-options"], "nosniff");
});

test("health samples are not cacheable, including failed readiness", async () => {
  for (const path of ["/health", "/health/live", "/health/ready"]) {
    const response = await request(app).get(path);
    assert.equal(response.headers["cache-control"], "no-store", path);
  }
});

test("cookie mutation origin policy preserves same-origin and headerless clients", async () => {
  for (const [site, expected] of [[null, 404], ["same-origin", 404], ["same-site", 403], ["cross-site", 403]]) {
    const mutation = request(app).post("/health/live").set("Cookie", "token=synthetic");
    if (site) mutation.set("Sec-Fetch-Site", site);
    assert.equal((await mutation).status, expected, String(site));
  }
});

test("explicit allowed origins take priority and untrusted origins are refused", async () => {
  const allowedOrigin = env.corsOrigins[0];
  assert.ok(allowedOrigin);
  const allowed = await request(app).post("/health/live").set("Cookie", "token=synthetic")
    .set("Origin", allowedOrigin).set("Sec-Fetch-Site", "cross-site");
  assert.equal(allowed.status, 404);
  const denied = await request(app).post("/health/live").set("Cookie", "token=synthetic")
    .set("Origin", "https://untrusted.example.test").set("Sec-Fetch-Site", "same-origin");
  assert.equal(denied.status, 403);
});
