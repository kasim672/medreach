import { test, expect } from "@playwright/test";

test("ambulance confirmations distinguish queued, accepted and uncertain notification outcomes", async ({ page }) => {
  let status = "pending";
  await page.route(url => url.hostname === "localhost" && url.pathname === "/api/ambulances/book", route => route.fulfill({
    json: { reference: "AMB-ISOLATED-FEEDBACK", delivery: { provider: { status, sent: status === "sent" } } },
  }));
  for (const [state, message] of [
    ["pending", "The provider notification email is queued."],
    ["sent", "The mail service accepted the provider notification."],
    ["uncertain", "The provider notification outcome is unconfirmed."],
  ]) {
    status = state;
    await page.goto("/ambulances");
    await page.getByRole("button", { name: "Book Ambulance" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder(/Enter patient name|Rahul Sharma/).fill("Isolated notification fixture");
    await dialog.getByPlaceholder("Age in years").fill("42");
    await dialog.getByPlaceholder(/9876543210|98200 12345/).fill("9876540303");
    await dialog.locator("select").selectOption("yes");
    await dialog.getByPlaceholder(/Enter address|Street address|Apartment, Street/).fill("Isolated test address");
    await dialog.getByRole("button", { name: /Submit Booking|Confirm Booking/ }).click();
    await expect(dialog.getByText(new RegExp(message.replace(/[.]/g, "\\.")))).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Track request" })).toBeVisible();
    await expect(dialog).not.toContainText("dispatch confirmed");
  }
});

test("ambulance modal contains keyboard focus and restores it when dismissed", async ({ page }) => {
  await page.goto("/ambulances");
  const trigger = page.getByRole("button", { name: "Book Ambulance" }).first();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: /Book Ambulance/i });
  await expect(dialog).toBeVisible();
  const containsFocus = () => dialog.evaluate((element) => element.contains(document.activeElement));
  expect(await containsFocus()).toBe(true);
  for (const key of ["Shift+Tab", "Tab", "Tab"]) {
    await page.keyboard.press(key);
    expect(await containsFocus()).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("a confirmed ambulance booking keeps its private link when session storage is unavailable", async ({ page }) => {
  const reference = "AMB-ISOLATED-RECEIPT";
  const token = "synthetic-receipt-token";
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("medreach:ambulance-booking-token:")) {
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      }
      return setItem.call(this, key, value);
    };
  });
  await page.route("**/api/ambulances/book", (route) => route.fulfill({
    json: { reference, trackingToken: token, delivery: { provider: { status: "pending" } } },
  }));
  await page.goto("/ambulances");
  await page.getByRole("button", { name: "Book Ambulance" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder(/Enter patient name|Rahul Sharma/).fill("Synthetic Booking");
  await dialog.getByPlaceholder("Age in years").fill("42");
  await dialog.getByPlaceholder(/9876543210|98200 12345/).fill("9876540303");
  await dialog.getByRole("button", { name: /Submit Booking|Confirm Booking/ }).click();
  await expect(dialog.getByText(new RegExp(`Request ${reference} was recorded`))).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Track request" })).toHaveAttribute("href", `/track?type=ambulance&reference=${reference}#token=${token}`);
});

test("urgent blood requests have labelled controls and retain the private receipt without session storage", async ({ page }, info) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("medreach:blood-request-token:")) {
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      }
      return setItem.call(this, key, value);
    };
  });
  await page.route("**/api/blood-requests/urgent", (route) => route.fulfill({
    json: { reference: "BR-ISOLATED-RECEIPT", trackingToken: "synthetic-blood-receipt" },
  }));
  await page.goto("/urgent-blood");
  if (info.project.name === "tailwind") {
    await expect(page.getByRole("heading", { name: "Urgent Blood Requisition", level: 1 })).toHaveCSS("color", "rgb(255, 255, 255)");
  }
  await page.getByRole("textbox", { name: /Patient full name/i }).fill("Synthetic patient");
  await page.getByRole("textbox", { name: /Hospital \/ Clinic Admitted/i }).fill("Synthetic hospital");
  await page.getByRole("textbox", { name: /Attendant.*phone number/i }).fill("9876540303");
  await page.getByRole("button", { name: /Submit Urgent Blood Requirement/i }).click();
  await expect(page.getByRole("main").getByRole("link", { name: "Track request" })).toHaveAttribute("href", /#token=synthetic-blood-receipt$/);
});
