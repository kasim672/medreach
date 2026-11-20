import { test, expect } from "@playwright/test";
const API = process.env.MEDREACH_HOME_TEST_API_URL || "http://localhost:4000";

test.beforeEach(async ({ context }, testInfo) => {
  const variant = ["bootstrap", "tailwind", "skeleton"].indexOf(testInfo.project.name) + 1;
  await context.setExtraHTTPHeaders({ "X-Forwarded-For": `198.21.${variant}.1` });
});

test("frontend pages enforce framing and MIME protections without blocking their content", async ({ page }) => {
  for (const path of ["/", "/login", "/track"]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("no-referrer");
    const directives = headers["content-security-policy"].split(";").map((value) => value.trim());
    expect(directives).toEqual(expect.arrayContaining([
      "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'",
    ]));
    expect(headers["strict-transport-security"]).toMatch(/^max-age=\d+;.*includeSubDomains/);
    expect(headers["permissions-policy"]).toContain("camera=(), microphone=()");
    expect(headers["x-powered-by"]).toBeUndefined();
    await expect(page.locator("#main")).toBeVisible();
  }
});

test("staff cannot open unsafe legacy resume links while PDF downloads remain available", async ({ page }) => {
  await page.goto("/login?returnTo=%2Fhospital%2Fjobs");
  await page.locator("#email").fill(`${test.info().project.name}.staff.e2e@medreach.test`);
  await page.locator("#password").fill("E2E_SafePassword_123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/hospital\/jobs$/);
  const jobId = "507f1f77bcf86cd799439011";
  const inertName = "Valid PDF <medreach-audit-marker>";
  // These are explicit legacy security fixtures, never persisted as live provider data.
  await page.route(`${API}/api/jobs/manage`, (route) => route.fulfill({ json: { data: [{
    _id: jobId, title: "Resume security fixture", status: "published", category: "Nurse", employmentType: "full_time",
    hospital: { name: "Test hospital" },
  }] } }));
  await page.route(`${API}/api/jobs/${jobId}/applications`, (route) => route.fulfill({ json: { data: [
    { _id: "507f1f77bcf86cd799439012", candidateName: "Unsafe legacy document", status: "submitted", resume: { fileUrl: "data:text/html;base64,PHNjcmlwdD4=", fileName: "unsafe.html" } },
    { _id: "507f1f77bcf86cd799439013", candidateName: inertName, status: "submitted", resume: { fileUrl: "data:application/pdf;base64,JVBERi0xLjQK", fileName: "cv.pdf" } },
  ] } }));
  await page.reload();
  await page.getByRole("button", { name: "Review Applicants", exact: true }).click();
  await expect(page.getByText("Unsafe legacy document", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="data:text/html"]')).toHaveCount(0);
  await expect(page.locator('a[href^="data:application/pdf"]')).toHaveCount(1);
  await expect(page.getByText(inertName, { exact: true })).toBeVisible();
  await expect(page.locator("medreach-audit-marker")).toHaveCount(0);
});

test("browser API responses retain API CSP and private caching policy", async ({ page }) => {
  const publicResponse = await page.goto(`${API}/health/live`);
  expect(publicResponse.status()).toBe(200);
  const headers = publicResponse.headers();
  expect(headers["cache-control"]).toBe("no-store");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  const directives = headers["content-security-policy"].split(";").map((value) => value.trim());
  expect(directives).toEqual(expect.arrayContaining(["default-src 'self'", "script-src 'self'", "frame-ancestors 'none'"]));

  const privateResponse = await page.goto(`${API}/api/auth/me`);
  expect(privateResponse.status()).toBe(401);
  expect(privateResponse.headers()["cache-control"]).toBe("no-store");
});
