import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("first visit teaches hold privacy, dismisses persistently and can reopen", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  const hold = page.getByRole("button", { name: "Hold to try it" });
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(page.getByText("PINEAPPLE", { exact: true })).toBeVisible();
  await page.keyboard.up("Space");
  await expect(page.getByText("TOP SECRET", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Add my crew", exact: true }).click();
  await expect(page.getByLabel("Player name", { exact: true })).toBeVisible();
  await page.reload();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "How it works", exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});
test("welcome can be skipped on a small phone without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Skip welcome" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Skip welcome" }).click();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
