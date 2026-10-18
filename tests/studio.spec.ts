import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
});
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const dir = ".impeccable/review/studio";
test("offline studio drafts can be edited, saved, restored and used without internet", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Packs", exact: true }).click();
  await page.getByRole("button", { name: "Mix my pack" }).click();
  await expect(page.locator(".draft-words li")).toHaveCount(24);
  const first = await page.locator(".draft-words li").allTextContents();
  await page.getByRole("button", { name: "Edit & save this draft" }).click();
  await expect(page.getByLabel("Pack name", { exact: true })).toHaveValue(
    "Snack attack",
  );
  await page.getByLabel("Pack name", { exact: true }).fill("Our snacks");
  await page.getByRole("button", { name: "Save pack", exact: true }).click();
  await expect(
    page.getByText("Pack saved. Choose it in Imposter or Heads Up settings."),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Packs", exact: true }).click();
  await page.getByRole("button", { name: "Saved (1)", exact: true }).click();
  await expect(page.getByText("Our snacks", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mix a pack", exact: true }).click();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.getByRole("button", { name: "Screen time", exact: true }).click();
  await page.getByRole("button", { name: "Mix my pack" }).click();
  await expect(page.locator(".draft-words li")).toHaveCount(24);
  expect(await page.locator(".draft-words li").allTextContents()).not.toEqual(
    first,
  );
  await page.getByRole("button", { name: "AI theme", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Generate AI draft" }),
  ).toBeDisabled();
  await context.setOffline(false);
});
test("studio renders at phone and desktop sizes, and explains unavailable AI", async ({
  page,
}) => {
  fs.mkdirSync(dir, { recursive: true });
  await page.route("**/api/pack-studio/status", (route) =>
    route.fulfill({ json: { available: false } }),
  );
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.getByRole("button", { name: "Packs", exact: true }).click();
    await page.waitForTimeout(400);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `${dir}/studio-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "AI theme", exact: true }).click();
  await expect(
    page.getByText("AI mixing isn’t connected on this site.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate AI draft" }),
  ).toBeDisabled();
  await page.screenshot({ path: `${dir}/ai-unavailable.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Offline mix", exact: true }).click();
  await page.getByRole("button", { name: "Mix my pack" }).click();
  await page.screenshot({ path: `${dir}/draft.png`, fullPage: true });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.screenshot({ path: `${dir}/dark.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("AI studio previews mocked output, handles limits and allows cancellation", async ({
  page,
}) => {
  await page.route("**/api/pack-studio/status", (route) =>
    route.fulfill({ json: { available: true } }),
  );
  let fail = false;
  await page.route("**/api/pack-studio", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      theme: "Space party",
      count: 24,
      exclude: fail ? ["Moon", "Rocket", "Comet", "Star", "Orbit", "Planet"] : [],
    });
    await route.fulfill(
      fail
        ? {
            status: 429,
            json: { error: "Free limit reached. Try an offline mix." },
          }
        : {
            json: {
              draft: {
                name: "Space party",
                words: ["Moon", "Rocket", "Comet", "Star", "Orbit", "Planet"],
                adult: false,
              },
            },
          },
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Packs", exact: true }).click();
  await page.getByRole("button", { name: "AI theme", exact: true }).click();
  await page.getByLabel("Your theme").fill("Space party");
  await page.getByRole("button", { name: "Generate AI draft" }).click();
  await expect(
    page.getByRole("heading", { name: "Meet “Space party”" }),
  ).toBeVisible();
  await expect(page.locator(".draft-words li")).toHaveCount(6);
  fail = true;
  await page.getByRole("button", { name: "Generate AI draft" }).click();
  await expect(page.getByRole("alert")).toContainText("Free limit reached");
  await page.unroute("**/api/pack-studio");
  await page.route("**/api/pack-studio", () => {});
  await page.getByRole("button", { name: "Generate AI draft" }).click();
  await page.getByRole("button", { name: "Cancel generation" }).click();
  await expect(
    page.getByRole("button", { name: "Generate AI draft" }),
  ).toBeEnabled();
  await expect(page.getByRole("alert")).toContainText("Generation stopped");
});
